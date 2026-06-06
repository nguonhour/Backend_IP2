import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

type TokenUser = {
  id: string;
  email: string;
  role?: {
    name: string;
  };
};

@Injectable()
export class TokenService {
  generateTokens(user: TokenUser): {
    accessToken: string;
    refreshToken: string;
  } {
    const role = user.role?.name.toUpperCase();

    if (!role) {
      throw new Error('User role is required to generate tokens');
    }

    const accessToken = this.sign(
      { sub: user.id, email: user.email, role },
      60 * 60, // 1 hour
    );

    const refreshToken = this.sign(
      { sub: user.id, email: user.email, role, type: 'refresh' },
      60 * 60 * 24 * 7, // 7 days
    );

    return { accessToken, refreshToken };
  }

  private sign(
    payload: Record<string, unknown>,
    expiresInSeconds: number,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const body = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const secret = process.env.JWT_SECRET || 'dev-only-secret';
    const encodedPayload = Buffer.from(JSON.stringify(body)).toString(
      'base64url',
    );
    const signature = createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    return `${encodedPayload}.${signature}`;
  }
}
