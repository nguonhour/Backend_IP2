import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
export declare class RefreshTokenUseCase {
    private readonly userRepo;
    private readonly tokenService;
    constructor(userRepo: UserRepository, tokenService: TokenService);
    execute(refreshToken: string, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    private hashToken;
}
