import { Body, Controller, Post, Req, UseGuards, BadRequestException, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationReportDto } from './dto/pagination-report.dto';

@Controller('reports')
export class ReportsController {
	constructor(
		private readonly service: ReportsService,
		@InjectRepository(StudentProfile)
		private studentProfileRepo: Repository<StudentProfile>,
	) {}

	@Get()
	@Roles('ADMIN')
	@UseGuards(JwtAuthGuard, RolesGuard)
	async getReports(@Query() paginationDto: PaginationReportDto) {
	return this.service.getReports(paginationDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateReportDto) {
		// Get the authenticated user's student profile
		const studentProfile = await this.studentProfileRepo.findOne({
			where: { user: { id: req.user.id } },
		});

		if (!studentProfile) {
			throw new BadRequestException('Student profile not found for user');
		}

		const reporterId = studentProfile.id;

		const created = await this.service.create({
			reporter: { id: reporterId },
			job: { id: dto.jobId },
			reason: dto.reason,
		} as any);

		return created;
	}
}
