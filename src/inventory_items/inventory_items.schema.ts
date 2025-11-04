import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ _id: false })
export class VehicleInfo {
  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  chassis_no: string;

  @Prop({ required: true })
  year: number;
}

@Schema()
export class InventoryItem {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
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

  @Prop({ type: VehicleInfo, required: true })
  vehicle: VehicleInfo;

  @Prop({ required: true })
  purchase_price: number;

  @Prop({ required: true })
  sell_price: number;

  @Prop({ required: true })
  shipment_code: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
