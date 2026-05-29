import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/user.entity';
import { UserStatus } from '../users/user-status.enum';
import { Job } from '../jobs/job.entity';
import { JobApprovalStatus } from '../jobs/job-approval-status.enum';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { PaymentStatus } from '../payments/enum/payment-status.enum';
import { Report } from '../reports/report.entity';
import { ReportStatus } from '../reports/report-status.enum';
import { AuditLog, AuditAction } from '../audit-logs/audit-log.entity';
import { Notification } from '../notifications/notification.entity';
import { NotificationStatus } from '../notifications/notification-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Get overview dashboard statistics
   */
  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingReports,
      openReports,
      totalRevenue,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: { name: 'STUDENT' } } }),
      this.userRepository.count({ where: { role: { name: 'EMPLOYER' } } }),
      this.jobRepository.count(),
      this.applicationRepository.count(),
      this.jobRepository.count({ where: { status: { name: 'active' } } }),
      this.reportRepository.count({ where: { status: ReportStatus.OPEN } }),
      this.reportRepository.count({
        where: { status: ReportStatus.UNDER_REVIEW },
      }),
      this.getRevenue(),
    ]);

    return {
      totalStudents,
      totalEmployers,
      totalUsers: totalStudents + totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingReports,
      openReports,
      totalRevenue,
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalStudents,
      totalEmployers,
      activeStudents,
      verifiedEmployers,
      unverifiedEmployers,
      suspendedUsers,
      newUsersThisPeriod,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: { name: 'STUDENT' } } }),
      this.userRepository.count({ where: { role: { name: 'EMPLOYER' } } }),
      this.userRepository.count({
        where: {
          role: { name: 'STUDENT' },
          status: UserStatus.ACTIVE,
        },
      }),
      this.userRepository.count({
        where: {
          role: { name: 'EMPLOYER' },
          isVerified: true,
        },
      }),
      this.userRepository.count({
        where: {
          role: { name: 'EMPLOYER' },
          isVerified: false,
        },
      }),
      this.userRepository.count({
        where: { status: UserStatus.SUSPENDED },
      }),
      this.userRepository.count({
        where: { createdAt: Between(startDate, new Date()) },
      }),
    ]);

    return {
      totalStudents,
      totalEmployers,
      activeStudents,
      verifiedEmployers,
      unverifiedEmployers,
      suspendedUsers,
      newUsersThisPeriod,
      statusBreakdown: {
        active: await this.userRepository.count({
          where: { status: UserStatus.ACTIVE },
        }),
        suspended: suspendedUsers,
        blocked: await this.userRepository.count({
          where: { status: UserStatus.BLOCKED },
        }),
        unverified: await this.userRepository.count({
          where: { status: UserStatus.UNVERIFIED },
        }),
        pendingApproval: await this.userRepository.count({
          where: { status: UserStatus.PENDING_APPROVAL },
        }),
      },
    };
  }

  /**
   * Get job statistics
   */
  async getJobStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalJobs,
      approvedJobs,
      pendingJobs,
      rejectedJobs,
      newJobsThisPeriod,
      jobsWithApplications,
    ] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({
        where: { approvalStatus: JobApprovalStatus.APPROVED },
      }),
      this.jobRepository.count({
        where: { approvalStatus: JobApprovalStatus.PENDING_APPROVAL },
      }),
      this.jobRepository.count({
        where: { approvalStatus: JobApprovalStatus.REJECTED },
      }),
      this.jobRepository.count({
        where: { createdAt: Between(startDate, new Date()) },
      }),
      this.jobRepository
        .createQueryBuilder('job')
        .select('COUNT(DISTINCT job.id)', 'count')
        .leftJoin('job.applications', 'app')
        .where('app.id IS NOT NULL')
        .getRawOne<{ count: string }>(),
    ]);

    const statusBreakdown = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status.name', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('job.status', 'status')
      .groupBy('job.status.name')
      .getRawMany();

    return {
      totalJobs,
      approvedJobs,
      pendingJobs,
      rejectedJobs,
      newJobsThisPeriod,
      jobsWithApplications: parseInt(jobsWithApplications?.count || '0', 10),
      statusBreakdown,
      approvalRatePercentage:
        totalJobs > 0
          ? Math.round((approvedJobs / (approvedJobs + rejectedJobs)) * 100) ||
            0
          : 0,
    };
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalApplications,
      newApplicationsThisPeriod,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
    ] = await Promise.all([
      this.applicationRepository.count(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app.appliedAt >= :startDate', { startDate })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .leftJoin('app.currentStatus', 'status')
        .where('status.name = :status', { status: 'accepted' })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .leftJoin('app.currentStatus', 'status')
        .where('status.name = :status', { status: 'rejected' })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .leftJoin('app.currentStatus', 'status')
        .where('status.name = :status', { status: 'pending' })
        .getCount(),
    ]);

    const statusBreakdown = await this.applicationRepository
      .createQueryBuilder('app')
      .select('status.name', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('app.currentStatus', 'status')
      .groupBy('status.name')
      .getRawMany();

    const conversionRate =
      totalApplications > 0
        ? (acceptedApplications / totalApplications) * 100
        : 0;

    return {
      totalApplications,
      newApplicationsThisPeriod,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
      statusBreakdown,
      conversionRatePercentage: Math.round(conversionRate),
    };
  }

  /**
   * Get payment and revenue statistics
   */
  async getPaymentStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, successful, failed, pending] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository.count({ where: { status: PaymentStatus.PAID } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
      this.paymentRepository.count({
        where: { status: PaymentStatus.PENDING },
      }),
    ]);

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt >= :startDate', { startDate })
      .getRawOne<{ total: string }>();

    const revenueAllTime = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ total: string }>();

    const planBreakdown = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.planType', 'plan')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .groupBy('payment.planType')
      .getRawMany();

    return {
      totalTransactions: total,
      successfulTransactions: successful,
      failedTransactions: failed,
      pendingTransactions: pending,
      successRatePercentage:
        total > 0 ? Math.round((successful / total) * 100) : 0,
      revenueThisPeriod: parseFloat(revenueResult?.total || '0'),
      totalRevenueAllTime: parseFloat(revenueAllTime?.total || '0'),
      planBreakdown,
    };
  }

  /**
   * Get report statistics
   */
  async getReportStats() {
    const [
      totalReports,
      openReports,
      underReview,
      resolved,
      dismissed,
      actionTaken,
    ] = await Promise.all([
      this.reportRepository.count(),
      this.reportRepository.count({ where: { status: ReportStatus.OPEN } }),
      this.reportRepository.count({
        where: { status: ReportStatus.UNDER_REVIEW },
      }),
      this.reportRepository.count({
        where: { status: ReportStatus.RESOLVED },
      }),
      this.reportRepository.count({
        where: { status: ReportStatus.DISMISSED },
      }),
      this.reportRepository.count({
        where: { status: ReportStatus.ACTION_TAKEN },
      }),
    ]);

    const typeBreakdown = await this.reportRepository
      .createQueryBuilder('r')
      .select('r.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.type')
      .getRawMany();

    const resolutionRate = (resolved + actionTaken) / (totalReports || 1);

    return {
      totalReports,
      openReports,
      underReview,
      resolved,
      dismissed,
      actionTaken,
      resolutionRatePercentage: Math.round(resolutionRate * 100),
      typeBreakdown,
    };
  }

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(limit = 20) {
    const logs = await this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      module: log.module,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId,
      userName: log.user ? `${log.user.email}` : 'Unknown',
      description: log.description,
      timestamp: log.createdAt,
    }));
  }

  /**
   * Get activity trend over days
   */
  async getActivityTrend(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userCreations = await this.userRepository
      .createQueryBuilder('u')
      .select('DATE(u.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.createdAt >= :startDate', { startDate })
      .groupBy('DATE(u.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const jobCreations = await this.jobRepository
      .createQueryBuilder('j')
      .select('DATE(j.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('j.createdAt >= :startDate', { startDate })
      .groupBy('DATE(j.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const applicationCreations = await this.applicationRepository
      .createQueryBuilder('a')
      .select('DATE(a.appliedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.appliedAt >= :startDate', { startDate })
      .groupBy('DATE(a.appliedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      userCreations,
      jobCreations,
      applicationCreations,
    };
  }

  /**
   * Get top reported jobs
   */
  async getTopReportedJobs(limit = 10) {
    return this.reportRepository
      .createQueryBuilder('r')
      .select('r.jobId', 'jobId')
      .addSelect('COUNT(*)', 'reportCount')
      .addSelect('job.title', 'jobTitle')
      .leftJoin('r.job', 'job')
      .where('r.jobId IS NOT NULL')
      .groupBy('r.jobId')
      .addGroupBy('job.title')
      .orderBy('reportCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    const [
      totalUsers,
      activeJobsToday,
      pendingApprovals,
      failedTransactions,
      unreadNotifications,
    ] = await Promise.all([
      this.userRepository.count(),
      this.jobRepository.count({
        where: { status: { name: 'active' } },
      }),
      this.jobRepository.count({
        where: { approvalStatus: JobApprovalStatus.PENDING_APPROVAL },
      }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
      this.notificationRepository.count({
        where: { status: NotificationStatus.PENDING },
      }),
    ]);

    return {
      totalUsers,
      activeJobsToday,
      pendingApprovals,
      failedTransactions,
      unreadNotifications,
      systemStatus:
        failedTransactions === 0 && pendingApprovals < 100
          ? 'HEALTHY'
          : 'WARNING',
    };
  }

  /**
   * Helper: Get total revenue
   */
  private async getRevenue(): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }
}
