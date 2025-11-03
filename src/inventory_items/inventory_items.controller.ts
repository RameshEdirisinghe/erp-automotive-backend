import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InventoryItemsService } from './inventory_items.service';
import { InventoryItem } from './inventory_items.schema';

@Controller('inventory-items')
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @Post()
  async create(@Body() body: Partial<InventoryItem>): Promise<InventoryItem> {
    return this.inventoryItemsService.create(body);
  }

  @Get()
  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InventoryItem | null> {
    return this.inventoryItemsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<InventoryItem>,
  ): Promise<InventoryItem | null> {
    return this.inventoryItemsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<InventoryItem | null> {
    return this.inventoryItemsService.delete(id);
  }
}