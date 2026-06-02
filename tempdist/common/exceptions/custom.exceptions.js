"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTransactionException = exports.QuotaExceededException = exports.UnauthorizedException = exports.AccessDeniedException = exports.ResourceNotFoundException = exports.DuplicateException = exports.ValidationException = exports.CustomBadRequestException = void 0;
const common_1 = require("@nestjs/common");
class CustomBadRequestException extends common_1.BadRequestException {
    code;
    constructor(message, code) {
        super({ statusCode: 400, message, code });
        this.code = code;
    }
}
exports.CustomBadRequestException = CustomBadRequestException;
class ValidationException extends CustomBadRequestException {
    constructor(field, message) {
        super(`Validation error: ${message}`, `VALIDATION_${field.toUpperCase()}`);
    }
}
exports.ValidationException = ValidationException;
class DuplicateException extends CustomBadRequestException {
    constructor(resource, field) {
        super(`${resource} with this ${field} already exists`, `DUPLICATE_${resource.toUpperCase()}`);
    }
}
exports.DuplicateException = DuplicateException;
class ResourceNotFoundException extends common_1.BadRequestException {
    constructor(resource, id) {
        super({
            statusCode: 404,
            message: `${resource} with id ${id} not found`,
            code: `NOT_FOUND_${resource.toUpperCase()}`,
        });
    }
}
exports.ResourceNotFoundException = ResourceNotFoundException;
class AccessDeniedException extends common_1.BadRequestException {
    constructor(message = 'Access denied') {
        super({
            statusCode: 403,
            message,
            code: 'ACCESS_DENIED',
        });
    }
}
exports.AccessDeniedException = AccessDeniedException;
class UnauthorizedException extends common_1.BadRequestException {
    constructor(message = 'Unauthorized') {
        super({
            statusCode: 401,
            message,
            code: 'UNAUTHORIZED',
        });
    }
}
exports.UnauthorizedException = UnauthorizedException;
class QuotaExceededException extends CustomBadRequestException {
    constructor(resource, limit) {
        super(`${resource} quota exceeded. Limit: ${limit}`, `QUOTA_EXCEEDED_${resource.toUpperCase()}`);
    }
}
exports.QuotaExceededException = QuotaExceededException;
class InvalidTransactionException extends CustomBadRequestException {
    constructor(message) {
        super(message, 'INVALID_TRANSACTION');
    }
}
exports.InvalidTransactionException = InvalidTransactionException;
//# sourceMappingURL=custom.exceptions.js.map