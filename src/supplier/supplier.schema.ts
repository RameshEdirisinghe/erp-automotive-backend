import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  companyName: string;

  @Prop({ required: true, trim: true })
  contactPerson: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: false, trim: true })
  email?: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ required: true, default: 'Active' })
  status: string;

  @Prop({ default: 0 })
  totalPOs: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: 0 })
  balanceDue: number;

  @Prop({ required: false })
  notes?: string;

  @Prop({
    required: false,
    default: function () {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      return `SUP-${randomCode}`;
    },
  })
  supplierCode: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
