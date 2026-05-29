import { BadRequestException as NestBadRequestException } from '@nestjs/common';

/**
 * Custom exceptions for consistent error responses
 */

export class CustomBadRequestException extends NestBadRequestException {
  constructor(message: string, public readonly code: string) {
    super({ statusCode: 400, message, code });
  }
}

export class ValidationException extends CustomBadRequestException {
  constructor(field: string, message: string) {
    super(`Validation error: ${message}`, `VALIDATION_${field.toUpperCase()}`);
  }
}

export class DuplicateException extends CustomBadRequestException {
  constructor(resource: string, field: string) {
    super(
      `${resource} with this ${field} already exists`,
      `DUPLICATE_${resource.toUpperCase()}`,
    );
  }
}

export class ResourceNotFoundException extends NestBadRequestException {
  constructor(resource: string, id: string) {
    super({
      statusCode: 404,
      message: `${resource} with id ${id} not found`,
      code: `NOT_FOUND_${resource.toUpperCase()}`,
    });
  }
}

export class AccessDeniedException extends NestBadRequestException {
  constructor(message = 'Access denied') {
    super({
      statusCode: 403,
      message,
      code: 'ACCESS_DENIED',
    });
  }
}

export class UnauthorizedException extends NestBadRequestException {
  constructor(message = 'Unauthorized') {
    super({
      statusCode: 401,
      message,
      code: 'UNAUTHORIZED',
    });
  }
}

export class QuotaExceededException extends CustomBadRequestException {
  constructor(resource: string, limit: number) {
    super(
      `${resource} quota exceeded. Limit: ${limit}`,
      `QUOTA_EXCEEDED_${resource.toUpperCase()}`,
    );
  }
}

export class InvalidTransactionException extends CustomBadRequestException {
  constructor(message: string) {
    super(message, 'INVALID_TRANSACTION');
  }
}
