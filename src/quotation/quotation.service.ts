import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quotation, QuotationDocument } from './quotation.schema';

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel(Quotation.name) private quotationModel: Model<QuotationDocument>
  ) {}

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const createdQuotation = new this.quotationModel(data);
    return createdQuotation.save();
  }

  async findAll(): Promise<Quotation[]> {
    return this.quotationModel.find().populate('items.item').exec();
  }

  async findByQuotationId(quotationId: string): Promise<Quotation | null> {
    return this.quotationModel.findOne({ quotationId }).populate('items.item').exec();
  }

  async updateByQuotationId(quotationId: string, data: Partial<Quotation>): Promise<Quotation | null> {
    return this.quotationModel.findOneAndUpdate(
      { quotationId }, 
      data, 
      { new: true }
    ).populate('items.item').exec();
  }

  async updateStatusByQuotationId(quotationId: string, status: string): Promise<Quotation | null> {
    return this.quotationModel.findOneAndUpdate(
      { quotationId }, 
      { status }, 
      { new: true }
    ).populate('items.item').exec();
  }

  async deleteByQuotationId(quotationId: string): Promise<Quotation | null> {
    return this.quotationModel.findOneAndDelete({ quotationId }).exec();
  }
}