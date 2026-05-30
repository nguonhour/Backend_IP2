"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const user_repository_1 = require("../repositories/user.repository");
const token_service_1 = require("../services/token.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_profile_entity_1 = require("../../student-profiles/student-profile.entity");
const resume_entity_1 = require("../../resumes/resume.entity");
const email_service_1 = require("../services/email.service");
const employer_profile_entity_1 = require("../../employer-profiles/employer-profile.entity");
let SignupUseCase = class SignupUseCase {
    userRepo;
    tokenService;
    emailService;
    studentProfileRepository;
    resumeRepository;
    employerProfileRepository;
    constructor(userRepo, tokenService, emailService, studentProfileRepository, resumeRepository, employerProfileRepository) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.studentProfileRepository = studentProfileRepository;
        this.resumeRepository = resumeRepository;
        this.employerProfileRepository = employerProfileRepository;
    }
    async execute(email, password, role, res, additionalData) {
        const existing = await this.userRepo.findByEmail(email);
        if (existing.data) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashed = this.hashPassword(password);
        const { data: user } = await this.userRepo.create({
            email,
            password: hashed,
            is_verified: false,
            role,
        });
        if (!user) {
            throw new common_1.InternalServerErrorException('Unable to create user');
        }
        const verificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const verificationTokenHash = this.hashToken(verificationToken);
        const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await this.userRepo.updateEmailVerification(user.id, verificationTokenHash, verificationExpiresAt);
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
        if (role === 'student' && additionalData && this.studentProfileRepository) {
            const displayName = (additionalData.name ?? '').trim();
            const [firstName, ...rest] = displayName.split(' ');
            const lastName = rest.join(' ') || '';
            const profile = this.studentProfileRepository.create({
                user: { id: user.id },
                firstName: firstName || displayName || 'Student',
                lastName: lastName,
                avatarUrl: additionalData.avatarUrl ?? null,
            });
            const savedProfile = await this.studentProfileRepository.save(profile);
            if (additionalData.cvUrl && this.resumeRepository) {
                const resume = this.resumeRepository.create({
                    studentId: savedProfile.id,
                    fileUrl: additionalData.cvUrl,
                    isDefault: true,
                });
                await this.resumeRepository.save(resume);
            }
        }
        if (role === 'employer' &&
            additionalData &&
            this.employerProfileRepository) {
            const profile = this.employerProfileRepository.create({
                user: { id: user.id },
                companyName: additionalData.companyName?.trim() ||
                    additionalData.name?.trim() ||
                    'Employer',
                contactEmail: user.email,
                website: additionalData.companyWebsite ?? null,
            });
            await this.employerProfileRepository.save(profile);
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                role: role,
            },
            message: 'Verification email sent',
        };
    }
    hashPassword(password) {
        if (!password) {
            throw new common_1.InternalServerErrorException('Invalid password');
        }
        return (0, crypto_1.createHash)('sha256').update(password).digest('hex');
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.SignupUseCase = SignupUseCase;
exports.SignupUseCase = SignupUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(student_profile_entity_1.StudentProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __param(5, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        token_service_1.TokenService,
        email_service_1.EmailService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SignupUseCase);
//# sourceMappingURL=signup.usecase.js.map