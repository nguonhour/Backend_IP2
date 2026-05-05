import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../entities/master/role.entity';
import { User } from '../../users/user.entity';

type RepoResult<T> = {
  data: T | null;
};

type CreateUserInput = {
  email: string;
  password: string;
  is_verified: boolean;
  role: string;
};

type CreateOAuthUserInput = {
  email: string;
  is_verified: boolean;
  role: string;
  authProvider: string;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<RepoResult<User>> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role'],
    });

    return { data: user };
  }

  async create(input: CreateUserInput): Promise<RepoResult<User>> {
    const role = await this.roleRepository.findOne({
      where: { name: input.role.toUpperCase(), isActive: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash: input.password,
      isVerified: input.is_verified,
      authProvider: 'LOCAL',
      role,
    });

    const saved = await this.userRepository.save(user);
    return { data: saved };
  }

  async createOAuthUser(input: CreateOAuthUserInput): Promise<RepoResult<User>> {
    const role = await this.roleRepository.findOne({
      where: { name: input.role.toUpperCase(), isActive: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash: '',
      isVerified: input.is_verified,
      authProvider: input.authProvider,
      role,
    });

    const saved = (await this.userRepository.save(user)) as User;
    return { data: saved };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { refreshTokenHash: this.hashToken(refreshToken) },
    );
  }

  async findByRefreshTokenHash(tokenHash: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { refreshTokenHash: tokenHash },
      relations: ['role'],
    });

    return user;
  }

  private hashToken(token: string): string {
    return Buffer.from(token).toString('base64url');
  }
}
