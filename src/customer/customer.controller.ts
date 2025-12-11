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
import { CustomerService } from './customer.service';
import { Customer } from './customer.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create a customer
  @Post()
  async create(@Body() customerData: Partial<Customer>): Promise<Customer> {
    return this.customerService.create(customerData);
  }

  // Get all customers
  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  // Get one customer
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  // Update a customer
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Customer>,
  ): Promise<Customer> {
    return this.customerService.update(id, updateData);
  }

  // Delete a customer
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.customerService.remove(id);
  }
}
