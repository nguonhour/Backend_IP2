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
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { TestAuthGuard } from '../auth/test-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(TestAuthGuard)
  @Post()
  async applyToJob(@Request() req, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.applyToJob(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Get('my')
  async getMyApplications(@Request() req, @Query('status') status?: string) {
    return this.applicationsService.getMyApplications(req.user.id, status);
  }

  @UseGuards(TestAuthGuard)
  @Get('employer/inbox')
  async getEmployerInbox(
    @Request() req,
    @Query('jobId') jobId?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getEmployerInbox(req.user.id, {
      jobId,
      status,
    });
  }

  @UseGuards(TestAuthGuard)
  @Get('job/:jobId')
  async getApplicantsForJob(
    @Request() req,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getApplicantsForJob(
      req.user.id,
      jobId,
      status,
    );
  }

  @UseGuards(TestAuthGuard)
  @Get('employer/:id')
  async getEmployerApplicationById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getEmployerApplicationById(id, req.user.id);
  }

  @UseGuards(TestAuthGuard)
  @Patch('employer/:id/status')
  async updateApplicationStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(id, req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Get(':id')
  async getApplicationById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getApplicationById(id, req.user.id);
  }
}
