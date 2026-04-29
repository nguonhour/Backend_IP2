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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('employers')
export class EmployerProfilesController {
  constructor(
    private readonly employerProfilesService: EmployerProfilesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateEmployerProfileDto,
  ) {
    // Create employer profile for the authenticated user
    return this.employerProfilesService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req: AuthenticatedRequest) {
    return this.employerProfilesService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.employerProfilesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerProfilesService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Request() req: AuthenticatedRequest) {
    return this.employerProfilesService.delete(req.user.id);
  }
}
