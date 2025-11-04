import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>
  ) {}

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const createdInvoice = new this.invoiceModel(data);
    return createdInvoice.save();
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().populate('items.item').exec();
  }

  async findOne(id: string): Promise<Invoice | null> {
    return this.invoiceModel.findById(id).populate('items.item').exec();
  }

  async findByInvoiceId(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceModel.findOne({ invoiceId }).populate('items.item').exec();
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    return this.invoiceModel.findByIdAndUpdate(id, data, { new: true }).populate('items.item').exec();
  }

  async delete(id: string): Promise<Invoice | null> {
    return this.invoiceModel.findByIdAndDelete(id).exec();
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Invoice | null> {
    return this.invoiceModel.findByIdAndUpdate(
      id, 
      { paymentStatus }, 
      { new: true }
    ).populate('items.item').exec();
  }
}