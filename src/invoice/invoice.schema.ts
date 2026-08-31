import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';

export type InvoiceDocument = Invoice & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  })
  customer?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, default: null })
  customerDetails?: Record<string, any>;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  salesman?: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  salesmanName?: string;

  @Prop([
    {
      item: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'InventoryItem',
        required: false,
      },
      itemCode: { type: String, default: '' },
      itemName: { type: String, default: '' },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
  ])
  items: Array<{
    item?: MongooseSchema.Types.ObjectId;
    itemCode?: string;
    itemName?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    total: number;
  }>;

  @Prop({ required: true, default: 0, min: 0 })
  subTotal: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, default: 0, min: 0 })
  totalAmount: number;

  @Prop({ default: 0, min: 0 })
  paidAmount?: number;

  @Prop({ default: 0, min: 0 })
  remainingAmount?: number;

  @Prop({
    required: true,
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    required: true,
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: Array, default: [] })
  payments?: Array<any>;

  @Prop({ type: Date })
  bankDepositDate?: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  issueDate: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  dueDate: Date;

  @Prop({ default: 'N/A' })
  vehicleNumber: string;

  @Prop({ default: false })
  applyVat?: boolean;

  @Prop({ default: 0 })
  vatAmount?: number;

  @Prop({ default: 0 })
  taxRate?: number;

  @Prop()
  notes?: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
