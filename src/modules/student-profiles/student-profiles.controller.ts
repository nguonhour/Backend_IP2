import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Request,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Body, Put } from '@nestjs/common';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentProfilesService } from './student-profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('students')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('save-job/:jobId')
  async saveJob(
    @Request() req: AuthenticatedRequest,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.saveJob(req.user.id, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-jobs')
  async getSavedJobs(@Request() req: AuthenticatedRequest) {
    return this.studentProfilesService.getSavedJobs(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.studentProfilesService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentProfilesService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/resumes')
  addResume(
    @Request() req: AuthenticatedRequest,
    @Body() body: { fileUrl: string },
  ) {
    return this.studentProfilesService.addResume(req.user.id, body.fileUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('save-job/:jobId')
  removeSavedJob(
    @Request() req: AuthenticatedRequest,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.studentProfilesService.removeSavedJob(req.user.id, jobId);
  }
}
