import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/,
  })
  phone: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 20,
  })
  vatNumber: string;

  @Prop({
    type: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
      zip: { type: String, trim: true },
    },
    required: false,
    _id: false,
  })
  address: {
    street?: string;
    city?: string;
    country?: string;
    zip?: string;
  };

  @Prop({
    required: false,
    default: function () {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      return `CUS-${year}-${month}-${randomCode}`;
    },
    unique: true,
  })
  customerCode: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
