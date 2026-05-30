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
exports.StudentProfilesController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const update_student_dto_1 = require("./dto/update-student.dto");
const student_profiles_service_1 = require("./student-profiles.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const add_student_skill_dto_1 = require("./dto/add-student-skill.dto");
const add_student_industry_dto_1 = require("./dto/add-student-industry.dto");
let StudentProfilesController = class StudentProfilesController {
    studentProfilesService;
    constructor(studentProfilesService) {
        this.studentProfilesService = studentProfilesService;
    }
    async saveJob(req, jobId) {
        return this.studentProfilesService.saveJob(req.user.id, jobId);
    }
    async getSavedJobs(req) {
        return this.studentProfilesService.getSavedJobs(req.user.id);
    }
    getProfile(req) {
        return this.studentProfilesService.getProfile(req.user.id);
    }
    getProfileById(studentId) {
        return this.studentProfilesService.getProfileById(studentId);
    }
    updateProfile(req, dto) {
        return this.studentProfilesService.updateProfile(req.user.id, dto);
    }
    addResume(req, body) {
        return this.studentProfilesService.addResume(req.user.id, body.fileUrl);
    }
    addSkills(req, dto) {
        return this.studentProfilesService.addSkills(req.user.id, dto);
    }
    addIndustries(req, dto) {
        return this.studentProfilesService.addIndustries(req.user.id, dto);
    }
    removeSavedJob(req, jobId) {
        return this.studentProfilesService.removeSavedJob(req.user.id, jobId);
    }
};
exports.StudentProfilesController = StudentProfilesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('save-job/:jobId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('jobId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentProfilesController.prototype, "saveJob", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('saved-jobs'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentProfilesController.prototype, "getSavedJobs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':studentId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "getProfileById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Put)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_student_dto_1.UpdateStudentDto]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('me/resumes'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "addResume", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('me/skills'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_student_skill_dto_1.AddStudentSkillDto]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "addSkills", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('me/industries'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_student_industry_dto_1.AddStudentIndustryDto]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "addIndustries", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('save-job/:jobId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('jobId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentProfilesController.prototype, "removeSavedJob", null);
exports.StudentProfilesController = StudentProfilesController = __decorate([
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [student_profiles_service_1.StudentProfilesService])
], StudentProfilesController);
//# sourceMappingURL=student-profiles.controller.js.map