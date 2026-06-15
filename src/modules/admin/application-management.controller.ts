import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApplicationManagementService } from './application-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ApplicationManagementController {
  constructor(private readonly applicationManagementService: ApplicationManagementService) {}

  @Get()
  async getAllApplications(
    @Query('status') status?: string,
    @Query('employerId') employerId?: string,
    @Query('employerName') employerName?: string,
    @Query('studentId') studentId?: string,
    @Query('jobId') jobId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationManagementService.findAllApplications(
      {
        status,
        employerId,
        employerName,
        studentId,
        jobId,
      },
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    return this.applicationManagementService.getApplicationById(id);
  }

  @Get(':id/history')
  async getApplicationHistory(@Param('id') id: string) {
    return this.applicationManagementService.getApplicationHistory(id);
  }
}
