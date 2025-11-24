import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { SalesOverviewResponseDto, WeeklySalesDto } from './dto/sales-overview.dto';

interface WeekRange {
  start: Date;
  end: Date;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getSalesOverview(): Promise<SalesOverviewResponseDto> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    const invoices = await this.invoiceModel
      .find({
        paymentStatus: PaymentStatus.COMPLETED,
        issueDate: {
          $gte: oneMonthAgo,
          $lte: today,
        },
      })
      .populate('items.item')
      .exec();

    const weeks = this.calculateWeeks(oneMonthAgo, today);
    
    const weeklyData: WeeklySalesDto[] = weeks.map((week, index) => {
      const weekInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate >= week.start && invoiceDate <= week.end;
      });

      const sales = weekInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const products = weekInvoices.reduce((sum, invoice) => 
        sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

      return {
        week: `Week ${index + 1}`,
        sales,
        products,
      };
    });

    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalProducts = invoices.reduce((sum, invoice) => 
      sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

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
      const lastNum = parseInt(parts[4], 10);
      nextNumber = lastNum + 1;
    }

    const formattedNumber = String(nextNumber).padStart(4, '0');
    return `INV-${datePrefix}-${formattedNumber}`;
  }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const customId = await this.getNextInvoiceId();

    const existing = await this.invoiceModel.exists({ invoiceId: customId });
    if (existing) {
      throw new BadRequestException(`Invoice ID "${customId}" already exists.`);
    }

    const now = new Date();

    const issueDate = data.issueDate || now;

    const invoice = new this.invoiceModel({
      ...data,
      invoiceId: customId,
      issueDate: issueDate,
      created_at: now,
      updated_at: now,
    });

    return invoice.save();
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().populate('items.item').exec();
  }

  async findOne(id: string): Promise<Invoice> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };
    const invoice = await this.invoiceModel
      .findOne(query)
      .populate('items.item')
      .exec();

    if (!invoice)
      throw new NotFoundException(`Invoice with ID "${id}" not found.`);
    return invoice;
  }

  async findByInvoiceId(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceId })
      .populate('items.item')
      .exec();

    if (!invoice)
      throw new NotFoundException(
        `Invoice with invoiceId "${invoiceId}" not found.`,
      );
    return invoice;
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const query = isValidObjectId(id) ? { _id: id } : { invoiceId: id };

    const updateData = { ...data, updated_at: new Date() };
    if (data.issueDate === null) {
      updateData.issueDate = new Date();
    }

    const updated = await this.invoiceModel
      .findOneAndUpdate(query, updateData, { new: true })
      .populate('items.item')
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