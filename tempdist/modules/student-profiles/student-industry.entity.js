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
exports.StudentIndustry = void 0;
const typeorm_1 = require("typeorm");
const student_profile_entity_1 = require("./student-profile.entity");
const industry_entity_1 = require("../../entities/master/industry.entity");
let StudentIndustry = class StudentIndustry {
    id;
    studentId;
    industryId;
    createdAt;
    student;
    industry;
};
exports.StudentIndustry = StudentIndustry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StudentIndustry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'student_id', type: 'uuid' }),
    __metadata("design:type", String)
], StudentIndustry.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'industry_id', type: 'uuid' }),
    __metadata("design:type", String)
], StudentIndustry.prototype, "industryId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentIndustry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile, (student) => student.studentIndustries),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], StudentIndustry.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => industry_entity_1.Industry, (industry) => industry.studentIndustries),
    (0, typeorm_1.JoinColumn)({ name: 'industry_id' }),
    __metadata("design:type", industry_entity_1.Industry)
], StudentIndustry.prototype, "industry", void 0);
exports.StudentIndustry = StudentIndustry = __decorate([
    (0, typeorm_1.Entity)('student_industries_preference'),
    (0, typeorm_1.Unique)(['studentId', 'industryId'])
], StudentIndustry);
//# sourceMappingURL=student-industry.entity.js.map