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
exports.JobSkill = void 0;
const typeorm_1 = require("typeorm");
const job_entity_1 = require("./job.entity");
const skill_entity_1 = require("../../entities/master/skill.entity");
let JobSkill = class JobSkill {
    jobId;
    skillId;
    job;
    skill;
};
exports.JobSkill = JobSkill;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'job_id', type: 'uuid' }),
    __metadata("design:type", String)
], JobSkill.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'skill_id', type: 'uuid' }),
    __metadata("design:type", String)
], JobSkill.prototype, "skillId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job, (job) => job.jobSkills, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_entity_1.Job)
], JobSkill.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill, (skill) => skill.jobSkills, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], JobSkill.prototype, "skill", void 0);
exports.JobSkill = JobSkill = __decorate([
    (0, typeorm_1.Entity)('job_skills')
], JobSkill);
//# sourceMappingURL=job-skill.entity.js.map