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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const audit_decorator_1 = require("../decorators/audit.decorator");
const audit_service_1 = require("../../modules/audit-logs/audit.service");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    reflector;
    auditService;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
    }
    intercept(context, next) {
        const auditMetadata = this.reflector.get(audit_decorator_1.AUDIT_KEY, context.getHandler());
        if (!auditMetadata) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const ipAddress = this.getClientIp(request);
        const userAgent = request.headers['user-agent'];
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)(async (result) => {
            try {
                const duration = Date.now() - startTime;
                const entityId = result?.id ||
                    request.params?.id ||
                    request.body?.id ||
                    undefined;
                const sanitized = this.sanitizeData(result);
                await this.auditService.log({
                    userId: user?.id,
                    action: auditMetadata.action,
                    module: auditMetadata.module,
                    entityId,
                    entityType: auditMetadata.entityType,
                    newData: sanitized || undefined,
                    description: `${auditMetadata.action} ${auditMetadata.entityType} in ${duration}ms`,
                    ipAddress,
                    userAgent,
                });
            }
            catch (err) {
                this.logger.error(`Failed to log audit: ${err}`);
            }
        }), (0, operators_1.catchError)((err) => {
            this.auditService
                .log({
                userId: user?.id,
                action: auditMetadata.action,
                module: auditMetadata.module,
                entityType: auditMetadata.entityType,
                description: `${auditMetadata.action} failed: ${err.message}`,
                ipAddress,
                userAgent,
            })
                .catch(() => {
            });
            throw err;
        }));
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.connection.remoteAddress ||
            'unknown');
    }
    sanitizeData(data) {
        if (!data || typeof data !== 'object')
            return null;
        const sanitized = { ...data };
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
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map