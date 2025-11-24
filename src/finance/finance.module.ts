import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Finance, FinanceSchema } from './finance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Finance.name, schema: FinanceSchema }]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
