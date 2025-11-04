import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory_items.schema';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectModel(InventoryItem.name) 
    private inventoryItemModel: Model<InventoryItemDocument>
  ) {}

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const createdItem = new this.inventoryItemModel(data);
    return createdItem.save();
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryItemModel.find().exec();
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    return this.inventoryItemModel.findById(id).exec();
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    return this.inventoryItemModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<InventoryItem | null> {
    return this.inventoryItemModel.findByIdAndDelete(id).exec();
  }
}