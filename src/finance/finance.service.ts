import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Finance, FinanceDocument } from './finance.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Finance.name)
    private readonly financeModel: Model<FinanceDocument>,
  ) {}

  async getNextTransactionId(): Promise<string> {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePart = `${year}-${month}-${day}`;
    const prefix = `TXN-${datePart}-`;

    const lastFinance = await this.financeModel
      .findOne({ transactionId: { $regex: `^${prefix}` } })
      .sort({ transactionId: -1 })
      .exec();

    let nextNumber = 1;

    if (lastFinance?.transactionId) {
      const lastNumberPart = lastFinance.transactionId.split('-').pop();
      const lastNumber = Number(lastNumberPart);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(4, '0');

    return `${prefix}${paddedNumber}`;
  }

  async create(data: Partial<Finance>): Promise<Finance> {
    const duplicate = await this.financeModel.exists({
      transactionId: data.transactionId,
    });
    if (duplicate) {
      throw new BadRequestException(
        `Transaction with ID "${data.transactionId}" already exists`,
      );
    }

    const now = new Date();

    const transactionDate = data.transactionDate || now;

    const transaction = new this.financeModel({
      ...data,
      transactionDate: transactionDate,
      created_at: now,
      updated_at: now,
    });

    return transaction.save();
  }

  async findAll(): Promise<Finance[]> {
    return this.financeModel.find().exec();
  }

  async findOne(id: string): Promise<Finance> {
    const query = isValidObjectId(id) ? { _id: id } : { transactionId: id };
    const transaction = await this.financeModel.findOne(query).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return transaction;
  }

  async update(id: string, data: Partial<Finance>): Promise<Finance> {
    const query = isValidObjectId(id) ? { _id: id } : { transactionId: id };

    const updateData = { ...data, updated_at: new Date() };
    if (data.transactionDate === null) {
      updateData.transactionDate = new Date();
    }

    const updated = await this.financeModel
      .findOneAndUpdate(query, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const query = isValidObjectId(id) ? { _id: id } : { transactionId: id };
    const deleted = await this.financeModel.findOneAndDelete(query).exec();

    if (!deleted) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    return { message: 'Transaction deleted successfully' };
  }
}
