"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jobsData = __importStar(require("../data/jobs.json"));
const job_entity_1 = require("../../../modules/jobs/job.entity");
const master_1 = require("../../../entities/master");
const employer_profile_entity_1 = require("../../../modules/employer-profiles/employer-profile.entity");
const user_entity_1 = require("../../../modules/users/user.entity");
let JobsSeeder = JobsSeeder_1 = class JobsSeeder {
    userRepository;
    employerProfileRepository;
    jobRepository;
    jobTypeRepository;
    jobStatusRepository;
    jobCategoryRepository;
    logger = new common_1.Logger(JobsSeeder_1.name);
    constructor(userRepository, employerProfileRepository, jobRepository, jobTypeRepository, jobStatusRepository, jobCategoryRepository) {
        this.userRepository = userRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.jobRepository = jobRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.jobStatusRepository = jobStatusRepository;
        this.jobCategoryRepository = jobCategoryRepository;
    }
    async run() {
        this.logger.log('Seeding Jobs from JSON...');
        const employerEmail = 'employer1@gmail.com';
        const employerUser = await this.userRepository.findOne({
            where: { email: employerEmail },
        });
        const employer = employerUser
            ? await this.employerProfileRepository.findOne({
                where: { user: { id: employerUser.id } },
                relations: ['user'],
            })
            : null;
        const [category] = await this.jobCategoryRepository.find({ take: 1 });
        const [jobType] = await this.jobTypeRepository.find({ take: 1 });
        const [status] = await this.jobStatusRepository.find({ take: 1 });
        if (!employer || !category || !jobType || !status) {
            this.logger.error('Missing related data! Ensure Employers, Categories, Types, and Statuses are seeded first.');
            return;
        }
        const jobsArray = jobsData.default ??
            jobsData;
        for (const jobData of jobsArray) {
            const existingJob = await this.jobRepository.findOne({
                where: {
                    title: jobData.title,
                    employer: { id: employer.id },
                },
                relations: ['employer'],
            });
            if (existingJob) {
                this.logger.debug(`Job already exists: ${jobData.title}. Skipping.`);
                continue;
            }
            const newJob = this.jobRepository.create({
                ...jobData,
                imageUrl: jobData.imageUrl ?? undefined,
                employer,
                category,
                jobType,
                status,
                deadline: new Date(jobData.deadline),
            });
            await this.jobRepository.save(newJob);
            this.logger.log(`Created job: ${jobData.title}`);
        }
    }
};
exports.JobsSeeder = JobsSeeder;
exports.JobsSeeder = JobsSeeder = JobsSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(3, (0, typeorm_1.InjectRepository)(master_1.JobType)),
    __param(4, (0, typeorm_1.InjectRepository)(master_1.JobStatus)),
    __param(5, (0, typeorm_1.InjectRepository)(master_1.JobCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JobsSeeder);
//# sourceMappingURL=08-jobs.seeder.js.map