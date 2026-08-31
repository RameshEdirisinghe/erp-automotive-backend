import { Controller, Get, Post, Body, Param, Put, Patch } from '@nestjs/common';
import { InvoiceReturnService } from './invoice-return.service';
import { InvoiceReturn } from './invoice-return.schema';
import { ReturnStatus } from '../common/enums/return-status.enum';

@Controller('invoice-returns')
export class InvoiceReturnController {
  constructor(private readonly returnService: InvoiceReturnService) {}

  @Post()
  async create(@Body() body: Partial<InvoiceReturn>) {
    return this.returnService.create(body);
  }

  @Get()
  async findAll() {
    return this.returnService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.returnService.findOne(id);
  }

  @Get('invoice/:invoiceId')
  async findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.returnService.findByInvoice(invoiceId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReturnStatus,
  ) {
    return this.returnService.updateStatus(id, status);
  }
}
