import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { Quotation } from './quotation.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get('next-id')
  async getNextQuotationId() {
    const nextId = await this.quotationService.getNextQuotationId();
    return { nextQuotationId: nextId };
  }

  @Post()
  async create(@Body() body: Partial<Quotation>): Promise<Quotation> {
    return this.quotationService.create(body);
  }

  @Get()
  async findAll(): Promise<Quotation[]> {
    return this.quotationService.findAll();
  }

  @Get('/:quotationId')
  async findByQuotationId(
    @Param('quotationId') quotationId: string,
  ): Promise<Quotation> {
    try {
      return await this.quotationService.findByQuotationId(quotationId);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Quotation not found';
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('/:quotationId')
  async updateByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: Partial<Quotation>,
  ): Promise<Quotation> {
    try {
      return await this.quotationService.updateByQuotationId(quotationId, body);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Quotation not found';
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('/:quotationId/status')
  async updateStatusByQuotationId(
    @Param('quotationId') quotationId: string,
    @Body() body: { status: string },
  ): Promise<Quotation> {
    try {
      return await this.quotationService.updateStatusByQuotationId(
        quotationId,
        body.status,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Quotation not found';
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('/:quotationId')
  async deleteByQuotationId(
    @Param('quotationId') quotationId: string,
  ): Promise<{ message: string }> {
    try {
      await this.quotationService.deleteByQuotationId(quotationId);
      return { message: 'Deleted successfully' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Quotation not found';
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}