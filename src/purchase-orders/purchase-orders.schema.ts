import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PurchaseOrderDocument = PurchaseOrder & Document;

@Schema({ _id: false })
export class POItemSubSchema {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  productName: string;

  @Prop()
  category: string;

  @Prop()
  brand: string;

  @Prop({ required: true, min: 1 })
  quantityOrdered: number;

  @Prop({ default: 0 })
  quantityReceived: number;

  @Prop({ required: true, default: 'Pcs' })
  unit: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true })
  totalPrice: number;
}

@Schema({ timestamps: true })
export class PurchaseOrder {
  @Prop({
    required: true,
    unique: true,
    default: function () {
      const random = Math.floor(1000 + Math.random() * 9000);
      return `PO-${random}`;
    },
  })
  poNumber: string;

  @Prop({ required: true })
  poDate: string;

  @Prop({ required: true })
  expectedDeliveryDate: string;

  @Prop({ required: true })
  supplierId: string;

  @Prop({ required: true })
  supplierName: string;

  @Prop()
  customerName?: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  contactPhone: string;

  @Prop({ type: [POItemSubSchema], default: [] })
  items: POItemSubSchema[];

  @Prop({ required: true, default: 0 })
  totalItems: number;

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ required: true, default: 'Draft' })
  status: string;

  @Prop({ required: true, default: 'Unpaid' })
  paymentStatus: string;

  @Prop()
  orderRef?: string;

  @Prop()
  notes?: string;

  @Prop({ default: 'Admin' })
  createdBy: string;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
