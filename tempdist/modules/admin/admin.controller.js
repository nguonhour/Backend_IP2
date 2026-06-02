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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const user_management_service_1 = require("./user-management.service");
const job_moderation_service_1 = require("./job-moderation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_user_management_dto_1 = require("./dto/admin-user-management.dto");
const job_moderation_dto_1 = require("./dto/job-moderation.dto");
const audit_decorator_1 = require("../../common/decorators/audit.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    adminService;
    userManagementService;
    jobModerationService;
    constructor(adminService, userManagementService, jobModerationService) {
        this.adminService = adminService;
        this.userManagementService = userManagementService;
        this.jobModerationService = jobModerationService;
    }
    getDashboard() {
        return this.adminService.getDashboard();
    }
    async getUsers(status, search, page, limit) {
        return this.userManagementService.getUsers(status, search, parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getPendingApprovals(page, limit) {
        return this.userManagementService.getPendingApprovals(parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getSuspendedUsers(page, limit) {
        return this.userManagementService.getSuspendedUsers(parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getUser(userId) {
        return this.userManagementService.getUserById(userId);
    }
    async suspendUser(userId, dto, req) {
        return this.userManagementService.suspendUser(userId, dto.reason, req.user.id);
    }
    async unsuspendUser(userId, req) {
        return this.userManagementService.unsuspendUser(userId, req.user.id);
    }
    async verifyEmployer(userId, req) {
        return this.userManagementService.verifyEmployer(userId, req.user.id);
    }
    async rejectEmployer(userId, dto, req) {
        return this.userManagementService.rejectEmployer(userId, dto.reason, req.user.id);
    }
    async deleteUser(userId, req) {
        return this.userManagementService.deleteUser(userId, req.user.id);
    }
    async getModerationStats() {
        return this.jobModerationService.getModerationStats();
    }
    async getPendingJobs(page, limit) {
        return this.jobModerationService.getPendingJobs(parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getApprovedJobs(page, limit) {
        return this.jobModerationService.getApprovedJobs(parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getRejectedJobs(page, limit) {
        return this.jobModerationService.getRejectedJobs(parseInt(page || '1', 10), parseInt(limit || '10', 10));
    }
    async getJobForModeration(jobId) {
        return this.jobModerationService.getJobForModeration(jobId);
    }
    async approveJob(jobId, req) {
        return this.jobModerationService.approveJob(jobId, req.user.id);
    }
    async rejectJob(jobId, dto, req) {
        return this.jobModerationService.rejectJob(jobId, dto.reason, req.user.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/pending-approvals'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('users/suspended'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSuspendedUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/suspend'),
    (0, audit_decorator_1.Audit)({
        action: 'SUSPEND',
        module: 'users',
        entityType: 'User',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_management_dto_1.SuspendUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/unsuspend'),
    (0, audit_decorator_1.Audit)({
        action: 'UPDATE',
        module: 'users',
        entityType: 'User',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unsuspendUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/verify-employer'),
    (0, audit_decorator_1.Audit)({
        action: 'VERIFY',
        module: 'users',
        entityType: 'User',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyEmployer", null);
__decorate([
    (0, common_1.Patch)('users/:id/reject-employer'),
    (0, audit_decorator_1.Audit)({
        action: 'REJECT',
        module: 'users',
        entityType: 'User',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_user_management_dto_1.SuspendUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectEmployer", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, audit_decorator_1.Audit)({
        action: 'DELETE',
        module: 'users',
        entityType: 'User',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('jobs/moderation/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getModerationStats", null);
__decorate([
    (0, common_1.Get)('jobs/moderation/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingJobs", null);
__decorate([
    (0, common_1.Get)('jobs/moderation/approved'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApprovedJobs", null);
__decorate([
    (0, common_1.Get)('jobs/moderation/rejected'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRejectedJobs", null);
__decorate([
    (0, common_1.Get)('jobs/moderation/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getJobForModeration", null);
__decorate([
    (0, common_1.Patch)('jobs/:id/approve'),
    (0, audit_decorator_1.Audit)({
        action: 'APPROVE',
        module: 'jobs',
        entityType: 'Job',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveJob", null);
__decorate([
    (0, common_1.Patch)('jobs/:id/reject'),
    (0, audit_decorator_1.Audit)({
        action: 'REJECT',
        module: 'jobs',
        entityType: 'Job',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, job_moderation_dto_1.RejectJobDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectJob", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        user_management_service_1.UserManagementService,
        job_moderation_service_1.JobModerationService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map