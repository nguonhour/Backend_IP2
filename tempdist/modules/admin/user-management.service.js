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
exports.UserManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../modules/users/user.entity");
const user_status_enum_1 = require("../../modules/users/user-status.enum");
const audit_service_1 = require("../audit-logs/audit.service");
const audit_log_entity_1 = require("../audit-logs/audit-log.entity");
let UserManagementService = class UserManagementService {
    userRepository;
    auditService;
    constructor(userRepository, auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }
    async getUsers(status, search, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = this.userRepository.createQueryBuilder('user');
        if (status) {
            query.andWhere('user.status = :status', { status });
        }
        if (search) {
            query.andWhere('(user.email ILIKE :search OR user.id ILIKE :search)', {
                search: `%${search}%`,
            });
        }
        query.leftJoinAndSelect('user.role', 'role');
        query.leftJoinAndSelect('user.studentProfile', 'studentProfile');
        query.leftJoinAndSelect('user.employerProfile', 'employerProfile');
        query.skip(skip);
        query.take(limit);
        query.orderBy('user.createdAt', 'DESC');
        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }
    async getUserById(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'studentProfile', 'employerProfile'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        return user;
    }
    async suspendUser(userId, reason, adminId) {
        const user = await this.getUserById(userId);
        const oldData = { status: user.status };
        user.status = user_status_enum_1.UserStatus.SUSPENDED;
        const updated = await this.userRepository.save(user);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.SUSPEND,
            module: 'users',
            entityId: userId,
            entityType: 'User',
            oldData,
            newData: { status: user.status },
            description: `Suspended user: ${reason}`,
        });
        return updated;
    }
    async unsuspendUser(userId, adminId) {
        const user = await this.getUserById(userId);
        const oldData = { status: user.status };
        user.status = user_status_enum_1.UserStatus.ACTIVE;
        const updated = await this.userRepository.save(user);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.UPDATE,
            module: 'users',
            entityId: userId,
            entityType: 'User',
            oldData,
            newData: { status: user.status },
            description: 'Unsuspended user',
        });
        return updated;
    }
    async verifyEmployer(userId, adminId) {
        const user = await this.getUserById(userId);
        const oldData = { isVerified: user.isVerified };
        user.isVerified = true;
        user.status = user_status_enum_1.UserStatus.ACTIVE;
        const updated = await this.userRepository.save(user);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.VERIFY,
            module: 'users',
            entityId: userId,
            entityType: 'User',
            oldData: { ...oldData, status: user_status_enum_1.UserStatus.PENDING_APPROVAL },
            newData: { isVerified: true, status: user_status_enum_1.UserStatus.ACTIVE },
            description: 'Employer verified',
        });
        return updated;
    }
    async rejectEmployer(userId, reason, adminId) {
        const user = await this.getUserById(userId);
        const oldData = { status: user.status };
        user.status = user_status_enum_1.UserStatus.BLOCKED;
        const updated = await this.userRepository.save(user);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.REJECT,
            module: 'users',
            entityId: userId,
            entityType: 'User',
            oldData,
            newData: { status: user.status },
            description: `Employer rejected: ${reason}`,
        });
        return updated;
    }
    async deleteUser(userId, adminId) {
        const user = await this.getUserById(userId);
        const deleted = await this.userRepository.softRemove(user);
        await this.auditService.log({
            userId: adminId,
            action: audit_log_entity_1.AuditAction.DELETE,
            module: 'users',
            entityId: userId,
            entityType: 'User',
            oldData: { email: user.email, status: user.status },
            description: 'User deleted (soft delete)',
        });
        return deleted;
    }
    async getPendingApprovals(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.status = :status', { status: user_status_enum_1.UserStatus.PENDING_APPROVAL });
        query.leftJoinAndSelect('user.employerProfile', 'employerProfile');
        query.skip(skip);
        query.take(limit);
        query.orderBy('user.createdAt', 'DESC');
        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }
    async getSuspendedUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.userRepository.findAndCount({
            where: { status: user_status_enum_1.UserStatus.SUSPENDED },
            relations: ['role', 'employerProfile', 'studentProfile'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
};
exports.UserManagementService = UserManagementService;
exports.UserManagementService = UserManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], UserManagementService);
//# sourceMappingURL=user-management.service.js.map