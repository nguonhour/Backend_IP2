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
exports.StudentSkill = void 0;
const typeorm_1 = require("typeorm");
const student_profile_entity_1 = require("./student-profile.entity");
const skill_entity_1 = require("../../entities/master/skill.entity");
let StudentSkill = class StudentSkill {
    id;
    studentId;
    skillId;
    createdAt;
    updatedAt;
    student;
    skill;
};
exports.StudentSkill = StudentSkill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StudentSkill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'student_id', type: 'uuid' }),
    __metadata("design:type", String)
], StudentSkill.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skill_id', type: 'uuid' }),
    __metadata("design:type", String)
], StudentSkill.prototype, "skillId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentSkill.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt', type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentSkill.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_profile_entity_1.StudentProfile, (student) => student.studentSkills),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], StudentSkill.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill, (skill) => skill.studentSkills),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], StudentSkill.prototype, "skill", void 0);
exports.StudentSkill = StudentSkill = __decorate([
    (0, typeorm_1.Entity)('student_skills'),
    (0, typeorm_1.Unique)(['studentId', 'skillId'])
], StudentSkill);
//# sourceMappingURL=student-skill.entity.js.map