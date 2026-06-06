import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ObjectLiteral } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { JobSkill } from '../jobs/job-skill.entity';
import { Application } from '../applications/application.entity';
import { ApplicationStatusHistory } from '../applications/application-status-history.entity';
import { Payment } from '../payments/payment.entity';
import { PaymentStatus } from '../payments/enum/payment-status.enum';
import { User } from '../users/user.entity';
import { UserStatus } from '../users/user-status.enum';
import { StudentSkill } from '../student-profiles/student-skill.entity';
import { SearchHistory } from '../student-profiles/search-history.entity';

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
    @InjectRepository(JobSkill)
    private jobSkillRepository: Repository<JobSkill>,
    @InjectRepository(StudentSkill)
    private studentSkillRepository: Repository<StudentSkill>,
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
    @InjectRepository(ApplicationStatusHistory)
    private applicationStatusHistoryRepository: Repository<ApplicationStatusHistory>,
  ) {}

  async getAdvancedOverview(days = 30) {
    const startDate = this.daysAgo(days);
    const previousStartDate = this.daysAgo(days * 2);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      activeStudents,
      activeEmployers,
      verifiedEmployers,
      liveJobPostings,
      expiringJobs,
      totalApplications,
      acceptedApplications,
      currentStudents,
      previousStudents,
      currentEmployers,
      previousEmployers,
      currentApplications,
      previousApplications,
    ] = await Promise.all([
      this.countUsersByRole('STUDENT', { status: UserStatus.ACTIVE }),
      this.countUsersByRole('EMPLOYER', { status: UserStatus.ACTIVE }),
      this.countUsersByRole('EMPLOYER', { isVerified: true }),
      this.liveJobQuery().getCount(),
      this.liveJobQuery()
        .andWhere('job.deadline IS NOT NULL')
        .andWhere('job.deadline <= :nextWeek', { nextWeek })
        .getCount(),
      this.applicationRepository.count(),
      this.applicationRepository
        .createQueryBuilder('app')
        .leftJoin('app.currentStatus', 'status')
        .where('LOWER(status.name) IN (:...statuses)', {
          statuses: ['accepted', 'hired'],
        })
        .getCount(),
      this.countUsersByRole('STUDENT', { createdFrom: startDate }),
      this.countUsersByRole('STUDENT', {
        createdFrom: previousStartDate,
        createdTo: startDate,
      }),
      this.countUsersByRole('EMPLOYER', { createdFrom: startDate }),
      this.countUsersByRole('EMPLOYER', {
        createdFrom: previousStartDate,
        createdTo: startDate,
      }),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app."appliedAt" >= :startDate', { startDate })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app."appliedAt" >= :previousStartDate', { previousStartDate })
        .andWhere('app."appliedAt" < :startDate', { startDate })
        .getCount(),
    ]);

    return {
      activeStudents,
      activeEmployers,
      verifiedEmployers,
      liveJobPostings,
      expiringJobs,
      conversionRate:
        totalApplications > 0
          ? Math.round((acceptedApplications / totalApplications) * 100)
          : 0,
      studentChangePercent: this.calculateChange(
        currentStudents,
        previousStudents,
      ),
      employerChangePercent: this.calculateChange(
        currentEmployers,
        previousEmployers,
      ),
      applicationChangePercent: this.calculateChange(
        currentApplications,
        previousApplications,
      ),
    };
  }

  async getEmployerEngagement(limit = 5) {
    const rows = await this.applicationRepository
      .createQueryBuilder('app')
      .innerJoin('app.job', 'job')
      .innerJoin('job.employer', 'employer')
      .leftJoin('app.currentStatus', 'status')
      .select('employer.id', 'id')
      .addSelect('employer.companyName', 'name')
      .addSelect('COUNT(DISTINCT app.id)', 'applicationCount')
      .addSelect('COUNT(DISTINCT job.id)', 'jobCount')
      .addSelect(
        `SUM(CASE WHEN LOWER(status.name) IN ('accepted', 'hired') THEN 1 ELSE 0 END)`,
        'acceptedCount',
      )
      .groupBy('employer.id')
      .addGroupBy('employer.companyName')
      .orderBy('COUNT(DISTINCT app.id)', 'DESC')
      .limit(limit)
      .getRawMany<{
        id: string;
        name: string;
        applicationCount: string;
        jobCount: string;
        acceptedCount: string;
      }>();

    const hireRows = await this.applicationStatusHistoryRepository
      .createQueryBuilder('history')
      .innerJoin('history.application', 'app')
      .innerJoin('app.job', 'job')
      .innerJoin('job.employer', 'employer')
      .innerJoin('history.status', 'status')
      .select('employer.id', 'id')
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (history."changedAt" - app."appliedAt")) / 86400)',
        'avgDays',
      )
      .where('LOWER(status.name) IN (:...statuses)', {
        statuses: ['accepted', 'hired'],
      })
      .groupBy('employer.id')
      .getRawMany<{ id: string; avgDays: string }>();

    const avgHireDaysByEmployer = new Map(
      hireRows.map((row) => [row.id, Number.parseFloat(row.avgDays || '0')]),
    );

    return rows.map((row) => {
      const applications = Number.parseInt(row.applicationCount || '0', 10);
      const accepted = Number.parseInt(row.acceptedCount || '0', 10);
      return {
        id: row.id,
        name: row.name || 'Unknown Employer',
        initial: (row.name || 'U').trim().charAt(0).toUpperCase(),
        averageTimeToHireDays: Math.round(
          avgHireDaysByEmployer.get(row.id) || 0,
        ),
        candidateQuality:
          applications > 0 ? Math.round((accepted / applications) * 100) : 0,
        activity: applications + Number.parseInt(row.jobCount || '0', 10),
      };
    });
  }

  async getSkillGapAnalysis(limit = 5) {
    const [demandRows, supplyRows] = await Promise.all([
      this.jobSkillRepository
        .createQueryBuilder('jobSkill')
        .innerJoin('jobSkill.skill', 'skill')
        .select('skill.id', 'skillId')
        .addSelect('skill.name', 'label')
        .addSelect('COUNT(DISTINCT jobSkill.jobId)', 'demand')
        .groupBy('skill.id')
        .addGroupBy('skill.name')
        .getRawMany<{ skillId: string; label: string; demand: string }>(),
      this.studentSkillRepository
        .createQueryBuilder('studentSkill')
        .innerJoin('studentSkill.skill', 'skill')
        .select('skill.id', 'skillId')
        .addSelect('skill.name', 'label')
        .addSelect('COUNT(DISTINCT studentSkill.studentId)', 'supply')
        .groupBy('skill.id')
        .addGroupBy('skill.name')
        .getRawMany<{ skillId: string; label: string; supply: string }>(),
    ]);

    const supplyBySkill = new Map(
      supplyRows.map((row) => [
        row.skillId,
        {
          label: row.label,
          supply: Number.parseInt(row.supply || '0', 10),
        },
      ]),
    );

    const combined = demandRows.map((row) => {
      const demand = Number.parseInt(row.demand || '0', 10);
      const supply = supplyBySkill.get(row.skillId)?.supply ?? 0;
      const gapPercent =
        demand > 0 ? Math.round(((demand - supply) / demand) * 100) : 0;

      return {
        label: row.label,
        demand,
        supply,
        gapPercent,
        status:
          gapPercent > 0
            ? `${gapPercent}% Supply Gap`
            : `${Math.abs(gapPercent)}% Surplus`,
      };
    });

    return combined
      .sort((a, b) => Math.abs(b.gapPercent) - Math.abs(a.gapPercent))
      .slice(0, limit);
  }

  async getUtilizationHeatmap(days = 7) {
    const startDate = this.daysAgo(days);
    const [applications, users, jobs, searches] = await Promise.all([
      this.countByHour(
        this.applicationRepository,
        'app',
        'app."appliedAt"',
        startDate,
      ),
      this.countByHour(this.userRepository, 'u', 'u.created_at', startDate),
      this.countByHour(this.jobRepository, 'job', 'job.created_at', startDate),
      this.countByHour(
        this.searchHistoryRepository,
        'search',
        'search."searchedAt"',
        startDate,
      ),
    ]);

    const totals = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    for (const source of [applications, users, jobs, searches]) {
      for (const row of source) {
        const hour = Number.parseInt(row.hour, 10);
        if (Number.isInteger(hour) && hour >= 0 && hour < 24) {
          totals[hour].count += Number.parseInt(row.count || '0', 10);
        }
      }
    }

    return totals;
  }

  async getPopularSearchTokens(limit = 10) {
    const rows = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('LOWER(TRIM(search."searchQuery"))', 'token')
      .addSelect('COUNT(*)', 'count')
      .where("COALESCE(TRIM(search.\"searchQuery\"), '') <> ''")
      .groupBy('LOWER(TRIM(search."searchQuery"))')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany<{ token: string; count: string }>();

    return rows.map((row) => ({
      token: row.token,
      count: Number.parseInt(row.count || '0', 10),
    }));
  }

  async getSurgeForecast(days = 14, limit = 2) {
    const currentStart = this.daysAgo(days);
    const previousStart = this.daysAgo(days * 2);

    const rows = await this.applicationRepository
      .createQueryBuilder('app')
      .innerJoin('app.job', 'job')
      .leftJoin('job.category', 'category')
      .select("COALESCE(category.name, 'Uncategorized')", 'label')
      .addSelect(
        `SUM(CASE WHEN app."appliedAt" >= :currentStart THEN 1 ELSE 0 END)`,
        'currentCount',
      )
      .addSelect(
        `SUM(CASE WHEN app."appliedAt" >= :previousStart AND app."appliedAt" < :currentStart THEN 1 ELSE 0 END)`,
        'previousCount',
      )
      .where('app."appliedAt" >= :previousStart', { previousStart })
      .setParameter('currentStart', currentStart)
      .groupBy("COALESCE(category.name, 'Uncategorized')")
      .orderBy('"currentCount"', 'DESC')
      .limit(limit)
      .getRawMany<{
        label: string;
        currentCount: string;
        previousCount: string;
      }>();

    return rows.map((row) => {
      const current = Number.parseInt(row.currentCount || '0', 10);
      const previous = Number.parseInt(row.previousCount || '0', 10);
      return {
        label: row.label,
        current,
        previous,
        changePercent: this.calculateChange(current, previous),
      };
    });
  }

  /**
   * Get job creation trend over time
   */
  async getJobTrendData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.jobRepository
      .createQueryBuilder('job')
      .select('DATE(job.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('job.created_at >= :startDate', { startDate })
      .groupBy('DATE(job.created_at)')
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
      .select('DATE(app."appliedAt")', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('app."appliedAt" >= :startDate', { startDate })
      .groupBy('DATE(app."appliedAt")')
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
      .select('DATE(payment.created_at)', 'date')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.created_at >= :startDate', { startDate })
      .andWhere('payment.status = :status', { status: PaymentStatus.PAID })
      .groupBy('DATE(payment.created_at)')
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
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :startDate', { startDate })
      .groupBy('DATE(u.created_at)')
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
        .where('app."appliedAt" BETWEEN :start AND :end', {
          start: period1Start,
          end: period1End,
        })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app."appliedAt" BETWEEN :start AND :end', {
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
      .where('payment.created_at BETWEEN :startDate AND :endDate', {
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

  private countUsersByRole(
    roleName: string,
    filters: {
      status?: UserStatus;
      isVerified?: boolean;
      createdFrom?: Date;
      createdTo?: Date;
    } = {},
  ) {
    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'role')
      .where('UPPER(role.name) = :roleName', {
        roleName: roleName.toUpperCase(),
      });

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
      query.andWhere('u.created_at < :createdTo', {
        createdTo: filters.createdTo,
      });
    }

    return query.getCount();
  }

  private liveJobQuery() {
    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.status', 'status')
      .where('LOWER(status.name) IN (:...statuses)', {
        statuses: ['active', 'open', 'published'],
      })
      .andWhere('(job.deadline IS NULL OR job.deadline >= CURRENT_DATE)')
      .andWhere('job.is_blocked = false');
  }

  private daysAgo(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private countByHour<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    dateColumn: string,
    startDate: Date,
  ) {
    return repository
      .createQueryBuilder(alias)
      .select(`EXTRACT(HOUR FROM ${dateColumn})`, 'hour')
      .addSelect('COUNT(*)', 'count')
      .where(`${dateColumn} >= :startDate`, { startDate })
      .groupBy(`EXTRACT(HOUR FROM ${dateColumn})`)
      .getRawMany<{ hour: string; count: string }>();
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
