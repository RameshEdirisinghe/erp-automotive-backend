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
    const transaction = new this.financeModel({
      ...data,
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
    const updated = await this.financeModel
      .findOneAndUpdate(
        query,
        { ...data, updated_at: new Date() },
        { new: true },
      )
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