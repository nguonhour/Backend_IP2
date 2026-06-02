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
exports.ResumesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resume_entity_1 = require("../resume.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let ResumesRepository = class ResumesRepository extends base_repository_1.BaseRepository {
    resumeRepository;
    constructor(resumeRepository) {
        super(resumeRepository);
        this.resumeRepository = resumeRepository;
    }
    async findByStudentId(studentId, relations) {
        try {
            return await this.resumeRepository.find({
                where: { student: { id: studentId } },
                relations,
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            return this.handleError('findByStudentId', error, { studentId });
        }
    }
    async findPrimary(studentId, relations) {
        try {
            return await this.resumeRepository.findOne({
                where: { student: { id: studentId }, isPrimary: true },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findPrimary', error, { studentId });
        }
    }
    async markAsPrimary(resumeId, studentId) {
        try {
            await this.resumeRepository.update({ student: { id: studentId } }, { isDefault: false });
            return await this.resumeRepository.update({ id: resumeId }, {
                isDefault: true,
            });
        }
        catch (error) {
            return this.handleError('markAsPrimary', error, { resumeId, studentId });
        }
    }
};
exports.ResumesRepository = ResumesRepository;
exports.ResumesRepository = ResumesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResumesRepository);
//# sourceMappingURL=resumes.repository.js.map