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
import { QuotationStatus } from '../common/enums/quotation-status.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get('next-id')
  async getNextQuotationId() {
    const nextId = await this.quotationService.generateQuotationId();
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

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.findByIdOrQuotationId(id),
    );
  }

  @Put('/:id')
  async updateById(
    @Param('id') id: string,
    @Body() body: Partial<Quotation>,
  ): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.updateByIdOrQuotationId(id, body),
    );
  }

  @Put('/:id/status')
  async updateStatusById(
    @Param('id') id: string,
    @Body() body: { status: QuotationStatus },
  ): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.updateStatusByIdOrQuotationId(id, body.status),
    );
  }

  @Delete('/:id')
  async deleteById(@Param('id') id: string): Promise<{ message: string }> {
    await this.handleNotFound(() =>
      this.quotationService.deleteByIdOrQuotationId(id),
    );
    return { message: 'Deleted successfully' };
  }

  // Helper to handle NotFound exceptions
  private async handleNotFound<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
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
