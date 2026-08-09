import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder } from './purchase-orders.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  async create(@Body() poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return this.poService.create(poData);
  }

  @Get()
  async findAll(): Promise<PurchaseOrder[]> {
    return this.poService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.poService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder> {
    return this.poService.update(id, updateData);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ): Promise<PurchaseOrder> {
    return this.poService.updateStatus(id, body.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.poService.remove(id);
  }
}
