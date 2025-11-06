import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quotation, QuotationDocument } from './quotation.schema';

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel(Quotation.name)
    private quotationModel: Model<QuotationDocument>,
  ) {}

  private async generateQuotationId(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const count = await this.quotationModel.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-${month}-${day}T00:00:00Z`),
        $lt: new Date(`${year}-${month}-${day}T23:59:59Z`),
      },
    });

    const number = String(count + 1).padStart(4, '0');
    return `QUO-${year}-${month}-${day}-${number}`;
  }

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const quotationId = await this.generateQuotationId();
    const createdQuotation = new this.quotationModel({ ...data, quotationId });
    return createdQuotation.save();
  }

  async findAll(): Promise<Quotation[]> {
    return this.quotationModel.find().populate('items.item').exec();
  }

  async findByQuotationId(quotationId: string): Promise<Quotation> {
    const quotation = await this.quotationModel
      .findOne({ quotationId })
      .populate('items.item')
      .exec();

    if (!quotation)
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    return quotation;
  }

  async updateByQuotationId(
    quotationId: string,
    data: Partial<Quotation>,
  ): Promise<Quotation> {
    const quotation = await this.quotationModel
      .findOneAndUpdate({ quotationId }, data, { new: true })
      .populate('items.item')
      .exec();

    if (!quotation)
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    return quotation;
  }

  async updateStatusByQuotationId(
    quotationId: string,
    status: string,
  ): Promise<Quotation> {
    const quotation = await this.quotationModel
      .findOneAndUpdate({ quotationId }, { status }, { new: true })
      .populate('items.item')
      .exec();

    if (!quotation)
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    return quotation;
  }

  async deleteByQuotationId(quotationId: string): Promise<void> {
    const quotation = await this.quotationModel
      .findOneAndDelete({ quotationId })
      .exec();

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }
  }
}
