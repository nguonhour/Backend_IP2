import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an action
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...dto,
    });
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(
    filters: {
      userId?: string;
      module?: string;
      action?: AuditAction;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    const {
      userId,
      module,
      action,
      entityType,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

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

  /**
   * Get audit logs for specific entity
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
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

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get recent actions
   */
  async getRecentActions(hours = 24, limit = 100): Promise<AuditLog[]> {
    const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :sinceDate', { sinceDate })
      .orderBy('audit.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
