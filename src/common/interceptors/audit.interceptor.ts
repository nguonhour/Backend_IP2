import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { AuditService } from '../../modules/audit-logs/audit.service';
import { AuditAction } from '../../modules/audit-logs/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const duration = Date.now() - startTime;

          // Extract entity ID from result if available
          const entityId =
            result?.id ||
            request.params?.id ||
            request.body?.id ||
            undefined;

          const sanitized = this.sanitizeData(result);
          await this.auditService.log({
            userId: user?.id,
            action: auditMetadata.action as AuditAction,
            module: auditMetadata.module,
            entityId,
            entityType: auditMetadata.entityType,
            newData: sanitized || undefined,
            description: `${auditMetadata.action} ${auditMetadata.entityType} in ${duration}ms`,
            ipAddress,
            userAgent,
          });
        } catch (err) {
          this.logger.error(`Failed to log audit: ${err}`);
        }
      }),
      catchError((err) => {
        // Still log on error for security audit trail
        this.auditService
          .log({
            userId: user?.id,
            action: auditMetadata.action as AuditAction,
            module: auditMetadata.module,
            entityType: auditMetadata.entityType,
            description: `${auditMetadata.action} failed: ${err.message}`,
            ipAddress,
            userAgent,
          })
          .catch(() => {
            /* ignore */
          });

        throw err;
      }),
    );
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }

  private sanitizeData(data: any): Record<string, any> | null {
    if (!data || typeof data !== 'object') return null;

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = [
      'passwordHash',
      'password',
      'refreshToken',
      'token',
      'secret',
      'apiKey',
    ];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
