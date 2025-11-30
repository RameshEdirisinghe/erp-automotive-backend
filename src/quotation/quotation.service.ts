import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quotation, QuotationDocument } from './quotation.schema';
import { QuotationStatus } from '../common/enums/quotation-status.enum';

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel(Quotation.name)
    private readonly quotationModel: Model<QuotationDocument>,
  ) {}

  async generateQuotationId(): Promise<string> {
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

  async getNextQuotationId(): Promise<string> {
    return this.generateQuotationId();
  }

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const quotationId = await this.generateQuotationId();
    const now = new Date();

    const issueDate = data.issueDate || now;

    const validUntil =
      data.validUntil ||
      new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const createdQuotation = new this.quotationModel({
      ...data,
      quotationId,
      issueDate,
      validUntil,
    });
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
    const updateData = { ...data };

    if (data.issueDate === null) {
      updateData.issueDate = new Date();
    }

    if (data.validUntil === null) {
      const issueDate = updateData.issueDate || data.issueDate || new Date();
      updateData.validUntil = new Date(
        issueDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
    }

    const quotation = await this.quotationModel
      .findOneAndUpdate({ quotationId }, updateData, { new: true })
      .populate('items.item')
      .exec();

    if (!quotation)
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    return quotation;
  }

  async updateStatusByQuotationId(
    quotationId: string,
    status: QuotationStatus,
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