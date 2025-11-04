import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true, unique: true })
  product_name: string;

  @Prop({ required: true, unique: true })
  product_code: string;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  sold_count: number;

  @Prop({
    required: true,
    enum: ['in_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock',
  })
  status: string;

  @Prop({
    type: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      chassis_no: { type: String, required: true },
      year: { type: Number, required: true }
    },
    required: true
  })
  vehicle: {
    brand: string;
    model: string;
    chassis_no: string;
    year: number;
  };

  @Prop({ required: true })
  purchase_price: number;

  @Prop({ required: true })
  sell_price: number;

  @Prop({ required: true })
  shipment_code: string;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
