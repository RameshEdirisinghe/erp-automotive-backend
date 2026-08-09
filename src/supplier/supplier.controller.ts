import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Supplier } from './supplier.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() supplierData: Partial<Supplier>): Promise<Supplier> {
    return this.supplierService.create(supplierData);
  }

  @Get()
  async findAll(): Promise<Supplier[]> {
    return this.supplierService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Supplier>,
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.supplierService.remove(id);
  }
}
