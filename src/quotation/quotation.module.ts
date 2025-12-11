import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { Quotation, QuotationSchema } from './quotation.schema';
import { Customer, CustomerSchema } from '../customer/customer.schema';
import { InventoryItem, InventoryItemSchema } from '../inventory_items/inventory_items.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quotation.name, schema: QuotationSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
    ]),
  ],
  controllers: [QuotationController],
  providers: [QuotationService],
  exports: [QuotationService],
})
export class QuotationModule {}
