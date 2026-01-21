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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get('analytics/sales-overview')
  async getSalesOverview(): Promise<SalesOverviewResponseDto> {
    return this.invoiceService.getSalesOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Post()
  async create(@Body() body: Partial<Invoice>) {
    return this.invoiceService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get('next-id')
  async getNextInvoiceId() {
    const nextId = await this.invoiceService.getNextInvoiceId();
    return { nextInvoiceId: nextId };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Get('invoice-id/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.findByInvoiceId(invoiceId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Invoice>) {
    return this.invoiceService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.invoiceService.updatePaymentStatus(id, paymentStatus);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY_MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }
}