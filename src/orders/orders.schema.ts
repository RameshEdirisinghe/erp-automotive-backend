import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderProductSubSchema {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  productName: string;

  @Prop()
  category: string;

  @Prop()
  brand: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, default: 'Pcs' })
  unit: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  total: number;
}

@Schema({ _id: false })
export class SalesmanSubSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  employeeId: string;

  @Prop()
  phone: string;

  @Prop()
  area: string;

  @Prop()
  email?: string;
}

@Schema({ _id: false })
export class OrderTimelineSubSchema {
  @Prop({ required: true })
  event: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  timestamp: string;

  @Prop()
  actor?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({
    required: true,
    unique: true,
    default: function () {
      const random = Math.floor(10000 + Math.random() * 90000);
      return `ORD-${random}`;
    },
  })
  orderId: string;

  @Prop({ required: true })
  orderDate: string;

  @Prop({ type: SalesmanSubSchema, required: true })
  salesman: SalesmanSubSchema;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  contactPhone: string;

  @Prop()
  customerAddress: string;

  @Prop()
  customerCity: string;

  @Prop({ type: [OrderProductSubSchema], default: [] })
  products: OrderProductSubSchema[];

  @Prop({ required: true, default: 0 })
  numberOfProducts: number;

  @Prop({ required: true, default: 0 })
  subTotal: number;

  @Prop({ default: 0 })
  totalDiscount: number;

  @Prop({ default: 0 })
  totalTax: number;

  @Prop({ required: true, default: 0 })
  grandTotal: number;

  @Prop({ required: true, default: 'Pending' })
  status: string;

  @Prop({ required: true, default: 'Unpaid' })
  paymentStatus: string;

  @Prop()
  convertedPOId?: string;

  @Prop({ type: [OrderTimelineSubSchema], default: [] })
  timeline: OrderTimelineSubSchema[];

  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
