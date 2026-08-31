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
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { SalesOverviewResponseDto } from './dto/sales-overview.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // Public endpoint for viewing invoices
  @Get('public/:id')
  async findOnePublic(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  // Protected routes
  @UseGuards(JwtAuthGuard)
  @Get('analytics/sales-overview')
  async getSalesOverview(): Promise<SalesOverviewResponseDto> {
    return this.invoiceService.getSalesOverview();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: Partial<Invoice>) {
    return this.invoiceService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('next-id')
  async getNextInvoiceId() {
    const nextId = await this.invoiceService.getNextInvoiceId();
    return { nextInvoiceId: nextId };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoice-id/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.findByInvoiceId(invoiceId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Invoice>) {
    return this.invoiceService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.invoiceService.updatePaymentStatus(id, paymentStatus);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }
}