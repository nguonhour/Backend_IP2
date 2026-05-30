import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtAuthGuard implements CanActivate {
    private readonly secret;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
    private verifyToken;
}
