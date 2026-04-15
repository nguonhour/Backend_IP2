import {
  Controller,
  Get,
  Post,
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
import { TestAuthGuard } from '../auth/test-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Public - Anyone can view jobs
  @Get()
  async getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @UseGuards(TestAuthGuard)
  @Get('me/posted')
  async getMyPostedJobs(@Request() req) {
    return this.jobsService.getMyPostedJobs(req.user.id);
  }

  @Get(':id')
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  // Employer (HR) only - Create, Update, Delete jobs
  @UseGuards(TestAuthGuard)
  @Post()
  async createJob(@Request() req, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Put(':id')
  async updateJob(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(req.user.id, id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Delete(':id')
  async deleteJob(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.deleteJob(req.user.id, id);
  }
}
