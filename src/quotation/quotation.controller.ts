import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
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
  async findByQuotationId(
    @Param('quotationId') quotationId: string,
  ): Promise<Quotation> {
    try {
      return await this.quotationService.findByQuotationId(quotationId);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('quotation-id/:quotationId')
  async updateByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: Partial<Quotation>,
  ): Promise<Quotation> {
    try {
      return await this.quotationService.updateByQuotationId(quotationId, body);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('quotation-id/:quotationId/status')
  async updateStatusByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: { status: string },
  ): Promise<Quotation> {
    try {
      return await this.quotationService.updateStatusByQuotationId(
        quotationId,
        body.status,
      );
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('quotation-id/:quotationId')
  async deleteByQuotationId(
    @Param('quotationId') quotationId: string,
  ): Promise<Quotation> {
    try {
      return await this.quotationService.deleteByQuotationId(quotationId);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}