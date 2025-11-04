import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory_items.schema';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryItemModel: Model<InventoryItemDocument>,
  ) {}

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const now = new Date();
    const itemData = {
      ...data,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
    };

    const createdItem = new this.inventoryItemModel(itemData);
    return createdItem.save();
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryItemModel.find().exec();
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    return this.inventoryItemModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<InventoryItem>,
  ): Promise<InventoryItem | null> {
    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    return this.inventoryItemModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<InventoryItem | null> {
    return this.inventoryItemModel.findByIdAndDelete(id).exec();
  }
}
