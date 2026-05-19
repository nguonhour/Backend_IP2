import { Body, Controller, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('reports')
export class ReportsController {
	constructor(
		private readonly service: ReportsService,
		@InjectRepository(StudentProfile)
		private studentProfileRepo: Repository<StudentProfile>,
	) {}

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
