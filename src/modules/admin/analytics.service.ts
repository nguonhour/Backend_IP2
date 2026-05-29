import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { PaymentStatus } from '../payments/enum/payment-status.enum';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get job creation trend over time
   */
  async getJobTrendData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.jobRepository
      .createQueryBuilder('job')
      .select('DATE(job.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('job.createdAt >= :startDate', { startDate })
      .groupBy('DATE(job.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return this.formatTrendData(data, startDate);
  }

  /**
   * Get application trend over time
   */
  async getApplicationTrendData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.applicationRepository
      .createQueryBuilder('app')
      .select('DATE(app.appliedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('app.appliedAt >= :startDate', { startDate })
      .groupBy('DATE(app.appliedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return this.formatTrendData(data, startDate);
  }

  /**
   * Get revenue trend over time
   */
  async getRevenueTrendData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.createdAt)', 'date')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.createdAt >= :startDate', { startDate })
      .andWhere('payment.status = :status', { status: PaymentStatus.PAID })
      .groupBy('DATE(payment.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data.map((d) => ({
      date: d.date,
      revenue: parseFloat(d.revenue || '0'),
    }));
  }

  /**
   * Get user registration trend
   */
  async getUserTrendData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return this.formatTrendData(data, startDate);
  }

  /**
   * Get comparison metrics for two time periods
   */
  async getComparisonMetrics(period1Days = 30, period2Days = 30) {
    const now = new Date();
    const period1End = new Date(now);
    const period1Start = new Date(now);
    period1Start.setDate(period1Start.getDate() - period1Days);

    const period2End = new Date(period1Start);
    const period2Start = new Date(period1Start);
    period2Start.setDate(period2Start.getDate() - period2Days);

    const [
      period1Jobs,
      period2Jobs,
      period1Apps,
      period2Apps,
      period1Revenue,
      period2Revenue,
      period1Users,
      period2Users,
    ] = await Promise.all([
      this.jobRepository.count({
        where: { createdAt: Between(period1Start, period1End) },
      }),
      this.jobRepository.count({
        where: { createdAt: Between(period2Start, period2End) },
      }),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app.appliedAt BETWEEN :start AND :end', {
          start: period1Start,
          end: period1End,
        })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app.appliedAt BETWEEN :start AND :end', {
          start: period2Start,
          end: period2End,
        })
        .getCount(),
      this.getRevenueForPeriod(period1Start, period1End),
      this.getRevenueForPeriod(period2Start, period2End),
      this.userRepository.count({
        where: { createdAt: Between(period1Start, period1End) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(period2Start, period2End) },
      }),
    ]);

    return {
      jobs: {
        period1: period1Jobs,
        period2: period2Jobs,
        changePercent: this.calculateChange(period2Jobs, period1Jobs),
      },
      applications: {
        period1: period1Apps,
        period2: period2Apps,
        changePercent: this.calculateChange(period2Apps, period1Apps),
      },
      revenue: {
        period1: period1Revenue,
        period2: period2Revenue,
        changePercent: this.calculateChange(period2Revenue, period1Revenue),
      },
      users: {
        period1: period1Users,
        period2: period2Users,
        changePercent: this.calculateChange(period2Users, period1Users),
      },
    };
  }

  /**
   * Get conversion funnel metrics
   */
  async getConversionFunnel() {
    const totalJobs = await this.jobRepository.count();
    const jobsWithApplications = await this.jobRepository
      .createQueryBuilder('job')
      .select('COUNT(DISTINCT job.id)', 'count')
      .leftJoin('job.applications', 'app')
      .where('app.id IS NOT NULL')
      .getRawOne<{ count: string }>();

    const totalApplications = await this.applicationRepository.count();
    const acceptedApplications = await this.applicationRepository
      .createQueryBuilder('app')
      .leftJoin('app.currentStatus', 'status')
      .where('status.name = :status', { status: 'accepted' })
      .getCount();

    return {
      jobsCreated: totalJobs,
      jobsWithApplications: parseInt(jobsWithApplications?.count || '0', 10),
      applicationSubmitted: totalApplications,
      applicationsAccepted: acceptedApplications,
      jobsWithApplicationsRate:
        totalJobs > 0
          ? Math.round(
              (parseInt(jobsWithApplications?.count || '0', 10) / totalJobs) *
                100,
            )
          : 0,
      applicationAcceptanceRate:
        totalApplications > 0
          ? Math.round((acceptedApplications / totalApplications) * 100)
          : 0,
    };
  }

  /**
   * Helper: Get revenue for a period
   */
  private async getRevenueForPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  /**
   * Helper: Calculate percentage change
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Helper: Format trend data with filled dates
   */
  private formatTrendData(
    data: Array<{ date: string; count: string }>,
    startDate: Date,
  ) {
    const result: Array<{ date: string; count: number }> = [];
    const dataMap = new Map(data.map((d) => [d.date, parseInt(d.count, 10)]));

    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }
}
