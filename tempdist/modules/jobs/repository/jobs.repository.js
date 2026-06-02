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
exports.JobsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("../job.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let JobsRepository = class JobsRepository extends base_repository_1.BaseRepository {
    constructor(jobRepository) {
        super(jobRepository);
    }
    async findByEmployerId(employerId, relations) {
        try {
            return await this.repository.find({
                where: { employer: { id: employerId } },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findByEmployerId', error, { employerId });
        }
    }
    async findActive(relations) {
        try {
            return await this.repository.find({
                where: { isActive: true },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findActive', error, { relations });
        }
    }
    async findByCategory(categoryId, relations) {
        try {
            return await this.repository.find({
                where: { category: { id: categoryId } },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByCategory', error, { categoryId });
        }
    }
    async findByLocation(location, relations) {
        try {
            return await this.repository.find({
                where: { location },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByLocation', error, { location });
        }
    }
};
exports.JobsRepository = JobsRepository;
exports.JobsRepository = JobsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JobsRepository);
//# sourceMappingURL=jobs.repository.js.map