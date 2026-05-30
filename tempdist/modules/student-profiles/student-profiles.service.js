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
exports.StudentProfilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_profile_entity_1 = require("./student-profile.entity");
const saved_job_entity_1 = require("../jobs/saved-job.entity");
const job_entity_1 = require("../jobs/job.entity");
const resume_entity_1 = require("../resumes/resume.entity");
const university_entity_1 = require("../../entities/master/university.entity");
const major_entity_1 = require("../../entities/master/major.entity");
const user_entity_1 = require("../users/user.entity");
const master_1 = require("../../entities/master");
const industry_entity_1 = require("../../entities/master/industry.entity");
const student_skill_entity_1 = require("./student-skill.entity");
const student_industry_entity_1 = require("./student-industry.entity");
let StudentProfilesService = class StudentProfilesService {
    studentProfileRepository;
    savedJobRepository;
    jobRepository;
    resumeRepository;
    universityRepository;
    majorRepository;
    userRepository;
    skillRepository;
    studentSkillRepository;
    industryRepository;
    studentIndustryRepository;
    constructor(studentProfileRepository, savedJobRepository, jobRepository, resumeRepository, universityRepository, majorRepository, userRepository, skillRepository, studentSkillRepository, industryRepository, studentIndustryRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.universityRepository = universityRepository;
        this.majorRepository = majorRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.industryRepository = industryRepository;
        this.studentIndustryRepository = studentIndustryRepository;
    }
    async saveJob(userId, jobId) {
        const student = await this.getStudentProfileByUserId(userId);
        const existing = await this.savedJobRepository
            .createQueryBuilder('saved_job')
            .innerJoin('saved_job.student', 'student')
            .where('student.id = :studentId', { studentId: student.id })
            .andWhere('saved_job.job = :jobId', { jobId })
            .getOne();
        if (existing) {
            throw new common_1.ConflictException('Job already saved');
        }
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        const savedJob = this.savedJobRepository.create({
            job: { id: job.id },
            student: { id: student.id },
        });
        return this.savedJobRepository.save(savedJob);
    }
    async getSavedJobs(userId) {
        const student = await this.getStudentProfileByUserId(userId);
        return this.savedJobRepository
            .createQueryBuilder('saved_job')
            .innerJoinAndSelect('saved_job.job', 'job')
            .leftJoinAndSelect('job.category', 'category')
            .leftJoinAndSelect('job.jobType', 'jobType')
            .leftJoinAndSelect('job.status', 'status')
            .leftJoinAndSelect('job.employer', 'employer')
            .innerJoin('saved_job.student', 'student')
            .where('student.id = :studentId', { studentId: student.id })
            .orderBy('saved_job.id', 'DESC')
            .getMany()
            .then((results) => results.map((r) => r.job));
    }
    async removeSavedJob(userId, jobId) {
        const student = await this.getStudentProfileByUserId(userId);
        const savedJob = await this.savedJobRepository
            .createQueryBuilder('saved_job')
            .innerJoin('saved_job.student', 'student')
            .where('student.id = :studentId', { studentId: student.id })
            .andWhere('saved_job.job = :jobId', { jobId })
            .getOne();
        if (!savedJob) {
            throw new common_1.NotFoundException('Saved job not found');
        }
        await this.savedJobRepository.remove(savedJob);
        return { message: 'Job removed from saved list' };
    }
    async getStudentProfileByUserId(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User not found for id ${userId}`);
        }
        if (user.role?.name?.toUpperCase() !== 'STUDENT') {
            throw new common_1.ForbiddenException('Only student accounts can access student profiles');
        }
        let student = await this.studentProfileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!student) {
            const profile = new student_profile_entity_1.StudentProfile();
            profile.firstName = 'Student';
            profile.lastName = '';
            profile.user = user;
            try {
                student = await this.studentProfileRepository.save(profile);
                console.log('Auto-created StudentProfile:', student.id);
            }
            catch (err) {
                if (this.isUniqueViolation(err)) {
                    student = await this.studentProfileRepository.findOne({
                        where: { user: { id: userId } },
                        relations: ['user'],
                    });
                    if (student) {
                        return student;
                    }
                }
                console.error('Failed to auto-create StudentProfile:', err);
                throw new common_1.NotFoundException(`Student profile not found for user ${userId}`);
            }
        }
        return student;
    }
    isUniqueViolation(error) {
        return (error instanceof typeorm_2.QueryFailedError &&
            error.driverError?.code === '23505');
    }
    async getProfile(userId) {
        const student = await this.getStudentProfileByUserId(userId);
        const profile = await this.studentProfileRepository.findOne({
            where: { id: student.id },
            relations: [
                'user',
                'university',
                'major',
                'studentSkills',
                'studentIndustries',
            ],
        });
        if (!profile) {
            return null;
        }
        const resumes = await this.resumeRepository.find({
            where: { studentId: profile.id },
            order: { createdAt: 'DESC' },
        });
        profile.resumes = resumes;
        return profile;
    }
    async getProfileById(studentId) {
        const profile = await this.studentProfileRepository.findOne({
            where: { id: studentId },
            relations: [
                'user',
                'university',
                'major',
                'studentSkills',
                'studentIndustries',
            ],
        });
        if (!profile) {
            return null;
        }
        const resumes = await this.resumeRepository.find({
            where: { studentId: profile.id },
            order: { createdAt: 'DESC' },
        });
        profile.resumes = resumes;
        return profile;
    }
    async updateProfile(userId, dto) {
        const student = await this.getStudentProfileByUserId(userId);
        if (dto.firstName !== undefined)
            student.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            student.lastName = dto.lastName;
        if (dto.avatarUrl !== undefined)
            student.avatarUrl = dto.avatarUrl;
        if (dto.yearOfStudy !== undefined)
            student.yearOfStudy = dto.yearOfStudy;
        if (dto.universityName !== undefined) {
            const normalizedUniversityName = dto.universityName.trim();
            if (!normalizedUniversityName) {
                student.university = null;
            }
            else {
                student.university = await this.findOrCreateUniversity(normalizedUniversityName);
            }
        }
        if (dto.majorName !== undefined) {
            const normalizedMajorName = dto.majorName.trim();
            if (!normalizedMajorName) {
                student.major = null;
            }
            else {
                student.major = await this.findOrCreateMajor(normalizedMajorName);
            }
        }
        return this.studentProfileRepository.save(student);
    }
    async findOrCreateUniversity(name) {
        const existing = await this.universityRepository
            .createQueryBuilder('university')
            .where('LOWER(university.name) = LOWER(:name)', { name })
            .getOne();
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                return this.universityRepository.save(existing);
            }
            return existing;
        }
        const created = this.universityRepository.create({ name, isActive: true });
        return this.universityRepository.save(created);
    }
    async findOrCreateMajor(name) {
        const existing = await this.majorRepository
            .createQueryBuilder('major')
            .where('LOWER(major.name) = LOWER(:name)', { name })
            .getOne();
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                return this.majorRepository.save(existing);
            }
            return existing;
        }
        const created = this.majorRepository.create({ name, isActive: true });
        return this.majorRepository.save(created);
    }
    async addResume(userId, fileUrl) {
        const student = await this.getStudentProfileByUserId(userId);
        console.log('Adding resume for student:', student.id);
        await this.resumeRepository
            .createQueryBuilder()
            .update(resume_entity_1.Resume)
            .set({ isDefault: false })
            .where('student_id = :studentId', { studentId: student.id })
            .andWhere('is_default = :isDefault', { isDefault: true })
            .execute();
        const resume = this.resumeRepository.create({
            fileUrl,
            isDefault: true,
            studentId: student.id,
        });
        return this.resumeRepository.save(resume);
    }
    async addSkills(userId, dto) {
        const student = await this.getStudentProfileByUserId(userId);
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const normalized = dto.skills
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0);
        if (normalized.length === 0) {
            return { message: 'No skills provided' };
        }
        const existingSkills = await this.skillRepository
            .createQueryBuilder('skill')
            .where('LOWER(skill.name) IN (:...names)', {
            names: normalized.map((name) => name.toLowerCase()),
        })
            .getMany();
        const existingNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));
        const newSkills = normalized
            .filter((name) => !existingNames.has(name.toLowerCase()))
            .map((name) => this.skillRepository.create({ name }));
        const createdSkills = newSkills.length > 0 ? await this.skillRepository.save(newSkills) : [];
        const allSkills = [...existingSkills, ...createdSkills];
        const existingStudentSkills = await this.studentSkillRepository.find({
            where: { studentId: student.id },
        });
        const existingSkillIds = new Set(existingStudentSkills.map((s) => s.skillId));
        const toInsert = allSkills
            .filter((skill) => !existingSkillIds.has(skill.id))
            .map((skill) => this.studentSkillRepository.create({
            studentId: student.id,
            skillId: skill.id,
        }));
        if (toInsert.length > 0) {
            await this.studentSkillRepository.save(toInsert);
        }
        return { message: 'Skills updated', added: toInsert.length };
    }
    async addIndustries(userId, dto) {
        const student = await this.getStudentProfileByUserId(userId);
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const normalized = dto.industries
            .map((industry) => industry.trim())
            .filter((industry) => industry.length > 0);
        if (normalized.length === 0) {
            return { message: 'No industries provided' };
        }
        const existingIndustries = await this.industryRepository
            .createQueryBuilder('industry')
            .where('LOWER(industry.name) IN (:...names)', {
            names: normalized.map((name) => name.toLowerCase()),
        })
            .getMany();
        const existingNames = new Set(existingIndustries.map((i) => i.name.toLowerCase()));
        const newIndustries = normalized
            .filter((name) => !existingNames.has(name.toLowerCase()))
            .map((name) => this.industryRepository.create({ name }));
        const createdIndustries = newIndustries.length > 0
            ? await this.industryRepository.save(newIndustries)
            : [];
        const allIndustries = [...existingIndustries, ...createdIndustries];
        const existingStudentIndustries = await this.studentIndustryRepository.find({
            where: { studentId: student.id },
        });
        const existingIndustryIds = new Set(existingStudentIndustries.map((i) => i.industryId));
        const toInsert = allIndustries
            .filter((industry) => !existingIndustryIds.has(industry.id))
            .map((industry) => this.studentIndustryRepository.create({
            studentId: student.id,
            industryId: industry.id,
        }));
        if (toInsert.length > 0) {
            await this.studentIndustryRepository.save(toInsert);
        }
        return { message: 'Industries updated', added: toInsert.length };
    }
};
exports.StudentProfilesService = StudentProfilesService;
exports.StudentProfilesService = StudentProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_profile_entity_1.StudentProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(saved_job_entity_1.SavedJob)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(3, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __param(4, (0, typeorm_1.InjectRepository)(university_entity_1.University)),
    __param(5, (0, typeorm_1.InjectRepository)(major_entity_1.Major)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(master_1.Skill)),
    __param(8, (0, typeorm_1.InjectRepository)(student_skill_entity_1.StudentSkill)),
    __param(9, (0, typeorm_1.InjectRepository)(industry_entity_1.Industry)),
    __param(10, (0, typeorm_1.InjectRepository)(student_industry_entity_1.StudentIndustry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentProfilesService);
//# sourceMappingURL=student-profiles.service.js.map