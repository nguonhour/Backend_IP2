"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const _01_roles_seeder_1 = require("./seeders/01-roles.seeder");
const _02_users_seeder_1 = require("./seeders/02-users.seeder");
const _03_job_categories_seeder_1 = require("./seeders/03-job-categories.seeder");
const _04_job_types_seeder_1 = require("./seeders/04-job-types.seeder");
const _05_job_statuses_seeder_1 = require("./seeders/05-job-statuses.seeder");
const _06_industries_seeder_1 = require("./seeders/06-industries.seeder");
const _07_employer_profiles_seeder_1 = require("./seeders/07-employer-profiles.seeder");
const _08_jobs_seeder_1 = require("./seeders/08-jobs.seeder");
const _09_application_statuses_seeder_1 = require("./seeders/09-application-statuses.seeder");
const master_1 = require("../../entities/master");
const user_entity_1 = require("../../modules/users/user.entity");
const employer_profile_entity_1 = require("../../modules/employer-profiles/employer-profile.entity");
const job_entity_1 = require("../../modules/jobs/job.entity");
const employer_review_entity_1 = require("../../modules/reviews/employer-review.entity");
const payment_entity_1 = require("../../modules/payments/payment.entity");
const student_profile_entity_1 = require("../../modules/student-profiles/student-profile.entity");
const application_entity_1 = require("../../modules/applications/application.entity");
const job_view_entity_1 = require("../../modules/jobs/job-view.entity");
const saved_job_entity_1 = require("../../modules/jobs/saved-job.entity");
const job_skill_entity_1 = require("../../modules/jobs/job-skill.entity");
const job_history_entity_1 = require("../../modules/jobs/job-history.entity");
const report_entity_1 = require("../../modules/reports/report.entity");
const resume_entity_1 = require("../../modules/resumes/resume.entity");
const application_status_history_entity_1 = require("../../modules/applications/application-status-history.entity");
const student_skill_entity_1 = require("../../modules/student-profiles/student-skill.entity");
const search_history_entity_1 = require("../../modules/student-profiles/search-history.entity");
const notification_entity_1 = require("../../modules/notifications/notification.entity");
function parseBoolean(value, fallback = false) {
    if (value === undefined)
        return fallback;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [
                    master_1.Role,
                    user_entity_1.User,
                    master_1.Industry,
                    employer_review_entity_1.EmployerReview,
                    payment_entity_1.Payment,
                    employer_profile_entity_1.EmployerProfile,
                    job_entity_1.Job,
                    master_1.JobCategory,
                    master_1.JobType,
                    application_entity_1.Application,
                    job_view_entity_1.JobView,
                    saved_job_entity_1.SavedJob,
                    job_skill_entity_1.JobSkill,
                    master_1.Skill,
                    report_entity_1.Report,
                    job_history_entity_1.JobHistory,
                    master_1.JobStatus,
                    resume_entity_1.Resume,
                    master_1.ApplicationStatus,
                    application_status_history_entity_1.ApplicationStatusHistory,
                    student_profile_entity_1.StudentProfile,
                    student_skill_entity_1.StudentSkill,
                    master_1.University,
                    master_1.Major,
                    search_history_entity_1.SearchHistory,
                    notification_entity_1.Notification,
                ],
                synchronize: parseBoolean(process.env.DB_SYNC, false),
                dropSchema: parseBoolean(process.env.DB_DROP_SCHEMA, false),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                master_1.Role,
                user_entity_1.User,
                master_1.Industry,
                employer_profile_entity_1.EmployerProfile,
                job_entity_1.Job,
                master_1.JobCategory,
                master_1.JobType,
                master_1.JobStatus,
                master_1.ApplicationStatus,
            ]),
        ],
        providers: [
            _01_roles_seeder_1.RolesSeeder,
            _02_users_seeder_1.UsersSeeder,
            _06_industries_seeder_1.IndustriesSeeder,
            _07_employer_profiles_seeder_1.EmployerProfilesSeeder,
            _03_job_categories_seeder_1.JobCategoriesSeeder,
            _04_job_types_seeder_1.JobTypesSeeder,
            _05_job_statuses_seeder_1.JobStatusesSeeder,
            _08_jobs_seeder_1.JobsSeeder,
            _09_application_statuses_seeder_1.ApplicationStatusesSeeder,
        ],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map