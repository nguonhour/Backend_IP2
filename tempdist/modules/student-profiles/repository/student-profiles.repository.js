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
exports.StudentProfilesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_profile_entity_1 = require("../student-profile.entity");
const base_repository_1 = require("../../../common/repositories/base.repository");
let StudentProfilesRepository = class StudentProfilesRepository extends base_repository_1.BaseRepository {
    studentRepository;
    constructor(studentRepository) {
        super(studentRepository);
        this.studentRepository = studentRepository;
    }
    async findByUserId(userId, relations) {
        try {
            return await this.studentRepository.findOne({
                where: { user: { id: userId } },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByUserId', error, { userId });
        }
    }
    async findByUniversity(universityId, relations) {
        try {
            return await this.studentRepository.find({
                where: { university: { id: universityId } },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByUniversity', error, { universityId });
        }
    }
    async findByMajor(majorId, relations) {
        try {
            return await this.studentRepository.find({
                where: { major: { id: majorId } },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findByMajor', error, { majorId });
        }
    }
    async findVerified(relations) {
        try {
            return await this.studentRepository.find({
                where: { isVerified: true },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findVerified', error, { relations });
        }
    }
};
exports.StudentProfilesRepository = StudentProfilesRepository;
exports.StudentProfilesRepository = StudentProfilesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_profile_entity_1.StudentProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StudentProfilesRepository);
//# sourceMappingURL=student-profiles.repository.js.map