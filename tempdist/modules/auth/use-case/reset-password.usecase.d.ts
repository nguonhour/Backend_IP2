import { UserRepository } from '../repositories/user.repository';
export declare class ResetPasswordUseCase {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(email: string, token: string, newPassword: string): Promise<void>;
}
