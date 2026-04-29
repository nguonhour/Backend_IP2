import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import type { AuthenticatedRequest } from '../../../common/types/auth-request.type';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'dev-only-secret';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header. Expected: Bearer <token>',
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = this.verifyToken(token);

    request.user = { id: payload.sub };
    return true;
  }

  private verifyToken(token: string): TokenPayload {
    const secret = this.secret;

    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    // Decode payload
    let payload: TokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf-8'),
      );
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
  }
}
