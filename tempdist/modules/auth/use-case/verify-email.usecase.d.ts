import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
export declare class VerifyEmailUseCase {
    private readonly userRepo;
    private readonly tokenService;
    constructor(userRepo: UserRepository, tokenService: TokenService);
    execute(token: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
        message: string;
    }>;
    private hashToken;
}
