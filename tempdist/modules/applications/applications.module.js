"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const applications_controller_1 = require("./applications.controller");
const applications_service_1 = require("./applications.service");
const typeorm_1 = require("@nestjs/typeorm");
const application_status_history_entity_1 = require("./application-status-history.entity");
const application_entity_1 = require("./application.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const application_status_entity_1 = require("../../entities/master/application-status.entity");
const job_entity_1 = require("../jobs/job.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const applications_repository_1 = require("./repository/applications.repository");
const notifications_module_1 = require("../notifications/notifications.module");
let ApplicationsModule = class ApplicationsModule {
};
exports.ApplicationsModule = ApplicationsModule;
exports.ApplicationsModule = ApplicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notifications_module_1.NotificationsModule,
            typeorm_1.TypeOrmModule.forFeature([
                application_status_history_entity_1.ApplicationStatusHistory,
                application_entity_1.Application,
                student_profile_entity_1.StudentProfile,
                application_status_entity_1.ApplicationStatus,
                job_entity_1.Job,
                resume_entity_1.Resume,
            ]),
        ],
        controllers: [applications_controller_1.ApplicationsController],
        providers: [applications_service_1.ApplicationsService, applications_repository_1.ApplicationsRepository],
        exports: [applications_repository_1.ApplicationsRepository],
    })
], ApplicationsModule);
//# sourceMappingURL=applications.module.js.map