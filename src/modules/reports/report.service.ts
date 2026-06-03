import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Report } from './report.entity';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { ReportType } from './report-type.enum';
import { ReportStatus } from './report-status.enum';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification-type.enum';
import { NotificationChannel } from '../notifications/notification-channel.enum';
import { AuditService } from '../audit-logs/audit.service';
import { AuditAction } from '../audit-logs/audit-log.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a new report
   */
  async createReport(
    userId: string,
    type: ReportType,
    description: string,
    jobId?: string,
    metadata?: Record<string, any>,
  ): Promise<Report> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Validate jobId if provided
    if (jobId) {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundException(`Job ${jobId} not found`);
      }
    }

    const report = this.reportRepository.create({
      userId,
      jobId: jobId || null,
      type,
      description,
      reason: description,
      status: ReportStatus.OPEN,
      metadata,
    });

    const saved = await this.reportRepository.save(report);

    // Notify admins about new report
    // TODO: Get admin user IDs from database and notify them
    console.log(`New report created: ${saved.id}`);

    return saved;
  }

  /**
   * Get all reports with filtering (admin only)
   */
  async getReports(
    page = 1,
    limit = 20,
    status?: ReportStatus,
    type?: ReportType,
    jobId?: string,
  ) {
    let query = this.reportRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('r.job', 'job')
      .leftJoinAndSelect('job.employer', 'employer');

    if (status) {
      query = query.andWhere('r.status = :status', { status });
    }

    if (type) {
      query = query.andWhere('r.type = :type', { type });
    }

    if (jobId) {
      query = query.andWhere('r.job_id = :jobId', { jobId });
    }

    query = query.orderBy('r.createdAt', 'DESC');

    const currentPage = Math.max(page, 1);
    const itemsPerPage = Math.max(limit, 1);
    const skip = (currentPage - 1) * itemsPerPage;
    const [data, total] = await query
      .skip(skip)
      .take(itemsPerPage)
      .getManyAndCount();

    return {
      data,
      total,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage,
        totalPages: Math.max(Math.ceil(total / itemsPerPage), 1),
        currentPage,
      },
    };
  }

  /**
   * Get reports by user
   */
  async getUserReports(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.reportRepository.findAndCount({
      where: { userId },
      relations: ['job', 'user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get reports for a specific job
   */
  async getJobReports(jobId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.reportRepository.findAndCount({
      where: { jobId },
      relations: ['user', 'job'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get single report by ID
   */
  async getReportById(reportId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['user', 'job', 'job.employer'],
    });

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    return report;
  }

  /**
   * Update report status and add admin notes
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    adminId: string,
    adminNotes?: string,
  ): Promise<Report> {
    const report = await this.getReportById(reportId);
    const oldData = {
      status: report.status,
      adminNotes: report.adminNotes,
    };

    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }

    if (
      status === ReportStatus.RESOLVED ||
      status === ReportStatus.DISMISSED ||
      status === ReportStatus.ACTION_TAKEN
    ) {
      report.resolvedAt = new Date();
      report.resolvedByAdminId = adminId;
    }

    const updated = await this.reportRepository.save(report);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      module: 'reports',
      entityId: reportId,
      entityType: 'Report',
      oldData,
      newData: {
        status: updated.status,
        adminNotes: updated.adminNotes,
        resolvedAt: updated.resolvedAt,
      },
      description: `Report status updated to ${status}`,
    });

    // Notify reporter about status change
    await this.notificationService.createNotification(
      report.userId,
      NotificationType.REPORT_STATUS_CHANGED,
      'Report Status Updated',
      `Your report has been reviewed. Status: ${status}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''}`,
      NotificationChannel.IN_APP,
      {
        referenceId: reportId,
        metadata: {
          reportId,
          newStatus: status,
        },
      },
    );

    return updated;
  }

  /**
   * Resolve a report with action
   */
  async resolveReport(
    reportId: string,
    action: 'REMOVE_JOB' | 'SUSPEND_EMPLOYER' | 'DISMISS' | 'OTHER',
    adminId: string,
    adminNotes: string,
  ): Promise<Report> {
    const report = await this.getReportById(reportId);

    // If action is to remove job, update job status
    if (action === 'REMOVE_JOB' && report.jobId) {
      // TODO: Update job status to removed/deleted
      console.log(`Job ${report.jobId} should be removed`);
    }

    // If action is to suspend employer, update employer status
    if (action === 'SUSPEND_EMPLOYER' && report.job?.employer?.id) {
      // TODO: Suspend employer account
      console.log(`Employer ${report.job.employer.id} should be suspended`);
    }

    // Update report status
    const updated = await this.updateReportStatus(
      reportId,
      action === 'DISMISS' ? ReportStatus.DISMISSED : ReportStatus.ACTION_TAKEN,
      adminId,
      adminNotes,
    );

    return updated;
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string, adminId: string): Promise<void> {
    const report = await this.getReportById(reportId);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.DELETE,
      module: 'reports',
      entityId: reportId,
      entityType: 'Report',
      oldData: {
        type: report.type,
        description: report.description,
        status: report.status,
      },
      newData: undefined,
      description: `Report deleted`,
    });

    await this.reportRepository.remove(report);
  }

  /**
   * Get report statistics for dashboard
   */
  async getStats() {
    const total = await this.reportRepository.count();
    const open = await this.reportRepository.count({ where: { status: ReportStatus.OPEN } });
    const underReview = await this.reportRepository.count({
      where: { status: ReportStatus.UNDER_REVIEW },
    });
    const resolved = await this.reportRepository.count({
      where: { status: ReportStatus.RESOLVED },
    });
    const dismissed = await this.reportRepository.count({
      where: { status: ReportStatus.DISMISSED },
    });
    const actionTaken = await this.reportRepository.count({
      where: { status: ReportStatus.ACTION_TAKEN },
    });

    // Reports by type
    const byType = await this.reportRepository
      .createQueryBuilder('r')
      .select('r.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.type')
      .getRawMany();

    // Most reported jobs
    const mostReportedJobs = await this.reportRepository
      .createQueryBuilder('r')
      .select('r.job_id', 'jobId')
      .addSelect('COUNT(*)', 'count')
      .where('r.job_id IS NOT NULL')
      .groupBy('r.job_id')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      byStatus: {
        open,
        underReview,
        resolved,
        dismissed,
        actionTaken,
      },
      byType,
      mostReportedJobs,
    };
  }
}
