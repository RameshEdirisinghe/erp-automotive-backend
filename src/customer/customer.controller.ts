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
import { CustomerService } from './customer.service';
import { Customer } from './customer.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Get next customer short ID (e.g., cus-112)
  @Get('next-id')
  async getNextId(): Promise<{ nextCustomerCode: string }> {
    const nextCode = await this.customerService.getNextCustomerCode();
    return { nextCustomerCode: nextCode };
  }

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

  // Get one customer by phone Number
  @Get('phone/:phone')
  async findOneByPhone(@Param('phone') phone: string): Promise<Customer> {
    return this.customerService.findOneByPhone(phone);
  }

  // Get one customer
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  // Update a customer (PUT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Customer>,
  ): Promise<Customer> {
    return this.customerService.update(id, updateData);
  }

  // Update a customer (PATCH)
  @Patch(':id')
  async patch(
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
