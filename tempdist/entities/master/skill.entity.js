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
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
const student_skill_entity_1 = require("../../modules/student-profiles/student-skill.entity");
const job_skill_entity_1 = require("../../modules/jobs/job-skill.entity");
let Skill = class Skill {
    id;
    name;
    isActive;
    createdAt;
    studentSkills;
    jobSkills;
};
exports.Skill = Skill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Skill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: false }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Skill.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'createdAt',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Skill.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_skill_entity_1.StudentSkill, (studentSkill) => studentSkill.skill),
    __metadata("design:type", Array)
], Skill.prototype, "studentSkills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_skill_entity_1.JobSkill, (jobSkill) => jobSkill.skill),
    __metadata("design:type", Array)
], Skill.prototype, "jobSkills", void 0);
exports.Skill = Skill = __decorate([
    (0, typeorm_1.Entity)('m_skills')
], Skill);
//# sourceMappingURL=skill.entity.js.map