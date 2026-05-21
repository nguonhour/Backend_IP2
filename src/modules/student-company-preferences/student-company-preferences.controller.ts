import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { StudentCompanyPreferencesService } from './student-company-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('student-company-preferences')
export class StudentCompanyPreferencesController {
  constructor(private readonly service: StudentCompanyPreferencesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async upsert(
    @Req() req: AuthenticatedRequest,
    @Body() body: { employerId: string; blocked?: boolean; muted?: boolean },
  ) {
    const studentId = req.user.id;
    const { employerId, blocked, muted } = body;
    return this.service.upsert(studentId, employerId, { blocked, muted });
  }

  // Returns preferences for the currently authenticated student
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMe(@Req() req: AuthenticatedRequest) {
    const studentId = req.user.id;
    return this.service.findByStudent(studentId);
  }

  // Backwards-compatible: allow fetching by id but require authentication
  @UseGuards(JwtAuthGuard)
  @Get(':studentId')
  async list(@Param('studentId') studentId: string, @Req() req: AuthenticatedRequest) {
    // Prevent requesting other students' preferences unless authorized (simple check)
    if (req.user.id !== studentId) {
      // In a more complete implementation, check roles/permissions here.
      throw new Error('Forbidden');
    }
    return this.service.findByStudent(studentId);
  }
}
