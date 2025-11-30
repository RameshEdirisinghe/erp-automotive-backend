import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory_items.schema';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectModel(InventoryItem.name)
    private readonly inventoryModel: Model<InventoryItemDocument>,
  ) {}

  async getNextInventoryId(): Promise<string> {
    const last = await this.inventoryModel
      .findOne({ id: /^INIT\d{6}$/ })
      .sort({ id: -1 })
      .select('id')
      .lean<{ id?: string }>();

    let nextNum = 1;

    if (last?.id) {
      const num = Number.parseInt(last.id.slice(4), 10);
      nextNum = num + 1;
    }

    return `INIT${String(nextNum).padStart(6, '0')}`;
  }

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const customId = data.id?.trim() || (await this.getNextInventoryId());

    const duplicateFields: string[] = [];
    const existingProductCode = await this.inventoryModel.exists({
      product_code: data.product_code,
    });
    if (existingProductCode) duplicateFields.push('product_code');

    const existingId = await this.inventoryModel.exists({ id: customId });
    if (existingId) duplicateFields.push('id');

    if (duplicateFields.length > 0) {
      throw new BadRequestException(
        `Duplicate value(s) found for: ${duplicateFields.join(', ')}`,
      );
    }

    const now = new Date();
    const item = new this.inventoryModel({
      ...data,
      id: customId,
      created_at: now,
      updated_at: now,
    });

    return item.save();
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryModel.find().exec();
  }

  async findOne(id: string): Promise<InventoryItem> {
    const query = isValidObjectId(id) ? { _id: id } : { id };
    const item = await this.inventoryModel.findOne(query).exec();
    if (!item) throw new NotFoundException(`Item with ID "${id}" not found.`);
    return item;
  }

  async update(
    id: string,
    data: Partial<InventoryItem>,
  ): Promise<InventoryItem> {
    const query = isValidObjectId(id) ? { _id: id } : { id };
    const updated = await this.inventoryModel
      .findOneAndUpdate(
        query,
        { ...data, updated_at: new Date() },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Item with ID "${id}" not found.`);
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const query = isValidObjectId(id) ? { _id: id } : { id };
    const deleted = await this.inventoryModel.findOneAndDelete(query).exec();

    if (!deleted) {
      throw new NotFoundException(`Item with ID "${id}" not found.`);
    }

    return { message: 'Deleted successfully' };
  }
}
