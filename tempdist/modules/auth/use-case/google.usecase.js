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
exports.GoogleUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const user_repository_1 = require("../repositories/user.repository");
const token_service_1 = require("../services/token.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employer_profile_entity_1 = require("../../employer-profiles/employer-profile.entity");
let GoogleUseCase = class GoogleUseCase {
    userRepo;
    tokenService;
    employerProfileRepository;
    supabase;
    constructor(userRepo, tokenService, employerProfileRepository) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
        this.employerProfileRepository = employerProfileRepository;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials in environment variables');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async execute(accessToken, role, res) {
        let email;
        let avatarUrl = null;
        let displayName = null;
        try {
            const { data, error } = await this.supabase.auth.getUser(accessToken);
            if (error || !data.user || !data.user.email) {
                throw new common_1.UnauthorizedException('Invalid Supabase token');
            }
            email = data.user.email;
            avatarUrl =
                data.user.user_metadata?.avatar_url ??
                    data.user.user_metadata?.picture ??
                    null;
            displayName =
                data.user.user_metadata?.full_name ??
                    data.user.user_metadata?.name ??
                    data.user.email ??
                    null;
        }
        catch {
            throw new common_1.UnauthorizedException('Failed to verify token with Supabase');
        }
        console.log(`[GoogleUseCase] received Google token for email=${email} role=${role}`);
        const normalizedRole = (role ?? '').toLowerCase();
        const { data: existing } = await this.userRepo.findByEmail(email);
        let user = existing;
        if (user && role) {
            try {
                if (normalizedRole === 'employer' && this.employerProfileRepository) {
                    const existingProfile = await this.employerProfileRepository.findOne({
                        where: { user: { id: user.id } },
                    });
                    if (!existingProfile) {
                        const companyName = (displayName ?? email ?? 'Employer').trim() || 'Employer';
                        const profile = this.employerProfileRepository.create({
                            user: { id: user.id },
                            companyName,
                            contactEmail: email,
                            avatarUrl,
                        });
                        await this.employerProfileRepository.save(profile);
                        console.log('Created missing EmployerProfile for existing user:', user.id);
                    }
                }
            }
            catch (err) {
                console.error('Failed to ensure EmployerProfile for existing user:', err);
            }
            return {
                isExistingUser: true,
                email,
            };
        }
        if (!user && !role) {
            return {
                isNewUser: true,
                email,
            };
        }
        if (!user && role) {
            const repo = this.userRepo;
            console.log(`[GoogleUseCase] creating OAuth user for email=${email} role=${role}`);
            const { data: created } = await repo.createOAuthUser({
                email,
                is_verified: true,
                role: role,
                authProvider: 'GOOGLE',
            });
            if (!created) {
                throw new common_1.InternalServerErrorException('Unable to create user');
            }
            user = created;
            console.log(`[GoogleUseCase] created user id=${user.id} email=${user.email} role=${user.role?.name}`);
            if (normalizedRole === 'employer' && this.employerProfileRepository) {
                try {
                    const companyName = (displayName ?? email ?? 'Employer').trim() || 'Employer';
                    const profile = this.employerProfileRepository.create({
                        user: { id: user.id },
                        companyName,
                        contactEmail: email,
                        avatarUrl,
                    });
                    await this.employerProfileRepository.save(profile);
                    console.log('[GoogleUseCase] created EmployerProfile for user:', user.id);
                }
                catch (err) {
                    console.error('Failed to create EmployerProfile for Google signup:', err);
                }
            }
        }
        if (!user) {
            throw new common_1.InternalServerErrorException('Failed to get or create user');
        }
        const tokens = this.tokenService.generateTokens(user);
        await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.name,
                name: displayName,
                avatarUrl,
            },
            isNewUser: false,
        };
    }
};
exports.GoogleUseCase = GoogleUseCase;
exports.GoogleUseCase = GoogleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(employer_profile_entity_1.EmployerProfile)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        token_service_1.TokenService,
        typeorm_2.Repository])
], GoogleUseCase);
//# sourceMappingURL=google.usecase.js.map