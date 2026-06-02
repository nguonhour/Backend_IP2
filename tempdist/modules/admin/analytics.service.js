"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("../jobs/job.entity");
const application_entity_1 = require("../applications/application.entity");
const payment_entity_1 = require("../payments/payment.entity");
const payment_status_enum_1 = require("../payments/enum/payment-status.enum");
const user_entity_1 = require("../users/user.entity");
let AnalyticsService = class AnalyticsService {
    jobRepository;
    applicationRepository;
    paymentRepository;
    userRepository;
    constructor(jobRepository, applicationRepository, paymentRepository, userRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }
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
    async getRevenueTrendData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const data = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('DATE(payment.createdAt)', 'date')
            .addSelect('SUM(payment.amount)', 'revenue')
            .where('payment.createdAt >= :startDate', { startDate })
            .andWhere('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .groupBy('DATE(payment.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        return data.map((d) => ({
            date: d.date,
            revenue: parseFloat(d.revenue || '0'),
        }));
    }
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
    async getComparisonMetrics(period1Days = 30, period2Days = 30) {
        const now = new Date();
        const period1End = new Date(now);
        const period1Start = new Date(now);
        period1Start.setDate(period1Start.getDate() - period1Days);
        const period2End = new Date(period1Start);
        const period2Start = new Date(period1Start);
        period2Start.setDate(period2Start.getDate() - period2Days);
        const [period1Jobs, period2Jobs, period1Apps, period2Apps, period1Revenue, period2Revenue, period1Users, period2Users,] = await Promise.all([
            this.jobRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(period1Start, period1End) },
            }),
            this.jobRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(period2Start, period2End) },
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
                where: { createdAt: (0, typeorm_2.Between)(period1Start, period1End) },
            }),
            this.userRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(period2Start, period2End) },
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
    async getConversionFunnel() {
        const totalJobs = await this.jobRepository.count();
        const jobsWithApplications = await this.jobRepository
            .createQueryBuilder('job')
            .select('COUNT(DISTINCT job.id)', 'count')
            .leftJoin('job.applications', 'app')
            .where('app.id IS NOT NULL')
            .getRawOne();
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
            jobsWithApplicationsRate: totalJobs > 0
                ? Math.round((parseInt(jobsWithApplications?.count || '0', 10) / totalJobs) *
                    100)
                : 0,
            applicationAcceptanceRate: totalApplications > 0
                ? Math.round((acceptedApplications / totalApplications) * 100)
                : 0,
        };
    }
    async getRevenueForPeriod(startDate, endDate) {
        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.createdAt BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .andWhere('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .getRawOne();
        return parseFloat(result?.total || '0');
    }
    calculateChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }
    formatTrendData(data, startDate) {
        const result = [];
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map