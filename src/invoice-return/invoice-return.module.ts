import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceReturnController } from './invoice-return.controller';
import { InvoiceReturnService } from './invoice-return.service';
import { InvoiceReturn, InvoiceReturnSchema } from './invoice-return.schema';
import { Invoice, InvoiceSchema } from '../invoice/invoice.schema';
import { InventoryItem, InventoryItemSchema } from '../inventory_items/inventory_items.schema';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvoiceReturn.name, schema: InvoiceReturnSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
    ]),
    FinanceModule
  ],
  controllers: [InvoiceReturnController],
  providers: [InvoiceReturnService],
  exports: [InvoiceReturnService],
})
export class InvoiceReturnModule {}
