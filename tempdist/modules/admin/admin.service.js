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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const job_entity_1 = require("../jobs/job.entity");
const application_entity_1 = require("../applications/application.entity");
const payment_entity_1 = require("../payments/payment.entity");
const payment_status_enum_1 = require("../payments/enum/payment-status.enum");
const report_entity_1 = require("../reports/report.entity");
const report_status_enum_1 = require("../reports/report-status.enum");
let AdminService = class AdminService {
    userRepository;
    jobRepository;
    applicationRepository;
    paymentRepository;
    reportRepository;
    constructor(userRepository, jobRepository, applicationRepository, paymentRepository, reportRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.paymentRepository = paymentRepository;
        this.reportRepository = reportRepository;
    }
    async getDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalStudents, totalEmployers, totalJobs, newApplicantsToday, totalReports, pendingReports,] = await Promise.all([
            this.userRepository.count({
                where: { role: { name: 'STUDENT' } },
            }),
            this.userRepository.count({
                where: { role: { name: 'EMPLOYER' } },
            }),
            this.jobRepository.count(),
            this.applicationRepository
                .createQueryBuilder('app')
                .where('app.appliedAt >= :today', { today })
                .getCount(),
            this.reportRepository.count(),
            this.reportRepository.count({
                where: { status: report_status_enum_1.ReportStatus.OPEN },
            }),
        ]);
        const revenueResult = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.PAID })
            .getRawOne();
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map