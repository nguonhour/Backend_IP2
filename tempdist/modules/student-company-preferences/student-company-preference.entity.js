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
exports.StudentCompanyPreference = void 0;
const typeorm_1 = require("typeorm");
const student_profile_entity_1 = require("../student-profiles/student-profile.entity");
const employer_profile_entity_1 = require("../employer-profiles/employer-profile.entity");
let StudentCompanyPreference = class StudentCompanyPreference {
    id;
    student;
    employer;
    blocked;
    muted;
    createdAt;
    updatedAt;
};
exports.StudentCompanyPreference = StudentCompanyPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StudentCompanyPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], StudentCompanyPreference.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employer_profile_entity_1.EmployerProfile, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'employer_id' }),
    __metadata("design:type", employer_profile_entity_1.EmployerProfile)
], StudentCompanyPreference.prototype, "employer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StudentCompanyPreference.prototype, "blocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StudentCompanyPreference.prototype, "muted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentCompanyPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentCompanyPreference.prototype, "updatedAt", void 0);
exports.StudentCompanyPreference = StudentCompanyPreference = __decorate([
    (0, typeorm_1.Unique)('UQ_student_employer_pref', ['student', 'employer']),
    (0, typeorm_1.Entity)('student_company_preferences')
], StudentCompanyPreference);
//# sourceMappingURL=student-company-preference.entity.js.map