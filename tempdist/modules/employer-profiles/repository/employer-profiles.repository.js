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
exports.EmployerProfilesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employer_profile_entity_1 = require("../employer-profile.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let EmployerProfilesRepository = class EmployerProfilesRepository extends base_repository_1.BaseRepository {
    employerRepository;
    constructor(employerRepository) {
        super(employerRepository);
        this.employerRepository = employerRepository;
    }
    async findByUserId(userId, relations) {
        try {
            return await this.employerRepository.findOne({
                where: { user: { id: userId } },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByUserId', error, { userId });
        }
    }
    async findByCompanyName(companyName, relations) {
        try {
            return await this.employerRepository.find({
                where: { companyName },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByCompanyName', error, { companyName });
        }
    }
    async findVerified(relations) {
        try {
            return await this.employerRepository.find({
                where: { isVerified: true },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findVerified', error, { relations });
        }
    }
};
exports.EmployerProfilesRepository = EmployerProfilesRepository;
exports.EmployerProfilesRepository = EmployerProfilesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployerProfilesRepository);
//# sourceMappingURL=employer-profiles.repository.js.map