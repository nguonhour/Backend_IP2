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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_status_entity_1 = require("./job-status.entity");
const application_status_entity_1 = require("./application-status.entity");
const university_entity_1 = require("./university.entity");
const major_entity_1 = require("./major.entity");
const job_category_entity_1 = require("./job-category.entity");
const job_type_entity_1 = require("./job-type.entity");
let MasterService = class MasterService {
    jobCategoryRepository;
    jobTypeRepository;
    jobStatusRepository;
    applicationStatusRepository;
    universityRepository;
    majorRepository;
    constructor(jobCategoryRepository, jobTypeRepository, jobStatusRepository, applicationStatusRepository, universityRepository, majorRepository) {
        this.jobCategoryRepository = jobCategoryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.jobStatusRepository = jobStatusRepository;
        this.applicationStatusRepository = applicationStatusRepository;
        this.universityRepository = universityRepository;
        this.majorRepository = majorRepository;
    }
    async getJobStatuses() {
        return this.jobStatusRepository.find({
            where: { isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async getJobCategories() {
        return this.jobCategoryRepository.find({
            where: { isActive: true, employer: (0, typeorm_2.IsNull)() },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async getJobTypes() {
        return this.jobTypeRepository.find({
            where: { isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async getApplicationStatuses() {
        return this.applicationStatusRepository
            .createQueryBuilder('status')
            .select(['status.id', 'status.name'])
            .where('status.isActive = :isActive', { isActive: true })
            .orderBy(`CASE LOWER(status.name)
          WHEN 'applied' THEN 1
          WHEN 'shortlisted' THEN 3
          WHEN 'interview scheduled' THEN 4
          WHEN 'interview completed' THEN 5
          WHEN 'hired' THEN 6
          WHEN 'rejected' THEN 7
          ELSE 99
        END`, 'ASC')
            .addOrderBy('status.name', 'ASC')
            .getMany();
    }
    async getUniversities() {
        return this.universityRepository.find({
            where: { isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async getMajors() {
        return this.majorRepository.find({
            where: { isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
};
exports.MasterService = MasterService;
exports.MasterService = MasterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_category_entity_1.JobCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(job_type_entity_1.JobType)),
    __param(2, (0, typeorm_1.InjectRepository)(job_status_entity_1.JobStatus)),
    __param(3, (0, typeorm_1.InjectRepository)(application_status_entity_1.ApplicationStatus)),
    __param(4, (0, typeorm_1.InjectRepository)(university_entity_1.University)),
    __param(5, (0, typeorm_1.InjectRepository)(major_entity_1.Major)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MasterService);
//# sourceMappingURL=master.service.js.map