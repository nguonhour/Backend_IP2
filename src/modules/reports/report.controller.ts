import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  BadRequestException,
  UseGuards,
  Request,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateReportDto, ResolveReportDto } from './dto/report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportType } from './report-type.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Create a new report (any authenticated user)
   */
  @Post()
  @Audit({
    action: 'CREATE',
    module: 'reports',
    entityType: 'Report',
  })
  async createReport(
    @Body(ValidationPipe) dto: CreateReportDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const description = dto.description ?? dto.reason;
    if (!description) {
      throw new BadRequestException('Report description is required');
    }

    return this.reportService.createReport(
      req.user.id,
      dto.type ?? ReportType.OTHER,
      description,
      dto.jobId,
      dto.metadata,
    );
  }

  /**
   * Get my reports
   */
  @Get('my-reports')
  async getMyReports(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportService.getUserReports(
      req.user.id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  /**
   * Get reports for a job
   */
  @Get('job/:jobId')
  async getJobReports(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportService.getJobReports(
      jobId,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  // ADMIN ENDPOINTS
  /**
   * Get all reports (admin only)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.reportService.getReports(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status as any,
      type as any,
      jobId,
    );
  }

  /**
   * Get report statistics (admin only)
   */
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getStats() {
    return this.reportService.getStats();
  }

  /**
   * Get single report
   */
  @Get(':id')
  async getReport(@Param('id', ParseUUIDPipe) reportId: string) {
    return this.reportService.getReportById(reportId);
  }

  /**
   * Update report status (admin only)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Audit({
    action: 'UPDATE',
    module: 'reports',
    entityType: 'Report',
  })
  async updateReportStatus(
    @Param('id', ParseUUIDPipe) reportId: string,
    @Body(ValidationPipe) dto: { status: string; adminNotes?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reportService.updateReportStatus(
      reportId,
      dto.status as any,
      req.user.id,
      dto.adminNotes,
    );
  }

  /**
   * Resolve report with action (admin only)
   */
  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Audit({
    action: 'APPROVE',
    module: 'reports',
    entityType: 'Report',
  })
  async resolveReport(
    @Param('id', ParseUUIDPipe) reportId: string,
    @Body(ValidationPipe) dto: ResolveReportDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reportService.resolveReport(
      reportId,
      dto.action as any,
      req.user.id,
      dto.adminNotes,
    );
  }

  /**
   * Delete report (admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Audit({
    action: 'DELETE',
    module: 'reports',
    entityType: 'Report',
  })
  async deleteReport(
    @Param('id', ParseUUIDPipe) reportId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.reportService.deleteReport(reportId, req.user.id);
    return { message: 'Report deleted' };
  }
}
