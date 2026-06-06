import { applyDecorators, SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string; // CREATE, UPDATE, DELETE, APPROVE, etc.
  module: string; // 'jobs', 'applications', etc.
  entityType: string; // 'Job', 'Application', etc.
}

/**
 * Decorator to mark a method for audit logging
 * Usage:
 * @Audit({
 *   action: 'CREATE',
 *   module: 'jobs',
 *   entityType: 'Job'
 * })
 * async createJob(dto: CreateJobDto) { ... }
 */
export function Audit(metadata: AuditMetadata) {
  return applyDecorators(SetMetadata(AUDIT_KEY, metadata));
}
