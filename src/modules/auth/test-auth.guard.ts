import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

/**
 * Mock auth guard for development/testing.
 * Replace with real JWT guard in production.
 */
@Injectable()
export class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authRequest = request as AuthenticatedRequest;

    // Get user ID from header (for testing)
    const testUserId = request.headers['x-test-user-id'] as string;

    if (!testUserId) {
      throw new UnauthorizedException(
        'Missing x-test-user-id header. Add header with a valid user UUID.',
      );
    }

    // Mock user object
    authRequest.user = { id: testUserId };

    return true;
  }
}
