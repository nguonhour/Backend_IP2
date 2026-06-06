import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import type { AuthenticatedRequest } from '../../../common/types/auth-request.type';

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private readonly secret = process.env.JWT_SECRET || 'dev-only-secret';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    const payload = this.verifyToken(token);

    if (payload) {
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }

    return true;
  }

  private verifyToken(token?: string): TokenPayload | null {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = createHmac('sha256', this.secret)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf-8'),
      ) as TokenPayload;

      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload;
    } catch {
      return null;
    }
  }
}
