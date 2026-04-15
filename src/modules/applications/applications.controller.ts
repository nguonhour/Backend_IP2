import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { TestAuthGuard } from '../auth/test-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(TestAuthGuard)
  @Post()
  async applyToJob(@Request() req, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.applyToJob(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Get('my')
  async getMyApplications(@Request() req, @Query('status') status?: string) {
    return this.applicationsService.getMyApplications(req.user.id, status);
  }

  @UseGuards(TestAuthGuard)
  @Get(':id')
  async getApplicationById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.getApplicationById(id, req.user.id);
  }
}
