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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./audit-log.entity");
let AuditService = class AuditService {
    auditLogRepository;
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(dto) {
        const auditLog = this.auditLogRepository.create({
            ...dto,
        });
        return this.auditLogRepository.save(auditLog);
    }
    async getLogs(filters = {}) {
        const { userId, module, action, entityType, startDate, endDate, limit = 50, offset = 0, } = filters;
        const query = this.auditLogRepository.createQueryBuilder('audit');
        if (userId) {
            query.andWhere('audit.userId = :userId', { userId });
        }
        if (module) {
            query.andWhere('audit.module = :module', { module });
        }
        if (action) {
            query.andWhere('audit.action = :action', { action });
        }
        if (entityType) {
            query.andWhere('audit.entityType = :entityType', { entityType });
        }
        if (startDate) {
            query.andWhere('audit.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('audit.createdAt <= :endDate', { endDate });
        }
        query.orderBy('audit.createdAt', 'DESC');
        query.take(limit);
        query.skip(offset);
        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }
    async getEntityHistory(entityType, entityId) {
        return this.auditLogRepository.find({
            where: {
                entityType,
                entityId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async getUserActivity(userId, limit = 100) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getRecentActions(hours = 24, limit = 100) {
        const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.auditLogRepository
            .createQueryBuilder('audit')
            .where('audit.createdAt >= :sinceDate', { sinceDate })
            .orderBy('audit.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map