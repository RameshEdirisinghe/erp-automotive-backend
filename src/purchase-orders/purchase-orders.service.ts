import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from './purchase-orders.schema';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrder.name)
    private poModel: Model<PurchaseOrderDocument>,
  ) {}

  async create(poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const created = new this.poModel(poData);
    return created.save();
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.poModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.poModel.findById(id).exec();
    if (!po) {
      throw new NotFoundException(`Purchase Order with id ${id} not found`);
    }
    return po;
  }

  async update(id: string, updateData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const updated = await this.poModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Purchase Order with id ${id} not found`);
    }
    return updated;
  }

  async updateStatus(id: string, status: string): Promise<PurchaseOrder> {
    const updated = await this.poModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Purchase Order with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.poModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Purchase Order with id ${id} not found`);
    }
    return { deleted: true };
  }
}
