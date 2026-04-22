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
import { EmployerProfilesService } from './employer-profiles.service';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { TestAuthGuard } from '../auth/test-auth.guard';

@Controller('employers')
export class EmployerProfilesController {
  constructor(
    private readonly employerProfilesService: EmployerProfilesService,
  ) {}

  @UseGuards(TestAuthGuard)
  @Post()
  async createProfile(
    @Request() req,
    @Body() dto: CreateEmployerProfileDto,
  ) {
    // Create employer profile for the authenticated user
    return this.employerProfilesService.create(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.employerProfilesService.findByUserId(req.user.id);
  }

  @UseGuards(TestAuthGuard)
  @Get(':id')
  async getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.employerProfilesService.findById(id);
  }

  @UseGuards(TestAuthGuard)
  @Put()
  async updateProfile(
    @Request() req,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerProfilesService.update(req.user.id, dto);
  }

  @UseGuards(TestAuthGuard)
  @Delete()
  async deleteProfile(@Request() req) {
    return this.employerProfilesService.delete(req.user.id);
  }
}
