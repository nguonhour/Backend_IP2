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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterController = void 0;
const common_1 = require("@nestjs/common");
const master_service_1 = require("./master.service");
let MasterController = class MasterController {
    masterService;
    constructor(masterService) {
        this.masterService = masterService;
    }
    async getJobStatuses() {
        return this.masterService.getJobStatuses();
    }
    async getJobCategories() {
        return this.masterService.getJobCategories();
    }
    async getJobTypes() {
        return this.masterService.getJobTypes();
    }
    async getApplicationStatuses() {
        return this.masterService.getApplicationStatuses();
    }
    async getUniversities() {
        return this.masterService.getUniversities();
    }
    async getMajors() {
        return this.masterService.getMajors();
    }
};
exports.MasterController = MasterController;
__decorate([
    (0, common_1.Get)('job-statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getJobStatuses", null);
__decorate([
    (0, common_1.Get)('job-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getJobCategories", null);
__decorate([
    (0, common_1.Get)('job-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getJobTypes", null);
__decorate([
    (0, common_1.Get)('application-statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getApplicationStatuses", null);
__decorate([
    (0, common_1.Get)('universities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getUniversities", null);
__decorate([
    (0, common_1.Get)('majors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterController.prototype, "getMajors", null);
exports.MasterController = MasterController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [master_service_1.MasterService])
], MasterController);
//# sourceMappingURL=master.controller.js.map