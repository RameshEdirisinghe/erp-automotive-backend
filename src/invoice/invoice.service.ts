import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

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
    paymentStatus: string,
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
