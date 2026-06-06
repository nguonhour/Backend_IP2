import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { PaymentStatus } from '../payments/enum/payment-status.enum';
import { Report } from '../reports/report.entity';
import { ReportStatus } from '../reports/report-status.enum';

@Injectable()
export class AdminService {
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
  ) {}

  private countUsersByRole(roleName: string): Promise<number> {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'role')
      .where('UPPER(role.name) = :roleName', {
        roleName: roleName.toUpperCase(),
      })
      .getCount();
  }

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      newApplicantsToday,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      this.countUsersByRole('STUDENT'),
      this.countUsersByRole('EMPLOYER'),
      this.jobRepository.count(),
      this.applicationRepository
        .createQueryBuilder('app')
        .where('app."appliedAt" >= :today', { today })
        .getCount(),
      this.reportRepository.count(),
      this.reportRepository.count({
        where: { status: ReportStatus.OPEN },
      }),
    ]);

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne<{ total: string }>();

    const totalRevenue = parseFloat(revenueResult?.total ?? '0');

    return {
      totalStudents,
      totalEmployers,
      totalJobs,
      newApplicantsToday,
      totalReports,
      pendingReports,
      totalRevenue,
    };
  }
}
