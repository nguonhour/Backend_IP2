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
exports.Application = void 0;
const typeorm_1 = require("typeorm");
const job_entity_1 = require("../jobs/job.entity");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const application_status_entity_1 = require("../../entities/master/application-status.entity");
const application_status_history_entity_1 = require("./application-status-history.entity");
let Application = class Application {
    id;
    job;
    student;
    resume;
    currentStatus;
    appliedAt;
    statusHistory;
};
exports.Application = Application;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Application.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job, (job) => job.applications, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_entity_1.Job)
], Application.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile, (student) => student.applications, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], Application.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => resume_entity_1.Resume, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'resume_id' }),
    __metadata("design:type", resume_entity_1.Resume)
], Application.prototype, "resume", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => application_status_entity_1.ApplicationStatus),
    (0, typeorm_1.JoinColumn)({ name: 'current_status_id' }),
    __metadata("design:type", application_status_entity_1.ApplicationStatus)
], Application.prototype, "currentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Application.prototype, "appliedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => application_status_history_entity_1.ApplicationStatusHistory, (history) => history.application),
    __metadata("design:type", Array)
], Application.prototype, "statusHistory", void 0);
exports.Application = Application = __decorate([
    (0, typeorm_1.Unique)('UQ_applications_student_job', ['job', 'student']),
    (0, typeorm_1.Entity)('applications')
], Application);
//# sourceMappingURL=application.entity.js.map