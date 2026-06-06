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
import { AuditLog } from '../audit-logs/audit-log.entity';
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

  private buildUserRoleCountQuery(roleName: string) {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'role')
      .where('UPPER(role.name) = :roleName', {
        roleName: roleName.toUpperCase(),
      });
  }

  private countUsersByRole(
    roleName: string,
    filters: {
      status?: UserStatus;
      isVerified?: boolean;
      createdFrom?: Date;
      createdTo?: Date;
    } = {},
  ): Promise<number> {
    const query = this.buildUserRoleCountQuery(roleName);

    if (filters.status) {
      query.andWhere('u.status = :status', { status: filters.status });
    }

    if (filters.isVerified !== undefined) {
      query.andWhere('u.is_verified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    if (filters.createdFrom) {
      query.andWhere('u.created_at >= :createdFrom', {
        createdFrom: filters.createdFrom,
      });
    }

    if (filters.createdTo) {
      query.andWhere('u.created_at <= :createdTo', {
        createdTo: filters.createdTo,
      });
    }

    return query.getCount();
  }

  /**
   * Get overview dashboard statistics
   */
  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      totalApplications,
      newApplicantsToday,
      newStudentsThisWeek,
      newEmployersThisWeek,
      activeJobs,
      pendingReports,
      openReports,
      totalRevenue,
    ] = await Promise.all([
      this.countUsersByRole('STUDENT'),
      this.countUsersByRole('EMPLOYER'),
      this.jobRepository.count(),
      this.applicationRepository.count(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app."appliedAt" >= :today', { today })
        .getCount(),
      this.countUsersByRole('STUDENT', {
        createdFrom: weekStart,
        createdTo: new Date(),
      }),
      this.countUsersByRole('EMPLOYER', {
        createdFrom: weekStart,
        createdTo: new Date(),
      }),
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
      newApplicantsToday,
      newStudentsThisWeek,
      newEmployersThisWeek,
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
      this.countUsersByRole('STUDENT'),
      this.countUsersByRole('EMPLOYER'),
      this.countUsersByRole('STUDENT', { status: UserStatus.ACTIVE }),
      this.countUsersByRole('EMPLOYER', { isVerified: true }),
      this.countUsersByRole('EMPLOYER', { isVerified: false }),
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
      .select('status.name', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('job.status', 'status')
      .groupBy('status.name')
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
        .where('app."appliedAt" >= :startDate', { startDate })
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

    const applications = await this.applicationRepository
      .createQueryBuilder('app')
      .select('DATE(app."appliedAt")', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('app."appliedAt" >= :startDate', { startDate })
      .groupBy('DATE(app."appliedAt")')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

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
      applications: this.fillCountTrend(applications, startDate),
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
      .andWhere('payment.created_at >= :startDate', { startDate })
      .getRawOne<{ total: string }>();

    const revenueAllTime = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ total: string }>();

    const planBreakdown = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.plan_type', 'plan')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .groupBy('payment.plan_type')
      .getRawMany();

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.created_at)', 'date')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .groupBy('DATE(payment.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; amount: string }>();

    return {
      totalTransactions: total,
      successfulTransactions: successful,
      failedTransactions: failed,
      pendingTransactions: pending,
      successRatePercentage:
        total > 0 ? Math.round((successful / total) * 100) : 0,
      revenueThisPeriod: parseFloat(revenueResult?.total || '0'),
      totalRevenueAllTime: parseFloat(revenueAllTime?.total || '0'),
      payments: this.fillMoneyTrend(payments, startDate),
      planBreakdown: planBreakdown.map((plan) => ({
        plan: plan.plan || 'Unassigned',
        count: parseInt(plan.count || '0', 10),
        revenue: parseFloat(plan.revenue || '0'),
      })),
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
   * Get latest reports for the dashboard report table
   */
  async getRecentReports(limit = 5) {
    const reports = await this.reportRepository.find({
      relations: ['user', 'job', 'job.employer'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return reports.map((report) => ({
      id: report.id,
      type: report.type,
      status: report.status,
      description: report.description,
      reportItem:
        report.job?.employer?.companyName ||
        report.job?.title ||
        report.user?.email ||
        'Unknown',
      jobId: report.jobId,
      jobTitle: report.job?.title || null,
      reporterEmail: report.user?.email || 'Unknown',
      createdAt: report.createdAt,
    }));
  }

  /**
   * Get activity trend over days
   */
  async getActivityTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userCreations = await this.userRepository
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :startDate', { startDate })
      .groupBy('DATE(u.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const jobCreations = await this.jobRepository
      .createQueryBuilder('j')
      .select('DATE(j.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('j.created_at >= :startDate', { startDate })
      .groupBy('DATE(j.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const applicationCreations = await this.applicationRepository
      .createQueryBuilder('a')
      .select('DATE(a."appliedAt")', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a."appliedAt" >= :startDate', { startDate })
      .groupBy('DATE(a."appliedAt")')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      userCreations: this.fillCountTrend(userCreations, startDate),
      jobCreations: this.fillCountTrend(jobCreations, startDate),
      applicationCreations: this.fillCountTrend(
        applicationCreations,
        startDate,
      ),
    };
  }

  /**
   * Get top reported jobs
   */
  async getTopReportedJobs(limit = 10) {
    return this.reportRepository
      .createQueryBuilder('r')
      .select('r.job_id', 'jobId')
      .addSelect('COUNT(*)', 'report_count')
      .addSelect('job.title', 'jobTitle')
      .leftJoin('r.job', 'job')
      .where('r.job_id IS NOT NULL')
      .groupBy('r.job_id')
      .addGroupBy('job.title')
      .orderBy('report_count', 'DESC')
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

  private fillCountTrend(
    data: Array<{ date: string | Date; count: string | number }>,
    startDate: Date,
  ) {
    const dataMap = new Map(
      data.map((item) => [
        this.toDateKey(item.date),
        Number.parseInt(String(item.count), 10) || 0,
      ]),
    );

    return this.fillDateRange(startDate, (date) => ({
      date,
      count: dataMap.get(date) || 0,
    }));
  }

  private fillMoneyTrend(
    data: Array<{ date: string | Date; amount: string | number }>,
    startDate: Date,
  ) {
    const dataMap = new Map(
      data.map((item) => [
        this.toDateKey(item.date),
        Number.parseFloat(String(item.amount)) || 0,
      ]),
    );

    return this.fillDateRange(startDate, (date) => ({
      date,
      amount: dataMap.get(date) || 0,
    }));
  }

  private fillDateRange<T>(
    startDate: Date,
    createItem: (date: string) => T,
  ): T[] {
    const result: T[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      result.push(createItem(this.toDateKey(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  private toDateKey(date: string | Date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    return String(date).split('T')[0];
  }
}
