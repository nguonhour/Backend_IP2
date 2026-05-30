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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getOverview() {
        return this.dashboardService.getOverview();
    }
    async getUserStats(days) {
        return this.dashboardService.getUserStats(parseInt(days || '30', 10));
    }
    async getJobStats(days) {
        return this.dashboardService.getJobStats(parseInt(days || '30', 10));
    }
    async getApplicationStats(days) {
        return this.dashboardService.getApplicationStats(parseInt(days || '30', 10));
    }
    async getPaymentStats(days) {
        return this.dashboardService.getPaymentStats(parseInt(days || '30', 10));
    }
    async getReportStats() {
        return this.dashboardService.getReportStats();
    }
    async getAuditLogs(limit) {
        return this.dashboardService.getRecentAuditLogs(parseInt(limit || '20', 10));
    }
    async getActivityTrend(days) {
        return this.dashboardService.getActivityTrend(parseInt(days || '30', 10));
    }
    async getTopReportedJobs(limit) {
        return this.dashboardService.getTopReportedJobs(parseInt(limit || '10', 10));
    }
    async getSystemHealth() {
        return this.dashboardService.getSystemHealth();
    }
    async getComprehensive() {
        const [overview, userStats, jobStats, appStats, paymentStats, reportStats, activityTrend, systemHealth,] = await Promise.all([
            this.dashboardService.getOverview(),
            this.dashboardService.getUserStats(30),
            this.dashboardService.getJobStats(30),
            this.dashboardService.getApplicationStats(30),
            this.dashboardService.getPaymentStats(30),
            this.dashboardService.getReportStats(),
            this.dashboardService.getActivityTrend(30),
            this.dashboardService.getSystemHealth(),
        ]);
        return {
            overview,
            userStats,
            jobStats,
            applicationStats: appStats,
            paymentStats,
            reportStats,
            activityTrend,
            systemHealth,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('jobs'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getJobStats", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getApplicationStats", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Get)('reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReportStats", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('activity-trend'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getActivityTrend", null);
__decorate([
    (0, common_1.Get)('top-reported-jobs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopReportedJobs", null);
__decorate([
    (0, common_1.Get)('system-health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('comprehensive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getComprehensive", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('admin/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map