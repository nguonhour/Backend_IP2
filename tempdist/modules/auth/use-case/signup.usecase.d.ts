import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { Repository } from 'typeorm';
import { StudentProfile } from '../../student-profiles/student-profile.entity';
import { Resume } from '../../resumes/resume.entity';
import { EmailService } from '../services/email.service';
import { EmployerProfile } from '../../employer-profiles/employer-profile.entity';
export declare class SignupUseCase {
    private readonly userRepo;
    private readonly tokenService;
    private readonly emailService;
    private readonly studentProfileRepository?;
    private readonly resumeRepository?;
    private readonly employerProfileRepository?;
    constructor(userRepo: UserRepository, tokenService: TokenService, emailService: EmailService, studentProfileRepository?: Repository<StudentProfile> | undefined, resumeRepository?: Repository<Resume> | undefined, employerProfileRepository?: Repository<EmployerProfile> | undefined);
    execute(email: string, password: string, role: string, res: Response, additionalData?: Record<string, any>): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
        message: string;
    }>;
    private hashPassword;
    private hashToken;
}
