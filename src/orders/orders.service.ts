import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order> {
    const updated = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return updated;
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    order.status = status;
    if (notes) order.notes = notes;
    order.timeline.push({
      event: `Status updated to ${status}`,
      description: notes || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
    });

    return order.save();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return { deleted: true };
  }
}
