import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Request,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { StudentProfilesService } from './student-profiles.service';
import { TestAuthGuard } from '../auth/test-auth.guard';

@Controller('students')
export class StudentProfilesController {
  constructor(private readonly studentProfilesService: StudentProfilesService) {}

  @UseGuards(TestAuthGuard)
  @Post('save-job/:jobId')
  async saveJob(
    @Request() req,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.saveJob(req.user.id, jobId);
  }

  @UseGuards(TestAuthGuard)
  @Get('saved-jobs')
  async getSavedJobs(@Request() req) {
    return this.studentProfilesService.getSavedJobs(req.user.id);
  }

  @UseGuards(TestAuthGuard)
  @Delete('save-job/:jobId')
  async removeSavedJob(
    @Request() req,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.removeSavedJob(req.user.id, jobId);
  }
}