"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const report_controller_1 = require("./report.controller");
const report_service_1 = require("./report.service");
const report_entity_1 = require("./report.entity");
const job_entity_1 = require("../jobs/job.entity");
const user_entity_1 = require("../users/user.entity");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
const notification_module_1 = require("../notifications/notification.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report, job_entity_1.Job, user_entity_1.User]),
            audit_logs_module_1.AuditLogsModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [report_controller_1.ReportController],
        providers: [report_service_1.ReportService],
        exports: [report_service_1.ReportService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map