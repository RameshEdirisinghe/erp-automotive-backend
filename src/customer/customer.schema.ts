import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CustomerDocument = Customer & Document;

export function extractCityFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return address.trim();
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  })
  shopName: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  fullName?: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  contactPerson?: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  address: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  city?: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  phone: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  phone2?: string;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  phone3?: string;

  @Prop({
    required: false,
    default: 1000000,
    min: 0,
  })
  creditLimit: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  })
  salesRep?: MongooseSchema.Types.ObjectId;

  @Prop({
    required: false,
    trim: true,
    default: '',
  })
  salesRepName?: string;

  @Prop({
    required: false,
    default: 'Active',
  })
  status: string;

  @Prop({
    required: false,
    trim: true,
    default: null,
  })
  customerCode: string;

  @Prop({ required: false, trim: true })
  notes?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Automatically populate city and fullName before saving
CustomerSchema.pre<CustomerDocument>('save', function (next) {
  if (this.address && !this.city) {
    this.city = extractCityFromAddress(this.address);
  }
  if (!this.fullName && this.shopName) {
    this.fullName = this.shopName;
  }
  next();
});
