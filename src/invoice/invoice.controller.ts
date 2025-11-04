import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.schema';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() body: Partial<Invoice>): Promise<Invoice> {
    return this.invoiceService.create(body);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice | null> {
    return this.invoiceService.findOne(id);
  }

  @Get('invoice-id/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string): Promise<Invoice | null> {
    return this.invoiceService.findByInvoiceId(invoiceId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Invoice>,
  ): Promise<Invoice | null> {
    return this.invoiceService.update(id, body);
  }

  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: string },
  ): Promise<Invoice | null> {
    return this.invoiceService.updatePaymentStatus(id, body.paymentStatus);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Invoice | null> {
    return this.invoiceService.delete(id);
  }
}