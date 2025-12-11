import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { InventoryItemsModule } from './inventory_items/inventory_items.module';
import { InvoiceModule } from './invoice/invoice.module';
import { QuotationModule } from './quotation/quotation.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    InventoryItemsModule,
    InvoiceModule,
    QuotationModule,
    AuthModule,
    FinanceModule,
    CustomerModule,
  ],
})
export class AppModule {}
