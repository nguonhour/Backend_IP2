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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("../../entities/master/role.entity");
const student_profile_entity_1 = require("../../modules/student-profiles/student-profile.entity");
const employer_profile_entity_1 = require("../../modules/employer-profiles/employer-profile.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const application_status_history_entity_1 = require("../applications/application-status-history.entity");
const user_status_enum_1 = require("./user-status.enum");
let User = class User {
    id;
    email;
    passwordHash;
    authProvider;
    role;
    isVerified;
    status;
    refreshTokenHash;
    emailVerificationTokenHash;
    emailVerificationExpiresAt;
    resetTokenHash;
    resetTokenExpiresAt;
    createdAt;
    updatedAt;
    studentProfile;
    employerProfile;
    notifications;
    applicationStatusChanges;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'auth_provider',
        type: 'varchar',
        default: 'LOCAL',
        nullable: false,
    }),
    __metadata("design:type", String)
], User.prototype, "authProvider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.users, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        enum: user_status_enum_1.UserStatus,
        default: user_status_enum_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token_hash', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'email_verification_token_hash',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", Object)
], User.prototype, "emailVerificationTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'email_verification_expires_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], User.prototype, "emailVerificationExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_token_hash', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "resetTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_token_expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "resetTokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => student_profile_entity_1.StudentProfile, (profile) => profile.user),
    __metadata("design:type", student_profile_entity_1.StudentProfile)
], User.prototype, "studentProfile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => employer_profile_entity_1.EmployerProfile, (profile) => profile.user),
    __metadata("design:type", employer_profile_entity_1.EmployerProfile)
], User.prototype, "employerProfile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => application_status_history_entity_1.ApplicationStatusHistory, (history) => history.changedBy),
    __metadata("design:type", Array)
], User.prototype, "applicationStatusChanges", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map