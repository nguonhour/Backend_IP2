import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';

@Injectable()
export class GoogleUseCase {
  private supabase: SupabaseClient;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseKey,
    ) as unknown as SupabaseClient;
  }

  async execute(accessToken: string, role: string | undefined, res: Response) {
    // 1. Explicitly typed as strings to prevent "Unsafe assignment of 'any' value"
    // let user_id: string;
    let email: string;
    let avatarUrl: string | null = null;
    let displayName: string | null = null;

    try {
      // Verify the token by getting user from Supabase
      const { data, error } = await this.supabase.auth.getUser(accessToken);

      if (error || !data.user || !data.user.email) {
        throw new UnauthorizedException('Invalid Supabase token');
      }

      // user_id = data.user.id;
      email = data.user.email;
      avatarUrl =
        (data.user.user_metadata?.avatar_url as string | undefined) ??
        (data.user.user_metadata?.picture as string | undefined) ??
        null;
      displayName =
        (data.user.user_metadata?.full_name as string | undefined) ??
        (data.user.user_metadata?.name as string | undefined) ??
        data.user.email ??
        null;
    } catch {
      throw new UnauthorizedException('Failed to verify token with Supabase');
    }

    // Find or create user in local database
    const { data: existing } = await this.userRepo.findByEmail(email);
    let user = existing;

    // If user already exists and is trying to sign up again, tell the frontend
    if (user && role) {
      return {
        isExistingUser: true,
        email,
      };
    }

    // If user is new and no role provided, allow the frontend to continue as login
    if (!user && !role) {
      return {
        isNewUser: true,
        email,
      };
    }

    // If user is new but role is provided, create the user
    if (!user && role) {
      // 2. We use a strict structural cast here instead of 'as any'
      // to completely satisfy ESLint's strict safety rules.
      const repo = this.userRepo as unknown as {
        createOAuthUser: (dto: {
          email: string;
          is_verified: boolean;
          role: string;
          authProvider: string;
        }) => Promise<{ data: typeof existing }>;
      };

      const { data: created } = await repo.createOAuthUser({
        email,
        is_verified: true,
        role,
        authProvider: 'GOOGLE',
      });

      if (!created) {
        throw new InternalServerErrorException('Unable to create user');
      }

      user = created;
    }

    // At this point, user is guaranteed to exist
    if (!user) {
      throw new InternalServerErrorException('Failed to get or create user');
    }

    // Generate app tokens
    const tokens = this.tokenService.generateTokens(user);
    await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);

    const isProd = process.env.NODE_ENV === 'production'

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
        name: displayName,
        avatarUrl,
      },
      isNewUser: false,
    };
  }
}
