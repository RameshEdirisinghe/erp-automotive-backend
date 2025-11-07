import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FinanceDocument = Finance & Document;

@Schema({ _id: false })
export class PaymentMethod {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  transactionRef: string;
}

@Schema({ _id: false })
export class InvoiceReference {
  @Prop({ required: true })
  invoiceId: string;
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Finance {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ required: true, type: Date })
  transactionDate: Date;

  @Prop({ type: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: InvoiceReference, required: true })
  invoice: InvoiceReference;

  @Prop({ required: true })
  amount: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);