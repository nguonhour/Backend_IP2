import {
  Controller,
  Query,
  UsePipes,
  ValidationPipe,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobSearchDto } from './dto/search-job.dto';
import { PaginationDto } from './dto/pagination-job.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { Audit } from '../../common/decorators/audit.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { Response } from 'express'
import { Res } from '@nestjs/common'

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Public - Anyone can view jobs
  @Get()
  async getAllJobs(@Query() paginationDto: PaginationDto) {
    return this.jobsService.getAllJobs(paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/posted')
  async getMyPostedJobs(@Request() req: AuthenticatedRequest) {
    // return this.jobsService.getMyPostedJobs(req.user.id);
    try {
      const jobs = await this.jobsService.getMyPostedJobs(req.user.id);
      return jobs;
    } catch (error) {
      console.error(error); // This will show the actual error in your terminal
      throw error; // Rethrow the error to be handled by NestJS's global exception filter
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/posted/:id')
  async getMyPostedJobById(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.getMyPostedJobById(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match/skills')
  async getMatchBySkills(@Request() req: AuthenticatedRequest) {
    return this.jobsService.getMatchBySkills(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match/major')
  async getMatchByMajor(@Request() req: AuthenticatedRequest) {
    return this.jobsService.getMatchByMajor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  async getRecommendedJobs(@Request() req: AuthenticatedRequest) {
    return this.jobsService.getRecommendedJobs(req.user.id);
  }
  // Public - Anyone can view job details
  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchJobs(@Query() query: JobSearchDto) {
    return await this.jobsService.searchJobs(query);
  }

  @Get('categories')
  async getJobCategories() {
    return this.jobsService.getJobCategories();
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/all')
  async getAllJobsForAdmin(@Query() paginationDto: PaginationDto) {
    return this.jobsService.getAllJobsForAdmin(paginationDto);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchJobsForAdmin(@Query() query: JobSearchDto) {
    return this.jobsService.searchJobsForAdmin(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/export')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportJobsForAdmin(
    @Query() query: JobSearchDto,
    @Res() res: Response,
  ) {
    const csv = await this.jobsService.exportJobsCsvForAdmin(query)

    res.header('Content-Type', 'text/csv; charset=utf-8')
    res.attachment(`admin-jobs-${new Date().toISOString().slice(0, 10)}.csv`)
    res.send(csv)
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/:id')
  async getJobByIdForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobByIdForAdmin(id);
  }

  @Get(':id')
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  // Employer (HR) only - Create, Update, Delete jobs
  @UseGuards(JwtAuthGuard)
  @Audit({
    action: 'CREATE',
    module: 'jobs',
    entityType: 'Job',
  })
  @Post()
  async createJob(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateJob(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateJobStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateJobStatus(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteJob(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.deleteJob(req.user.id, id);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/block')
  async blockJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.setJobBlocked(id, true)
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/unblock')
  async unblockJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.setJobBlocked(id, false)
  }
}
