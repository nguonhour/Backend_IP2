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
import { Body, Put } from '@nestjs/common';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentProfilesService } from './student-profiles.service';
import { TestAuthGuard } from '../auth/test-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('students')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @UseGuards(TestAuthGuard)
  @Post('save-job/:jobId')
  async saveJob(
    @Request() req: AuthenticatedRequest,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.saveJob(req.user.id, jobId);
  }

  @UseGuards(TestAuthGuard)
  @Get('saved-jobs')
  async getSavedJobs(@Request() req: AuthenticatedRequest) {
    return this.studentProfilesService.getSavedJobs(req.user.id);
  }

  @UseGuards(TestAuthGuard)
  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.studentProfilesService.getProfile(req.user.id);
  }

  @UseGuards(TestAuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentProfilesService.updateProfile(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Post('me/resumes')
  async addResume(@Request() req: AuthenticatedRequest, @Body() body: { fileUrl: string }) {
    return this.studentProfilesService.addResume(req.user.id, body.fileUrl);
  }

  @UseGuards(TestAuthGuard)
  @Delete('save-job/:jobId')
  async removeSavedJob(
    @Request() req: AuthenticatedRequest,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.removeSavedJob(req.user.id, jobId);
  }
}
