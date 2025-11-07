import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() body: Partial<Invoice>) {
    return this.invoiceService.create(body);
  }

  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Get('next-id')
  async getNextInvoiceId() {
    const nextId = await this.invoiceService.getNextInvoiceId();
    return { nextInvoiceId: nextId };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Get('invoice-id/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.findByInvoiceId(invoiceId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Invoice>) {
    return this.invoiceService.update(id, body);
  }

  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.invoiceService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }
}
