import { BadRequestException as NestBadRequestException } from '@nestjs/common';
export declare class CustomBadRequestException extends NestBadRequestException {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class ValidationException extends CustomBadRequestException {
    constructor(field: string, message: string);
}
export declare class DuplicateException extends CustomBadRequestException {
    constructor(resource: string, field: string);
}
export declare class ResourceNotFoundException extends NestBadRequestException {
    constructor(resource: string, id: string);
}
export declare class AccessDeniedException extends NestBadRequestException {
    constructor(message?: string);
}
export declare class UnauthorizedException extends NestBadRequestException {
    constructor(message?: string);
}
export declare class QuotaExceededException extends CustomBadRequestException {
    constructor(resource: string, limit: number);
}
export declare class InvalidTransactionException extends CustomBadRequestException {
    constructor(message: string);
}
