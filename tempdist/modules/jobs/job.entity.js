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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const typeorm_1 = require("typeorm");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
const job_category_entity_1 = require("../../entities/master/job-category.entity");
const job_type_entity_1 = require("../../entities/master/job-type.entity");
const job_status_entity_1 = require("../../entities/master/job-status.entity");
const application_entity_1 = require("../applications/application.entity");
const job_view_entity_1 = require("./job-view.entity");
const saved_job_entity_1 = require("./saved-job.entity");
const job_skill_entity_1 = require("./job-skill.entity");
const report_entity_1 = require("../reports/report.entity");
const job_history_entity_1 = require("./job-history.entity");
const job_approval_status_enum_1 = require("./job-approval-status.enum");
let Job = class Job {
    id;
    employer;
    category;
    jobType;
    title;
    description;
    summary;
    benefits;
    imageUrl;
    location;
    latitude;
    longitude;
    salaryMin;
    salaryMax;
    currency;
    numberOfOpenings;
    deadline;
    requirements;
    is_blocked;
    status;
    approvalStatus;
    rejectionReason;
    createdAt;
    updatedAt;
    applications;
    views;
    savedBy;
    jobSkills;
    reports;
    history;
};
exports.Job = Job;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Job.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employer_profile_entity_1.EmployerProfile, (employer) => employer.jobs),
    (0, typeorm_1.JoinColumn)({ name: 'employer_id' }),
    __metadata("design:type", employer_profile_entity_1.EmployerProfile)
], Job.prototype, "employer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_category_entity_1.JobCategory),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", job_category_entity_1.JobCategory)
], Job.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_type_entity_1.JobType, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'job_type_id' }),
    __metadata("design:type", job_type_entity_1.JobType)
], Job.prototype, "jobType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Job.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Job.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "benefits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Job.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Job.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'salary_min',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Job.prototype, "salaryMin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'salary_max',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Job.prototype, "salaryMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'number_of_openings', type: 'int' }),
    __metadata("design:type", Number)
], Job.prototype, "numberOfOpenings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_blocked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Job.prototype, "is_blocked", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_status_entity_1.JobStatus),
    (0, typeorm_1.JoinColumn)({ name: 'status_id' }),
    __metadata("design:type", job_status_entity_1.JobStatus)
], Job.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'approval_status',
        type: 'varchar',
        enum: job_approval_status_enum_1.JobApprovalStatus,
        default: job_approval_status_enum_1.JobApprovalStatus.PENDING_APPROVAL,
    }),
    __metadata("design:type", String)
], Job.prototype, "approvalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Job.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Job.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Job.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => application_entity_1.Application, (application) => application.job),
    __metadata("design:type", Array)
], Job.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_view_entity_1.JobView, (view) => view.job),
    __metadata("design:type", Array)
], Job.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => saved_job_entity_1.SavedJob, (savedJob) => savedJob.job),
    __metadata("design:type", Array)
], Job.prototype, "savedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_skill_entity_1.JobSkill, (jobSkill) => jobSkill.job),
    __metadata("design:type", Array)
], Job.prototype, "jobSkills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => report_entity_1.Report, (report) => report.job),
    __metadata("design:type", Array)
], Job.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_history_entity_1.JobHistory, (history) => history.job),
    __metadata("design:type", Array)
], Job.prototype, "history", void 0);
exports.Job = Job = __decorate([
    (0, typeorm_1.Entity)('jobs')
], Job);
//# sourceMappingURL=job.entity.js.map