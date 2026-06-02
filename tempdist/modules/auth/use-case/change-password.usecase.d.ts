import { UserRepository } from '../repositories/user.repository';
export declare class ChangePasswordUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private hashPassword;
}
