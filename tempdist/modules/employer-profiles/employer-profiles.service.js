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
exports.EmployerProfilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employer_profile_entity_1 = require("./employer-profile.entity");
const user_entity_1 = require("../users/user.entity");
const industry_entity_1 = require("../../entities/master/industry.entity");
const job_category_entity_1 = require("../../entities/master/job-category.entity");
let EmployerProfilesService = class EmployerProfilesService {
    employerProfileRepository;
    userRepository;
    industryRepository;
    jobCategoryRepository;
    constructor(employerProfileRepository, userRepository, industryRepository, jobCategoryRepository) {
        this.employerProfileRepository = employerProfileRepository;
        this.userRepository = userRepository;
        this.industryRepository = industryRepository;
        this.jobCategoryRepository = jobCategoryRepository;
    }
    async create(userId, dto) {
        const existingProfile = await this.employerProfileRepository.findOne({
            where: { user: { id: userId } },
        });
        if (existingProfile) {
            throw new common_1.ConflictException('Employer profile already exists');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.industryId) {
            const industry = await this.industryRepository.findOne({
                where: { id: dto.industryId },
            });
            if (!industry) {
                throw new common_1.NotFoundException('Industry not found');
            }
        }
        const profile = this.employerProfileRepository.create({
            companyName: dto.companyName,
            location: dto.location,
            contactEmail: dto.contactEmail,
            avatarUrl: dto.avatarUrl,
            about: dto.about,
            companySize: dto.companySize,
            foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : undefined,
            website: dto.website,
            phone: dto.phone,
            user: { id: user.id },
            industry: dto.industryId
                ? { id: dto.industryId }
                : undefined,
        });
        const savedProfile = await this.employerProfileRepository.save(profile);
        return this.findById(savedProfile.id);
    }
    async findByUserId(userId) {
        return this.withJobCategories(await this.findEntityByUserId(userId));
    }
    async findById(id) {
        const profile = await this.employerProfileRepository.findOne({
            where: { id },
            relations: ['user', 'industry'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Employer profile not found');
        }
        return this.withJobCategories(profile);
    }
    async update(userId, dto) {
        const profile = await this.findEntityByUserId(userId);
        const has = (key) => Object.prototype.hasOwnProperty.call(dto, key);
        if (dto.industryId) {
            const industry = await this.industryRepository.findOne({
                where: { id: dto.industryId },
            });
            if (!industry) {
                throw new common_1.NotFoundException('Industry not found');
            }
        }
        Object.assign(profile, {
            companyName: has('companyName') ? dto.companyName : profile.companyName,
            location: has('location') ? dto.location : profile.location,
            contactEmail: has('contactEmail') ? dto.contactEmail : profile.contactEmail,
            avatarUrl: has('avatarUrl') ? dto.avatarUrl : profile.avatarUrl,
            about: has('about') ? dto.about : profile.about,
            companySize: has('companySize') ? dto.companySize : profile.companySize,
            foundedAt: has('foundedAt')
                ? dto.foundedAt
                    ? new Date(dto.foundedAt)
                    : null
                : profile.foundedAt,
            website: has('website') ? dto.website : profile.website,
            phone: has('phone') ? dto.phone : profile.phone,
            industry: dto.industryId
                ? { id: dto.industryId }
                : profile.industry,
            updatedAt: new Date(),
        });
        await this.employerProfileRepository.save(profile);
        return this.findByUserId(userId);
    }
    async delete(userId) {
        const profile = await this.findEntityByUserId(userId);
        await this.employerProfileRepository.remove(profile);
        return { message: 'Employer profile deleted successfully' };
    }
    async getCategories(userId) {
        const employer = await this.findEntityByUserId(userId);
        return this.jobCategoryRepository.find({
            where: { employer: { id: employer.id }, isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
    }
    async createCategory(userId, dto) {
        const employer = await this.findEntityByUserId(userId);
        const name = dto.name.trim();
        const existing = await this.jobCategoryRepository
            .createQueryBuilder('category')
            .leftJoin('category.employer', 'employer')
            .where('employer.id = :employerId', { employerId: employer.id })
            .andWhere('LOWER(category.name) = LOWER(:name)', { name })
            .getOne();
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                return this.jobCategoryRepository.save(existing);
            }
            return existing;
        }
        const category = this.jobCategoryRepository.create({
            name,
            employer: { id: employer.id },
            isActive: true,
        });
        return this.jobCategoryRepository.save(category);
    }
    async deleteCategory(userId, categoryId) {
        const employer = await this.findEntityByUserId(userId);
        const category = await this.jobCategoryRepository.findOne({
            where: { id: categoryId, employer: { id: employer.id } },
            relations: ['jobs'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Job category not found');
        }
        if (category.jobs?.length) {
            throw new common_1.ConflictException('This category is already used by jobs and cannot be deleted.');
        }
        await this.jobCategoryRepository.remove(category);
        return { message: 'Job category deleted successfully' };
    }
    async findEntityByUserId(userId) {
        const profile = await this.employerProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'industry'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Employer profile not found');
        }
        return profile;
    }
    async withJobCategories(profile) {
        const categories = await this.jobCategoryRepository.find({
            where: { employer: { id: profile.id }, isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
        return {
            ...profile,
            isVerified: profile.user?.isVerified ?? false,
            categories,
        };
    }
};
exports.EmployerProfilesService = EmployerProfilesService;
exports.EmployerProfilesService = EmployerProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(industry_entity_1.Industry)),
    __param(3, (0, typeorm_1.InjectRepository)(job_category_entity_1.JobCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmployerProfilesService);
//# sourceMappingURL=employer-profiles.service.js.map