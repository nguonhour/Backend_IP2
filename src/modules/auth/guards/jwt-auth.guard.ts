import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';
import type { AuthenticatedRequest } from '../../../common/types/auth-request.type';
import { User } from '../../users/user.entity';
import { UserStatus } from '../../users/user-status.enum';

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

  constructor(private readonly dataSource: DataSource) {
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
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: user.role?.name ?? payload.role,
    };
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
      ) as TokenPayload;
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
