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
exports.JobType = exports.TypeJob = void 0;
const typeorm_1 = require("typeorm");
const job_entity_1 = require("../../modules/jobs/job.entity");
var TypeJob;
(function (TypeJob) {
    TypeJob["OnSite"] = "On-site";
    TypeJob["Remote"] = "Remote";
    TypeJob["Hybrid"] = "Hybrid";
})(TypeJob || (exports.TypeJob = TypeJob = {}));
let JobType = class JobType {
    id;
    name;
    isActive;
    createdAt;
    jobs;
};
exports.JobType = JobType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: false }),
    __metadata("design:type", String)
], JobType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], JobType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], JobType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, (job) => job.jobType),
    __metadata("design:type", Array)
], JobType.prototype, "jobs", void 0);
exports.JobType = JobType = __decorate([
    (0, typeorm_1.Entity)('m_job_types')
], JobType);
//# sourceMappingURL=job-type.entity.js.map