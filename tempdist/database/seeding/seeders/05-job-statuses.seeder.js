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
var JobStatusesSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatusesSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const master_1 = require("../../../entities/master");
let JobStatusesSeeder = JobStatusesSeeder_1 = class JobStatusesSeeder {
    jobStatusRepository;
    logger = new common_1.Logger(JobStatusesSeeder_1.name);
    constructor(jobStatusRepository) {
        this.jobStatusRepository = jobStatusRepository;
    }
    async run() {
        this.logger.log('Seeding job statuses...');
        const statuses = ['Open', 'Closed'];
        for (const name of statuses) {
            const existing = await this.jobStatusRepository.findOne({
                where: { name },
            });
            if (!existing) {
                await this.jobStatusRepository.save(this.jobStatusRepository.create({ name, isActive: true }));
                this.logger.log(`Seeded job status: ${name}`);
            }
        }
    }
};
exports.JobStatusesSeeder = JobStatusesSeeder;
exports.JobStatusesSeeder = JobStatusesSeeder = JobStatusesSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(master_1.JobStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JobStatusesSeeder);
//# sourceMappingURL=05-job-statuses.seeder.js.map