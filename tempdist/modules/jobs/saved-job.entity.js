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
exports.SavedJob = void 0;
const typeorm_1 = require("typeorm");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const job_entity_1 = require("./job.entity");
let SavedJob = class SavedJob {
    studentId;
    jobId;
    student;
    job;
};
exports.SavedJob = SavedJob;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'student_id', type: 'uuid' }),
    __metadata("design:type", String)
], SavedJob.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'job_id', type: 'uuid' }),
    __metadata("design:type", String)
], SavedJob.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile, (student) => student.savedJobs, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], SavedJob.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job, (job) => job.savedBy, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_entity_1.Job)
], SavedJob.prototype, "job", void 0);
exports.SavedJob = SavedJob = __decorate([
    (0, typeorm_1.Unique)('UQ_saved_jobs_student_job', ['student', 'job']),
    (0, typeorm_1.Entity)('saved_jobs')
], SavedJob);
//# sourceMappingURL=saved-job.entity.js.map