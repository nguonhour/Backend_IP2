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
    return this.jobsService.getMyPostedJobs(req.user.id);
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

  @Get(':id')
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  // Employer (HR) only - Create, Update, Delete jobs
  @UseGuards(JwtAuthGuard)
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
}
