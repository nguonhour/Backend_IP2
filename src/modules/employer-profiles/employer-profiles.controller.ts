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
import { CreateEmployerCategoryDto } from './dto/create-employer-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('employers')
export class EmployerProfilesController {
  constructor(
    private readonly employerProfilesService: EmployerProfilesService,
  ) {}

  @Get('partners')
  async getAllPartners() {
    return this.employerProfilesService.getAllPartnets();
  }

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
  @Get('me/categories')
  async getMyCategories(@Request() req: AuthenticatedRequest) {
    return this.employerProfilesService.getCategories(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/categories')
  async createMyCategory(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateEmployerCategoryDto,
  ) {
    return this.employerProfilesService.createCategory(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/categories/:id')
  async deleteMyCategory(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.employerProfilesService.deleteCategory(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.employerProfilesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMyProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerProfilesService.update(req.user.id, dto);
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
