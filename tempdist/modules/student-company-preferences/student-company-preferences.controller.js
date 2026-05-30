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
exports.StudentCompanyPreferencesController = void 0;
const common_1 = require("@nestjs/common");
const student_company_preferences_service_1 = require("./student-company-preferences.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StudentCompanyPreferencesController = class StudentCompanyPreferencesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async upsert(req, body) {
        const studentId = req.user.id;
        const { employerId, blocked, muted } = body;
        return this.service.upsert(studentId, employerId, { blocked, muted });
    }
    async listMe(req) {
        const studentId = req.user.id;
        return this.service.findByStudent(studentId);
    }
    async list(studentId, req) {
        if (req.user.id !== studentId) {
            throw new Error('Forbidden');
        }
        return this.service.findByStudent(studentId);
    }
};
exports.StudentCompanyPreferencesController = StudentCompanyPreferencesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentCompanyPreferencesController.prototype, "upsert", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentCompanyPreferencesController.prototype, "listMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentCompanyPreferencesController.prototype, "list", null);
exports.StudentCompanyPreferencesController = StudentCompanyPreferencesController = __decorate([
    (0, common_1.Controller)('student-company-preferences'),
    __metadata("design:paramtypes", [student_company_preferences_service_1.StudentCompanyPreferencesService])
], StudentCompanyPreferencesController);
//# sourceMappingURL=student-company-preferences.controller.js.map