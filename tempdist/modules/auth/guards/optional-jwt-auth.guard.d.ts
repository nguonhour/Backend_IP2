import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class OptionalJwtAuthGuard implements CanActivate {
    private readonly secret;
    canActivate(context: ExecutionContext): boolean;
    private verifyToken;
}
