import {
  Controller, Query, UsePipes, ValidationPipe,
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
import { TestAuthGuard } from '../auth/test-auth.guard';
import { JobSearchDto } from './dto/search-job.dto';

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

    @Get('search')
    @UsePipes(new ValidationPipe({ transform: true}))
    async searchJobs(@Query() query: JobSearchDto) {
        return await this.jobsService.searchJobs(query);
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
    @Patch(':id/status')
    async updateJobStatus(
        @Request() req,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateJobStatusDto,
    ) {
        return this.jobsService.updateJobStatus(req.user.id, id, dto);
    }

    @UseGuards(TestAuthGuard)
    @Delete(':id')
    async deleteJob(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
        return this.jobsService.deleteJob(req.user.id, id);
    }
}

