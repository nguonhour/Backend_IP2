import { Controller, Get } from '@nestjs/common';
import { MasterService } from './master.service';

@Controller()
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get('job-statuses')
  async getJobStatuses() {
    return this.masterService.getJobStatuses();
  }

  @Get('job-categories')
  async getJobCategories() {
    return this.masterService.getJobCategories();
  }

  @Get('job-types')
  async getJobTypes() {
    return this.masterService.getJobTypes();
  }

  @Get('application-statuses')
  async getApplicationStatuses() {
    return this.masterService.getApplicationStatuses();
  }

  @Get('universities')
  async getUniversities() {
    return this.masterService.getUniversities();
  }

  @Get('majors')
  async getMajors() {
    return this.masterService.getMajors();
  }
}
