import { Module } from '@nestjs/common';
import { InventoryItemsService } from './inventory_items.service';
import { InventoryItemsController } from './inventory_items.controller';

@Module({
  providers: [InventoryItemsService],
  controllers: [InventoryItemsController]
})
export class InventoryItemsModule {}
