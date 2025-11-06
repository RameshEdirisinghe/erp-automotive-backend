import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { Quotation } from './quotation.schema';

@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  async create(@Body() body: Partial<Quotation>): Promise<Quotation> {
    return this.quotationService.create(body);
  }

  @Get()
  async findAll(): Promise<Quotation[]> {
    return this.quotationService.findAll();
  }

  @Get('quotation-id/:quotationId')
  async findByQuotationId(@Param('quotationId') quotationId: string): Promise<Quotation | null> {
    return this.quotationService.findByQuotationId(quotationId);
  }

  @Put('quotation-id/:quotationId')
  async updateByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: Partial<Quotation>,
  ): Promise<Quotation | null> {
    return this.quotationService.updateByQuotationId(quotationId, body);
  }

  @Put('quotation-id/:quotationId/status')
  async updateStatusByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: { status: string },
  ): Promise<Quotation | null> {
    return this.quotationService.updateStatusByQuotationId(quotationId, body.status);
  }

  @Delete('quotation-id/:quotationId')
  async deleteByQuotationId(@Param('quotationId') quotationId: string): Promise<Quotation | null> {
    return this.quotationService.deleteByQuotationId(quotationId);
  }
}