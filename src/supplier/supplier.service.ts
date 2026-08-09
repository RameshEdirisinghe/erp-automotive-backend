import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from './supplier.schema';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(supplierData: Partial<Supplier>): Promise<Supplier> {
    const createdSupplier = new this.supplierModel(supplierData);
    return createdSupplier.save();
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, updateData: Partial<Supplier>): Promise<Supplier> {
    const updated = await this.supplierModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.supplierModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return { deleted: true };
  }
}
