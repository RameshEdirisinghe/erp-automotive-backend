import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryItemsService } from './inventory_items.service';
import { InventoryItemsController } from './inventory_items.controller';
import { InventoryItem, InventoryItemSchema } from './inventory_items.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryItem.name, schema: InventoryItemSchema },
    ]),
  ],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
  exports: [InventoryItemsService],
})
export class InventoryItemsModule {}
