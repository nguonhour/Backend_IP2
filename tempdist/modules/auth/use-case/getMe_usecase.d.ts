import { UserRepository } from '../repositories/user.repository';
export declare class GetMeUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(userId: string): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
