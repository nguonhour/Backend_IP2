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
exports.StudentProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const university_entity_1 = require("../../entities/master/university.entity");
const major_entity_1 = require("../../entities/master/major.entity");
const student_skill_entity_1 = require("./student-skill.entity");
const application_entity_1 = require("../applications/application.entity");
const saved_job_entity_1 = require("../jobs/saved-job.entity");
const search_history_entity_1 = require("./search-history.entity");
const class_transformer_1 = require("class-transformer");
const student_industry_entity_1 = require("./student-industry.entity");
let StudentProfile = class StudentProfile {
    id;
    user;
    get email() {
        return this.user?.email ?? null;
    }
    externalUserId;
    firstName;
    lastName;
    university;
    major;
    yearOfStudy;
    avatarUrl;
    createdAt;
    updatedAt;
    studentSkills;
    studentIndustries;
    applications;
    savedJobs;
    searchHistory;
};
exports.StudentProfile = StudentProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StudentProfile.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], StudentProfile.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], StudentProfile.prototype, "email", null);
__decorate([
    (0, typeorm_1.Column)({
        name: 'external_user_id',
        type: 'varchar',
        nullable: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], StudentProfile.prototype, "externalUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], StudentProfile.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], StudentProfile.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => university_entity_1.University, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'university_id' }),
    __metadata("design:type", Object)
], StudentProfile.prototype, "university", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => major_entity_1.Major, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'major_id' }),
    __metadata("design:type", Object)
], StudentProfile.prototype, "major", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'year_of_study', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], StudentProfile.prototype, "yearOfStudy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StudentProfile.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_skill_entity_1.StudentSkill, (studentSkill) => studentSkill.student),
    __metadata("design:type", Array)
], StudentProfile.prototype, "studentSkills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_industry_entity_1.StudentIndustry, (studentIndustry) => studentIndustry.student),
    __metadata("design:type", Array)
], StudentProfile.prototype, "studentIndustries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => application_entity_1.Application, (application) => application.student),
    __metadata("design:type", Array)
], StudentProfile.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => saved_job_entity_1.SavedJob, (savedJob) => savedJob.student),
    __metadata("design:type", Array)
], StudentProfile.prototype, "savedJobs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => search_history_entity_1.SearchHistory, (history) => history.student),
    __metadata("design:type", Array)
], StudentProfile.prototype, "searchHistory", void 0);
exports.StudentProfile = StudentProfile = __decorate([
    (0, typeorm_1.Entity)('student_profiles')
], StudentProfile);
//# sourceMappingURL=student-profile.entity.js.map