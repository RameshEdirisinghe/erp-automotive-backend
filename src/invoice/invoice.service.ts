import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import {
  SalesOverviewResponseDto,
  WeeklySalesDto,
} from './dto/sales-overview.dto';
import { Customer, CustomerDocument } from '../customer/customer.schema';
import {
  InventoryItem,
  InventoryItemDocument,
} from '../inventory_items/inventory_items.schema';

interface WeekRange {
  start: Date;
  end: Date;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,

    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItemDocument>,
  ) {}

  async getSalesOverview(): Promise<SalesOverviewResponseDto> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    const invoices = await this.invoiceModel
      .find({
        issueDate: {
          $gte: oneMonthAgo,
          $lte: today,
        },
      })
      .populate('items.item')
      .populate('customer')
      .exec();

    const weeks = this.calculateWeeks(oneMonthAgo, today);

    const weeklyData: WeeklySalesDto[] = weeks.map((week, index) => {
      const weekInvoices = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate >= week.start && invoiceDate <= week.end;
      });

      const sales = weekInvoices.reduce(
        (sum, invoice) => sum + (invoice.totalAmount || 0),
        0,
      );
      const products = weekInvoices.reduce(
        (sum, invoice) =>
          sum +
          (invoice.items || []).reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      );

      return {
        week: `Week ${index + 1}`,
        sales,
        products,
      };
    });

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0,
    );
    const totalProducts = invoices.reduce(
      (sum, invoice) =>
        sum +
        (invoice.items || []).reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    return {
      period: `${oneMonthAgo.toLocaleDateString()} - ${today.toLocaleDateString()}`,
      totalSales,
      totalProducts,
      weeklyData,
    };
  }

  private calculateWeeks(startDate: Date, endDate: Date): WeekRange[] {
    const weeks: WeekRange[] = [];
    const current = new Date(startDate);

    let weekCount = 1;
    while (current <= endDate && weekCount <= 4) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const actualWeekEnd = weekEnd > endDate ? new Date(endDate) : weekEnd;

      weeks.push({
        start: new Date(weekStart),
        end: new Date(actualWeekEnd),
      });

      current.setDate(current.getDate() + 7);
      weekCount++;
    }

    return weeks;
  }

  async getNextInvoiceId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePrefix = `${year}-${month}-${day}`;
    const basePattern = new RegExp(`^INV-${datePrefix}-\\d{4}$`);

    const lastInvoice = await this.invoiceModel
      .findOne({ invoiceId: basePattern })
      .sort({ invoiceId: -1 })
      .select('invoiceId')
      .lean<{ invoiceId?: string }>();

    let nextNumber = 1;
    if (lastInvoice?.invoiceId) {
      const parts = lastInvoice.invoiceId.split('-');
      const lastNum = Number.parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    const formattedNumber = String(nextNumber).padStart(4, '0');
    return `INV-${datePrefix}-${formattedNumber}`;
  }

  async create(data: any): Promise<Invoice> {
    // 1. Resolve Customer
    let customerObjectId: Types.ObjectId | undefined = undefined;
    let customerDetails = data.customerDetails || null;

    let rawCustomerId = data.customer;
    if (typeof rawCustomerId === 'object' && rawCustomerId !== null) {
      customerDetails = { ...rawCustomerId, ...customerDetails };
      rawCustomerId = rawCustomerId._id || rawCustomerId.id;
    }

    if (rawCustomerId && isValidObjectId(rawCustomerId)) {
      const existingCustomer = await this.customerModel.findById(rawCustomerId).exec();
      if (existingCustomer) {
        customerObjectId = existingCustomer._id as Types.ObjectId;
      }
    } else if (typeof rawCustomerId === 'string' && rawCustomerId.trim()) {
      const existingCustomer = await this.customerModel.findOne({
        $or: [
          { customerCode: rawCustomerId },
          { fullName: rawCustomerId },
          { shopName: rawCustomerId },
        ],
      }).exec();

      if (existingCustomer) {
        customerObjectId = existingCustomer._id as Types.ObjectId;
      }
    }

    // If still no ObjectId but customer name provided, create or find customer
    if (!customerObjectId && customerDetails) {
      const custName = customerDetails.fullName || customerDetails.shopName || 'Customer';
      let found = await this.customerModel.findOne({ fullName: custName }).exec();
      if (!found) {
        found = await this.customerModel.create({
          customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: custName,
          shopName: customerDetails.shopName || custName,
          phone: customerDetails.phone || '0700000000',
          creditLimit: customerDetails.creditLimit || 1000000,
        });
      }
      customerObjectId = found._id as Types.ObjectId;
    }

    // 2. Resolve Items & Stock
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('Invoice must contain at least one item.');
    }

    const processedItems: any[] = [];
    for (const rawItem of data.items) {
      let itemObjectId: Types.ObjectId | undefined = undefined;
      let rawItemId = rawItem.item || rawItem.id || rawItem._id;

      if (typeof rawItemId === 'object' && rawItemId !== null) {
        rawItemId = rawItemId._id || rawItemId.id;
      }

      if (rawItemId && isValidObjectId(rawItemId)) {
        const invItem = await this.inventoryItemModel.findById(rawItemId).exec();
        if (invItem) {
          itemObjectId = invItem._id as Types.ObjectId;
          // Decrement stock
          await this.inventoryItemModel.findByIdAndUpdate(invItem._id, {
            $inc: {
              quantity: -Math.abs(rawItem.quantity || 1),
              sold_count: Math.abs(rawItem.quantity || 1),
            },
          });
        }
      }

      const qty = Math.max(1, Number(rawItem.quantity) || 1);
      const unitPrice = Number(rawItem.unitPrice) || 0;
      const total = Number(rawItem.total) || qty * unitPrice;

      processedItems.push({
        item: itemObjectId,
        itemCode: rawItem.itemCode || rawItem.product_code || '',
        itemName: rawItem.itemName || rawItem.product_name || rawItem.name || 'Item',
        quantity: qty,
        unitPrice,
        discount: Number(rawItem.discount) || 0,
        total,
      });
    }

    // 3. Resolve invoice ID
    let invoiceId = data.invoiceId;
    if (!invoiceId || typeof invoiceId !== 'string' || !invoiceId.trim()) {
      invoiceId = await this.getNextInvoiceId();
    } else {
      const existing = await this.invoiceModel.findOne({ invoiceId }).exec();
      if (existing) {
        invoiceId = await this.getNextInvoiceId();
      }
    }

    // 4. Resolve dates
    const now = new Date();
    const issueDate = data.issueDate ? new Date(data.issueDate) : now;
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 5. Payment method & status
    let paymentMethod = data.paymentMethod || PaymentMethod.CASH;
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      paymentMethod = PaymentMethod.CASH;
    }

    let paymentStatus = data.paymentStatus || PaymentStatus.PENDING;
    if (!Object.values(PaymentStatus).includes(paymentStatus)) {
      paymentStatus = PaymentStatus.PENDING;
    }

    // 6. Salesman
    let salesmanId: Types.ObjectId | undefined = undefined;
    if (data.salesman && isValidObjectId(data.salesman)) {
      salesmanId = new Types.ObjectId(data.salesman);
    }

    const subTotal = Number(data.subTotal) || processedItems.reduce((acc, i) => acc + i.total, 0);
    const discount = Number(data.discount) || 0;
    const totalAmount = Number(data.totalAmount) || Math.max(0, subTotal - discount);

    const invoice = new this.invoiceModel({
      ...data,
      invoiceId,
      customer: customerObjectId,
      customerDetails,
      salesman: salesmanId,
      salesmanName: data.salesmanName || '',
      items: processedItems,
      subTotal,
      discount,
      totalAmount,
      paidAmount: Number(data.paidAmount) || (paymentStatus === PaymentStatus.COMPLETED || paymentStatus === PaymentStatus.PAID ? totalAmount : 0),
      remainingAmount: Number(data.remainingAmount) || (paymentStatus === PaymentStatus.COMPLETED || paymentStatus === PaymentStatus.PAID ? 0 : totalAmount),
      paymentMethod,
      paymentStatus,
      issueDate,
      dueDate,
      vehicleNumber: data.vehicleNumber || 'N/A',
      applyVat: !!data.applyVat,
      vatAmount: Number(data.vatAmount) || 0,
      taxRate: Number(data.taxRate) || 0,
      created_at: now,
      updated_at: now,
    });

    return invoice.save();
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel
      .find()
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .sort({ created_at: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Invoice> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };
    const invoice = await this.invoiceModel
      .findOne(query)
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .exec();

    if (!invoice)
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    return invoice;
  }

  async findByInvoiceId(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceId })
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .exec();

    if (!invoice)
      throw new NotFoundException(
        `Invoice with invoiceId "${invoiceId}" not found.`,
      );
    return invoice;
  }

  async findByPhone(phone: string): Promise<Invoice[]> {
    const customer = await this.customerModel.findOne({ phone }).exec();
    if (!customer) {
      throw new NotFoundException(`Customer with phone number "${phone}" not found.`);
    }

    const invoices = await this.invoiceModel
      .find({ customer: customer._id })
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .exec();

    if (!invoices || invoices.length === 0) {
      throw new NotFoundException(`No invoices found for phone number "${phone}".`);
    }

    return invoices;
  }

  async update(id: string, data: any): Promise<Invoice> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };

    const updateData = { ...data, updated_at: new Date() };
    if (data.issueDate === null) {
      updateData.issueDate = new Date();
    }

    const updated = await this.invoiceModel
      .findOneAndUpdate(query, updateData, { new: true })
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .exec();

    if (!updated)
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    return updated;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Invoice> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };
    const updated = await this.invoiceModel
      .findOneAndUpdate(
        query,
        { paymentStatus, updated_at: new Date() },
        { new: true },
      )
      .populate('items.item')
      .populate('customer')
      .populate('salesman')
      .exec();

    if (!updated)
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };
    const deleted = await this.invoiceModel.findOneAndDelete(query).exec();

    if (!deleted)
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    return { message: 'Deleted successfully' };
  }
}
