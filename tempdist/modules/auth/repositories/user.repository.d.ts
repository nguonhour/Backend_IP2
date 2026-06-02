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
export declare class UserRepository {
    private readonly userRepository;
    private readonly roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    findByEmail(email: string): Promise<RepoResult<User>>;
    create(input: CreateUserInput): Promise<RepoResult<User>>;
    createOAuthUser(input: CreateOAuthUserInput): Promise<RepoResult<User>>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
    updateEmailVerification(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
    updateResetToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void>;
    findByResetTokenHash(tokenHash: string): Promise<User | null>;
    clearResetToken(userId: string): Promise<void>;
    findByEmailVerificationTokenHash(tokenHash: string): Promise<User | null>;
    markEmailVerified(userId: string): Promise<void>;
    findByRefreshTokenHash(tokenHash: string): Promise<User | null>;
    private hashToken;
    findByIdWithRole(id: string): Promise<User | null>;
}
export {};
