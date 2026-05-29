import {
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserManagementService } from './user-management.service';
import { JobModerationService } from './job-moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuspendUserDto } from './dto/admin-user-management.dto';
import { RejectJobDto } from './dto/job-moderation.dto';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { Audit } from '../../common/decorators/audit.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userManagementService: UserManagementService,
    private readonly jobModerationService: JobModerationService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // USER MANAGEMENT ENDPOINTS
  @Get('users')
  async getUsers(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userManagementService.getUsers(
      status as any,
      search,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('users/pending-approvals')
  async getPendingApprovals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userManagementService.getPendingApprovals(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('users/suspended')
  async getSuspendedUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userManagementService.getSuspendedUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userManagementService.getUserById(userId);
  }

  @Patch('users/:id/suspend')
  @Audit({
    action: 'SUSPEND',
    module: 'users',
    entityType: 'User',
  })
  async suspendUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userManagementService.suspendUser(
      userId,
      dto.reason,
      req.user.id,
    );
  }

  @Patch('users/:id/unsuspend')
  @Audit({
    action: 'UPDATE',
    module: 'users',
    entityType: 'User',
  })
  async unsuspendUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userManagementService.unsuspendUser(userId, req.user.id);
  }

  @Patch('users/:id/verify-employer')
  @Audit({
    action: 'VERIFY',
    module: 'users',
    entityType: 'User',
  })
  async verifyEmployer(
    @Param('id', ParseUUIDPipe) userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userManagementService.verifyEmployer(userId, req.user.id);
  }

  @Patch('users/:id/reject-employer')
  @Audit({
    action: 'REJECT',
    module: 'users',
    entityType: 'User',
  })
  async rejectEmployer(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userManagementService.rejectEmployer(
      userId,
      dto.reason,
      req.user.id,
    );
  }

  @Delete('users/:id')
  @Audit({
    action: 'DELETE',
    module: 'users',
    entityType: 'User',
  })
  async deleteUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userManagementService.deleteUser(userId, req.user.id);
  }

  // JOB MODERATION ENDPOINTS
  @Get('jobs/moderation/stats')
  async getModerationStats() {
    return this.jobModerationService.getModerationStats();
  }

  @Get('jobs/moderation/pending')
  async getPendingJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobModerationService.getPendingJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('jobs/moderation/approved')
  async getApprovedJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobModerationService.getApprovedJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('jobs/moderation/rejected')
  async getRejectedJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobModerationService.getRejectedJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('jobs/moderation/:id')
  async getJobForModeration(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobModerationService.getJobForModeration(jobId);
  }

  @Patch('jobs/:id/approve')
  @Audit({
    action: 'APPROVE',
    module: 'jobs',
    entityType: 'Job',
  })
  async approveJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.jobModerationService.approveJob(jobId, req.user.id);
  }

  @Patch('jobs/:id/reject')
  @Audit({
    action: 'REJECT',
    module: 'jobs',
    entityType: 'Job',
  })
  async rejectJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: RejectJobDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.jobModerationService.rejectJob(jobId, dto.reason, req.user.id);
  }
}
