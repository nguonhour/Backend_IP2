import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { Repository } from 'typeorm';
import { EmployerProfile } from '../../employer-profiles/employer-profile.entity';
export declare class GoogleUseCase {
    private readonly userRepo;
    private readonly tokenService;
    private readonly employerProfileRepository?;
    private supabase;
    constructor(userRepo: UserRepository, tokenService: TokenService, employerProfileRepository?: Repository<EmployerProfile> | undefined);
    execute(accessToken: string, role: string | undefined, res: Response): Promise<{
        isExistingUser: boolean;
        email: string;
        isNewUser?: undefined;
        accessToken?: undefined;
        user?: undefined;
    } | {
        isNewUser: boolean;
        email: string;
        isExistingUser?: undefined;
        accessToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            name: string;
            avatarUrl: string | null;
        };
        isNewUser: boolean;
        isExistingUser?: undefined;
        email?: undefined;
    }>;
}
