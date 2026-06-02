"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const dashboard_controller_1 = require("./dashboard.controller");
const analytics_controller_1 = require("./analytics.controller");
const admin_service_1 = require("./admin.service");
const dashboard_service_1 = require("./dashboard.service");
const analytics_service_1 = require("./analytics.service");
const user_management_service_1 = require("./user-management.service");
const job_moderation_service_1 = require("./job-moderation.service");
const user_entity_1 = require("../users/user.entity");
const job_entity_1 = require("../jobs/job.entity");
const application_entity_1 = require("../applications/application.entity");
const payment_entity_1 = require("../payments/payment.entity");
const report_entity_1 = require("../reports/report.entity");
const audit_log_entity_1 = require("../audit-logs/audit-log.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
const notification_module_1 = require("../notifications/notification.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, job_entity_1.Job, application_entity_1.Application, payment_entity_1.Payment, report_entity_1.Report, audit_log_entity_1.AuditLog, notification_entity_1.Notification]),
            audit_logs_module_1.AuditLogsModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [admin_controller_1.AdminController, dashboard_controller_1.DashboardController, analytics_controller_1.AnalyticsController],
        providers: [admin_service_1.AdminService, dashboard_service_1.DashboardService, analytics_service_1.AnalyticsService, user_management_service_1.UserManagementService, job_moderation_service_1.JobModerationService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map