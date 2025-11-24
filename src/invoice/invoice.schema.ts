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
    type: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
    },
    required: true,
  })
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };

  @Prop([
    {
      item: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ])
  items: Array<{
    item: MongooseSchema.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    required: true,
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: Date })
  bankDepositDate?: Date;

  @Prop({ required: true, type: Date })
  issueDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop()
  notes?: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
