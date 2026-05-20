import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status-dto';
import { PaginationReportDto } from './dto/pagination-report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getReports(@Query() paginationDto: PaginationReportDto) {
    return this.reportsService.getReports(paginationDto);
  }

  @Get(':id')
  async getReportById(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.getReportById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReport(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateReportStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateReportStatus(id, dto);
  }
}
