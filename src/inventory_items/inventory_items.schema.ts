import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InventoryStatus } from '../common/enums/inventory-status.enum';

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

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
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
    type: String,
    enum: InventoryStatus,
    default: InventoryStatus.IN_STOCK,
  })
  status: InventoryStatus;

  @Prop({ type: VehicleInfo, required: true })
  vehicle: VehicleInfo;

  @Prop({ required: true })
  purchase_price: number;

  @Prop({ required: true })
  sell_price: number;

  @Prop({ default: 0 })
  discount_rate: number;

  @Prop({
    default: function (this: InventoryItem) {
      return this.sell_price * (1 - (this.discount_rate || 0) / 100);
    },
  })
  actual_sold_price: number;

  @Prop({ required: true })
  shipment_code: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
