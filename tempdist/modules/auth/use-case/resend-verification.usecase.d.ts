import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../services/email.service';
export declare class ResendVerificationUseCase {
    private readonly userRepo;
    private readonly emailService;
    constructor(userRepo: UserRepository, emailService: EmailService);
    execute(email: string): Promise<{
        message: string;
    }>;
    private hashToken;
}
