"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const jobs_controller_1 = require("./jobs.controller");
const jobs_service_1 = require("./jobs.service");
const job_entity_1 = require("./job.entity");
const typeorm_1 = require("@nestjs/typeorm");
const job_history_entity_1 = require("./job-history.entity");
const job_skill_entity_1 = require("./job-skill.entity");
const job_view_entity_1 = require("./job-view.entity");
const saved_job_entity_1 = require("./saved-job.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const job_category_entity_1 = require("../../entities/master/job-category.entity");
const job_type_entity_1 = require("../../entities/master/job-type.entity");
const job_status_entity_1 = require("../../entities/master/job-status.entity");
const jobs_repository_1 = require("./repository/jobs.repository");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                job_entity_1.Job,
                job_skill_entity_1.JobSkill,
                job_view_entity_1.JobView,
                saved_job_entity_1.SavedJob,
                student_profile_entity_1.StudentProfile,
                employer_profile_entity_1.EmployerProfile,
                job_category_entity_1.JobCategory,
                job_type_entity_1.JobType,
                job_status_entity_1.JobStatus,
                job_history_entity_1.JobHistory,
            ]),
        ],
        controllers: [jobs_controller_1.JobsController],
        providers: [jobs_service_1.JobsService, jobs_repository_1.JobsRepository],
        exports: [jobs_repository_1.JobsRepository],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map