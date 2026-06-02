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
exports.AdminGetUsersDto = exports.SuspendUserDto = exports.UpdateUserRoleDto = exports.UpdateUserStatusDto = void 0;
const class_validator_1 = require("class-validator");
const user_status_enum_1 = require("../../users/user-status.enum");
class UpdateUserStatusDto {
    status;
    reason;
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_status_enum_1.UserStatus),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "reason", void 0);
class UpdateUserRoleDto {
    roleId;
    reason;
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "reason", void 0);
class SuspendUserDto {
    reason;
}
exports.SuspendUserDto = SuspendUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuspendUserDto.prototype, "reason", void 0);
class AdminGetUsersDto {
    status;
    search;
    page = 1;
    limit = 10;
}
exports.AdminGetUsersDto = AdminGetUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_status_enum_1.UserStatus),
    __metadata("design:type", String)
], AdminGetUsersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminGetUsersDto.prototype, "search", void 0);
//# sourceMappingURL=admin-user-management.dto.js.map