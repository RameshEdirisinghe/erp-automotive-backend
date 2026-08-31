import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ReturnStatus } from '../common/enums/return-status.enum';

export type InvoiceReturnDocument = InvoiceReturn & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class InvoiceReturn {
  @Prop({ required: true, unique: true })
  returnId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  })
  invoice: MongooseSchema.Types.ObjectId;

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
  returnTotal: number;

  @Prop({ required: true })
  returnReason: string;

  @Prop()
  remarks?: string;

  @Prop({
    required: true,
    type: String,
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status: ReturnStatus;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const InvoiceReturnSchema = SchemaFactory.createForClass(InvoiceReturn);
