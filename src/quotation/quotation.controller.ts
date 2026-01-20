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

@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  // Public endpoint for viewing quotations
  @Get('public/:id')
  async findOnePublic(@Param('id') id: string): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.findByIdOrQuotationId(id),
    );
  }

  // Protected routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get('next-id')
  async getNextQuotationId() {
    const nextId = await this.quotationService.generateQuotationId();
    return { nextQuotationId: nextId };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Post()
  async create(@Body() body: Partial<Quotation>): Promise<Quotation> {
    return this.quotationService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get()
  async findAll(): Promise<Quotation[]> {
    return this.quotationService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.findByIdOrQuotationId(id),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Put('/:id')
  async updateById(
    @Param('id') id: string,
    @Body() body: Partial<Quotation>,
  ): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.updateByIdOrQuotationId(id, body),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Put('/:id/status')
  async updateStatusById(
    @Param('id') id: string,
    @Body() body: { status: QuotationStatus },
  ): Promise<Quotation> {
    return this.handleNotFound(() =>
      this.quotationService.updateStatusByIdOrQuotationId(id, body.status),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Delete('/:id')
  async deleteById(@Param('id') id: string): Promise<{ message: string }> {
    await this.handleNotFound(() =>
      this.quotationService.deleteByIdOrQuotationId(id),
    );
    return { message: 'Deleted successfully' };
  }

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