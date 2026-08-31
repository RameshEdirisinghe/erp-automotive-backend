import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { InvoiceReturn, InvoiceReturnDocument } from './invoice-return.schema';
import { Invoice, InvoiceDocument } from '../invoice/invoice.schema';
import { InventoryItem, InventoryItemDocument } from '../inventory_items/inventory_items.schema';
import { Finance, FinanceDocument } from '../finance/finance.schema';
import { ReturnStatus } from '../common/enums/return-status.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class InvoiceReturnService {
  constructor(
    @InjectModel(InvoiceReturn.name) private readonly returnModel: Model<InvoiceReturnDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(InventoryItem.name) private readonly inventoryModel: Model<InventoryItemDocument>,
    private readonly financeService: FinanceService,
  ) {}

  async getNextReturnId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePrefix = `${year}-${month}-${day}`;
    const basePattern = new RegExp(String.raw`^RET-${datePrefix}-\d{4}$`);

    const lastReturn = await this.returnModel
      .findOne({ returnId: basePattern })
      .sort({ returnId: -1 })
      .select('returnId')
      .lean<{ returnId?: string }>();

    let nextNumber = 1;
    if (lastReturn?.returnId) {
      const parts = lastReturn.returnId.split('-');
      const lastNum = Number.parseInt(parts[4], 10);
      nextNumber = lastNum + 1;
    }

    const formattedNumber = String(nextNumber).padStart(4, '0');
    return `RET-${datePrefix}-${formattedNumber}`;
  }

  async create(data: Partial<InvoiceReturn>): Promise<InvoiceReturn> {
    if (!data.invoice || !isValidObjectId(data.invoice)) {
      throw new BadRequestException('Invalid invoice ID');
    }
    
    const invoice = await this.invoiceModel.findById(data.invoice).exec();
    if (!invoice) throw new BadRequestException('Invoice not found');

    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Return must contain at least one item');
    }

    // Check quantities against original invoice
    for (const returnItem of data.items) {
      const originalItem = invoice.items.find(i => i.item && i.item.toString() === returnItem.item.toString());
      if (!originalItem) {
        throw new BadRequestException(`Item ${returnItem.item} not found in the original invoice`);
      }

      // We should also check past returns to calculate remaining returnable qty
      const pastReturns = await this.returnModel.find({ 
        invoice: data.invoice, 
        status: { $ne: ReturnStatus.CANCELLED } 
      }).exec();
      
      let alreadyReturned = 0;
      for (const pr of pastReturns) {
        const matchingPrItem = pr.items.find(i => i.item.toString() === returnItem.item.toString());
        if (matchingPrItem) {
          alreadyReturned += matchingPrItem.quantity;
        }
      }

      if (returnItem.quantity > (originalItem.quantity - alreadyReturned)) {
        throw new BadRequestException(`Cannot return ${returnItem.quantity} of item ${returnItem.item}. Remaining returnable quantity is ${originalItem.quantity - alreadyReturned}.`);
      }
    }

    const returnId = await this.getNextReturnId();
    const now = new Date();

    const invoiceReturn = new this.returnModel({
      ...data,
      customer: invoice.customer, // bind to same customer
      returnId,
      status: ReturnStatus.PENDING,
      created_at: now,
      updated_at: now,
    });

    return invoiceReturn.save();
  }

  async findAll(): Promise<InvoiceReturn[]> {
    return this.returnModel
      .find()
      .populate('invoice')
      .populate('customer')
      .populate('items.item')
      .exec();
  }

  async findOne(id: string): Promise<InvoiceReturn> {
    const query = isValidObjectId(id) ? { _id: id } : { returnId: id };
    const invoiceReturn = await this.returnModel
      .findOne(query)
      .populate('invoice')
      .populate('customer')
      .populate('items.item')
      .exec();

    if (!invoiceReturn) throw new NotFoundException(`Return with ID ${id} not found.`);
    return invoiceReturn;
  }

  async findByInvoice(invoiceId: string): Promise<InvoiceReturn[]> {
    const query = isValidObjectId(invoiceId) ? { _id: invoiceId } : { invoiceId };
    const invoice = await this.invoiceModel.findOne(query).exec();
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.returnModel
      .find({ invoice: invoice._id })
      .populate('items.item')
      .populate('customer')
      .exec();
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<InvoiceReturn> {
    const query = isValidObjectId(id) ? { _id: id } : { returnId: id };
    const invoiceReturn = await this.returnModel.findOne(query).exec();

    if (!invoiceReturn) throw new NotFoundException(`Return with ID ${id} not found`);

    if (invoiceReturn.status === ReturnStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of a completed return.');
    }

    invoiceReturn.status = status;
    invoiceReturn.updated_at = new Date();

    if (status === ReturnStatus.COMPLETED) {
      // 1. Stock handling: Add returned quantities back to inventory
      for (const item of invoiceReturn.items) {
        await this.inventoryModel.findByIdAndUpdate(
          item.item,
          { $inc: { quantity: item.quantity } }
        ).exec();
      }

      // 2. Financial handling: Create a negative refund transaction if the invoice has payments
      const invoice = await this.invoiceModel.findById(invoiceReturn.invoice).exec();
      if (invoice) {
        // Find existing payments for this invoice
        if (invoice.paymentStatus !== PaymentStatus.PENDING) {
          const transactionId = await this.financeService.getNextTransactionId();
          await this.financeService.create({
            transactionId: `REF-${transactionId}`,
            transactionDate: new Date(),
            paymentMethod: {
              type: invoice.paymentMethod, // Original method or Cash
              bankName: 'Refund',
              accountNumber: 'Refund',
              transactionRef: invoiceReturn.returnId
            },
            invoice: { invoiceId: invoice.invoiceId },
            amount: (-invoiceReturn.returnTotal).toString()
          });
        }
      }
    }

    return invoiceReturn.save();
  }
}
