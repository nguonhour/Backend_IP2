import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status-dto';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.entity';
import { Job } from '../jobs/job.entity';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { PaginationReportDto } from './dto/pagination-report.dto';

const DEFAULT_REPORT_STATUS = 'OPEN';
const REPORT_RELATIONS = [
  'reporter',
  'reporter.user',
  'job',
  'job.employer',
  'status',
  'reportType',
];

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportStatus)
    private readonly reportStatusRepository: Repository<ReportStatus>,
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async getReports(paginationDto: PaginationReportDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [reports, total] = await this.reportRepository.findAndCount({
      relations: REPORT_RELATIONS,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: reports,
      meta: {
        totalItems: total,
        itemCount: reports.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getReportById(id: string) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: REPORT_RELATIONS,
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async createReport(userId: string, dto: CreateReportDto) {
    const [reporter, job, reportType, status] = await Promise.all([
      this.getStudentProfileByUserId(userId),
      this.getJobById(dto.jobId),
      this.getReportTypeById(dto.reportTypeId),
      this.getDefaultReportStatus(),
    ]);

    const report = this.reportRepository.create({
      reason: dto.reason,
      reporter: { id: reporter.id },
      job: { id: job.id },
      reportType: { id: reportType.id },
      status: { id: status.id },
    });

    const savedReport = await this.reportRepository.save(report);
    return this.getReportById(savedReport.id);
  }

  async updateReportStatus(id: string, dto: UpdateReportStatusDto) {
    const report = await this.getReportById(id);
    const status = await this.reportStatusRepository.findOne({
      where: { id: dto.statusId },
    });

    if (!status) {
      throw new NotFoundException('Report status not found');
    }

    report.status = { id: status.id } as Report['status'];
    await this.reportRepository.save(report);

    return this.getReportById(id);
  }

  private async getStudentProfileByUserId(userId: string) {
    const student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  private async getJobById(jobId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private async getReportTypeById(reportTypeId: string) {
    const reportType = await this.reportTypeRepository.findOne({
      where: { id: reportTypeId },
    });

    if (!reportType) {
      throw new NotFoundException('Report type not found');
    }

    return reportType;
  }

  private async getDefaultReportStatus() {
    const status = await this.reportStatusRepository.findOne({
      where: { name: ILike(DEFAULT_REPORT_STATUS) },
    });

    if (!status) {
      throw new NotFoundException('Default report status not found');
    }

    return status;
  }
}
