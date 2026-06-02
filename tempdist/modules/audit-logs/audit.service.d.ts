import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';
export interface CreateAuditLogDto {
    userId?: string;
    action: AuditAction;
    module: string;
    entityId?: string;
    entityType: string;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(dto: CreateAuditLogDto): Promise<AuditLog>;
    getLogs(filters?: {
        userId?: string;
        module?: string;
        action?: AuditAction;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: AuditLog[];
        total: number;
    }>;
    getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]>;
    getUserActivity(userId: string, limit?: number): Promise<AuditLog[]>;
    getRecentActions(hours?: number, limit?: number): Promise<AuditLog[]>;
}
