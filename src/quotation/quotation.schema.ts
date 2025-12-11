import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { QuotationStatus } from '../common/enums/quotation-status.enum';

export type QuotationDocument = Quotation & Document;

@Schema({ timestamps: true })
export class Quotation {
  @Prop({ required: true, unique: true })
  quotationId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  })
  customer: MongooseSchema.Types.ObjectId;

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
    type: String,
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Prop({ required: true, type: Date })
  issueDate: Date;

  @Prop({ required: true, type: Date })
  validUntil: Date;

  @Prop({
    required: true,
    enum: QuotationStatus,
    type: String,
    default: QuotationStatus.PENDING,
  })
  status: QuotationStatus;

  @Prop({ type: String })
  notes?: string;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);
