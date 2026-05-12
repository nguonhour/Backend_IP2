import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Request,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { EmployerApplicationHistoryDto } from './dto/employer-application-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async applyToJob(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.applyToJob(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyApplications(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getMyApplications(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employer/inbox')
  async getEmployerInbox(
    @Request() req: AuthenticatedRequest,
    @Query('jobId') jobId?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getEmployerInbox(req.user.id, {
      jobId,
      status,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('employer/history')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getEmployerApplicationHistory(
    @Request() req: AuthenticatedRequest,
    @Query() query: EmployerApplicationHistoryDto,
  ) {
    return this.applicationsService.getEmployerApplicationHistory(
      req.user.id,
      query,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('job/:jobId')
  async getApplicantsForJob(
    @Request() req: AuthenticatedRequest,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getApplicantsForJob(
      req.user.id,
      jobId,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('employer/:id')
  async getEmployerApplicationById(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getEmployerApplicationById(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('employer/:id/status')
  async updateApplicationStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(
      id,
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  async getStudentApplicationHistory(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getStudentApplicationHistory(
      id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getApplicationById(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getApplicationById(id, req.user.id);
  }
}
