import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { SavedJob } from '../jobs/saved-job.entity';
import { Job } from '../jobs/job.entity';
import { Resume } from '../resumes/resume.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { User } from '../users/user.entity';
import { Skill } from '../../entities/master';
import { Industry } from '../../entities/master/industry.entity';
import { AddStudentSkillDto } from './dto/add-student-skill.dto';
import { StudentSkill } from './student-skill.entity';
import { StudentProfile } from './student-profile.entity';
import { StudentLanguage } from './student-language.entity';
import { AddStudentIndustryDto } from './dto/add-student-industry.dto';
import { StudentIndustry } from './student-industry.entity';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SetStudentSkillDto } from './dto/set-student-skill.dto';
import { StudentEducation } from './student-education.entity';
import { UpdateStudentEducationDto } from './dto/update-student-education.dto';

type UpdateStudentExperience = {
  title?: unknown;
  description?: unknown;
};

type UpdateStudentLanguage = {
  language?: unknown;
  level?: unknown;
};

@Injectable()
export class StudentProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    // @InjectRepository(University)
    // private universityRepository: Repository<University>,
    @InjectRepository(Major)
    private majorRepository: Repository<Major>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(StudentSkill)
    private studentSkillRepository: Repository<StudentSkill>,
    @InjectRepository(Industry)
    private industryRepository: Repository<Industry>,
    @InjectRepository(StudentIndustry)
    private studentIndustryRepository: Repository<StudentIndustry>,
    @InjectRepository(StudentEducation)
    private studentEducationRepository: Repository<StudentEducation>,
  ) {}

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const student = await this.getStudentProfileByUserId(userId);

    const existing = await this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('saved_job.job = :jobId', { jobId })
      .getOne();

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const savedJob = this.savedJobRepository.create({
      job: { id: job.id },
      student: { id: student.id },
    });

    return this.savedJobRepository.save(savedJob);
  }

  async getSavedJobs(userId: string): Promise<Job[]> {
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

  async removeSavedJob(
    userId: string,
    jobId: string,
  ): Promise<{ message: string }> {
    const student = await this.getStudentProfileByUserId(userId);

    const savedJob = await this.savedJobRepository
      .createQueryBuilder('saved_job')
      .innerJoin('saved_job.student', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('saved_job.job = :jobId', { jobId })
      .getOne();

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    await this.savedJobRepository.remove(savedJob);
    return { message: 'Job removed from saved list' };
  }

  private async getStudentProfileByUserId(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User not found for id ${userId}`);
    }

    if (user.role?.name?.toUpperCase() !== 'STUDENT') {
      throw new ForbiddenException(
        'Only student accounts can access student profiles',
      );
    }

    let student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    // Auto-create profile if it doesn't exist (for CV saves without prior profile creation)
    if (!student) {
      const profile = new StudentProfile();
      profile.firstName = 'Student';
      profile.lastName = '';
      profile.user = user;

      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['role'],
        });
        if (!user) {
          throw new NotFoundException(`User not found for id ${userId}`);
        }

        // Only auto-create a StudentProfile if the user's role is STUDENT
        if (!user.role || (user.role.name ?? '').toUpperCase() !== 'STUDENT') {
          throw new NotFoundException(
            `Student profile not found for user ${userId}`,
          );
        }

        const profile = new StudentProfile();
        profile.firstName = 'Student';
        profile.lastName = '';
        profile.user = user;

        student = await this.studentProfileRepository.save(profile);
        console.log('Auto-created StudentProfile:', student.id);
      } catch (err) {
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
        throw new NotFoundException(
          `Student profile not found for user ${userId}`,
        );
      }
    }

    return student;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string } | undefined)?.code === '23505'
    );
  }

  async getProfile(userId: string): Promise<StudentProfile | null> {
    const student = await this.getStudentProfileByUserId(userId);

    const profile = await this.studentProfileRepository.findOne({
      where: { id: student.id },
      relations: [
        'user',
        'educations',
        'major',
        'studentSkills',
        'studentSkills.skill',
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

    (profile as StudentProfile & { resumes?: Resume[] }).resumes = resumes;
    return profile;
  }

  async getProfileById(studentId: string): Promise<StudentProfile | null> {
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

    (profile as StudentProfile & { resumes?: Resume[] }).resumes = resumes;
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentProfile> {
    const student = await this.getStudentProfileByUserId(userId);

    if (dto.firstName !== undefined) student.firstName = dto.firstName;
    if (dto.lastName !== undefined) student.lastName = dto.lastName;
    if (dto.avatarUrl !== undefined) student.avatarUrl = dto.avatarUrl;
    if (typeof dto.aboutMe === 'string') {
      const normalizedAboutMe = dto.aboutMe.trim();
      student.aboutMe = normalizedAboutMe.length > 0 ? normalizedAboutMe : null;
    }
    if (dto.quote !== undefined) student.quote = dto.quote;
    if (dto.isAvailable !== undefined) student.isAvailable = dto.isAvailable;

    if (Array.isArray(dto.experiences)) {
      student.experiences = dto.experiences
        .map((experience: UpdateStudentExperience) => ({
          title:
            typeof experience.title === 'string' ? experience.title.trim() : '',
          description:
            typeof experience.description === 'string'
              ? experience.description.trim()
              : '',
        }))
        .filter(
          (experience: { title: string; description: string }) =>
            experience.title.length > 0 || experience.description.length > 0,
        );
    }

    if (Array.isArray(dto.expertise)) {
      student.expertise = dto.expertise
        .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item: string) => item.length > 0);
    }

    if (Array.isArray(dto.languages)) {
      student.languages = dto.languages
        .map((language: UpdateStudentLanguage) => ({
          language:
            typeof language.language === 'string'
              ? language.language.trim()
              : '',
          level:
            typeof language.level === 'string' ? language.level.trim() : '',
        }))
        .filter(
          (language: { language: string; level: string }) =>
            language.language.length > 0 || language.level.length > 0,
        );
    }

    // if (dto.universityName !== undefined) {
    //   const normalizedUniversityName = dto.universityName.trim();
    //   if (!normalizedUniversityName) {
    //     student.university = null;
    //   } else {
    //     student.university = await this.findOrCreateUniversity(
    //       normalizedUniversityName,
    //     );
    //   }
    // }

    // if (dto.majorName !== undefined) {
    //   const normalizedMajorName = dto.majorName.trim();
    //   if (!normalizedMajorName) {
    //     student.major = null;
    //   } else {
    //     student.major = await this.findOrCreateMajor(normalizedMajorName);
    //   }
    // }

    return this.studentProfileRepository.save(student);
  }

  // private async findOrCreateUniversity(name: string): Promise<University> {
  //   const existing = await this.universityRepository
  //     .createQueryBuilder('university')
  //     .where('LOWER(university.name) = LOWER(:name)', { name })
  //     .getOne();

  //   if (existing) {
  //     if (!existing.isActive) {
  //       existing.isActive = true;
  //       return this.universityRepository.save(existing);
  //     }
  //     return existing;
  //   }

  //   const created = this.universityRepository.create({ name, isActive: true });
  //   return this.universityRepository.save(created);
  // }

  private async findOrCreateMajor(name: string): Promise<Major> {
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

  async addResume(userId: string, fileUrl: string): Promise<Resume> {
    const student = await this.getStudentProfileByUserId(userId);
    console.log('Adding resume for student:', student.id);

    await this.resumeRepository
      .createQueryBuilder()
      .update(Resume)
      .set({ isDefault: false })
      .where('student_id = :studentId', { studentId: student.id })
      .andWhere('is_default = :isDefault', { isDefault: true })
      .execute();

    // Create and save the new resume
    const resume = this.resumeRepository.create({
      fileUrl,
      isDefault: true,
      studentId: student.id,
    });

    return this.resumeRepository.save(resume);
  }

  async addSkills(userId: string, dto: AddStudentSkillDto) {
    const student = await this.getStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
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

    const existingNames = new Set(
      existingSkills.map((s) => s.name.toLowerCase()),
    );
    const newSkills = normalized
      .filter((name) => !existingNames.has(name.toLowerCase()))
      .map((name) => this.skillRepository.create({ name }));

    const createdSkills =
      newSkills.length > 0 ? await this.skillRepository.save(newSkills) : [];

    const allSkills = [...existingSkills, ...createdSkills];

    const existingStudentSkills = await this.studentSkillRepository.find({
      where: { studentId: student.id },
    });

    const existingSkillIds = new Set(
      existingStudentSkills.map((s) => s.skillId),
    );

    const toInsert = allSkills
      .filter((skill) => !existingSkillIds.has(skill.id))
      .map((skill) =>
        this.studentSkillRepository.create({
          studentId: student.id,
          skillId: skill.id,
        }),
      );

    if (toInsert.length > 0) {
      await this.studentSkillRepository.save(toInsert);
    }

    return { message: 'Skills updated', added: toInsert.length };
  }

  async setSkills(
    userId: string,
    dto: SetStudentSkillDto,
  ): Promise<{ message: string; added: number; removed: number }> {
    const student = await this.getStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const normalized = Array.from(
      new Set(
        dto.skills
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
          .map((skill) => skill.toLowerCase()),
      ),
    );

    const existingStudentSkills = await this.studentSkillRepository.find({
      where: { studentId: student.id },
    });

    if (normalized.length === 0) {
      await this.studentSkillRepository.delete({ studentId: student.id });
      return {
        message: 'Skills replaced',
        added: 0,
        removed: existingStudentSkills.length,
      };
    }

    const existingSkills = await this.skillRepository
      .createQueryBuilder('skill')
      .where('LOWER(skill.name) IN (:...names)', {
        names: normalized,
      })
      .getMany();

    const skillIdByName = new Map(
      existingSkills.map((skill) => [skill.name.toLowerCase(), skill.id]),
    );

    const invalidSkills = normalized.filter((name) => !skillIdByName.has(name));
    if (invalidSkills.length > 0) {
      throw new BadRequestException(
        `Invalid skills provided: ${invalidSkills.join(', ')}`,
      );
    }

    const targetSkillIds = new Set(
      normalized
        .map((name) => skillIdByName.get(name))
        .filter((id): id is string => Boolean(id)),
    );

    const currentSkillIds = new Set(
      existingStudentSkills.map((item) => item.skillId),
    );

    const toInsert = Array.from(targetSkillIds)
      .filter((skillId) => !currentSkillIds.has(skillId))
      .map((skillId) =>
        this.studentSkillRepository.create({
          studentId: student.id,
          skillId,
        }),
      );

    const toRemove = Array.from(currentSkillIds).filter(
      (skillId) => !targetSkillIds.has(skillId),
    );

    if (toInsert.length > 0) {
      await this.studentSkillRepository.save(toInsert);
    }

    if (toRemove.length > 0) {
      await this.studentSkillRepository.delete({
        studentId: student.id,
        skillId: In(toRemove),
      });
    }

    return {
      message: 'Skills replaced',
      added: toInsert.length,
      removed: toRemove.length,
    };
  }

  async addIndustries(userId: string, dto: AddStudentIndustryDto) {
    const student = await this.getStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
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

    const existingNames = new Set(
      existingIndustries.map((i) => i.name.toLowerCase()),
    );
    const newIndustries = normalized
      .filter((name) => !existingNames.has(name.toLowerCase()))
      .map((name) => this.industryRepository.create({ name }));

    const createdIndustries =
      newIndustries.length > 0
        ? await this.industryRepository.save(newIndustries)
        : [];

    const allIndustries = [...existingIndustries, ...createdIndustries];

    const existingStudentIndustries = await this.studentIndustryRepository.find(
      {
        where: { studentId: student.id },
      },
    );

    const existingIndustryIds = new Set(
      existingStudentIndustries.map((i) => i.industryId),
    );

    const toInsert = allIndustries
      .filter((industry) => !existingIndustryIds.has(industry.id))
      .map((industry) =>
        this.studentIndustryRepository.create({
          studentId: student.id,
          industryId: industry.id,
        }),
      );

    if (toInsert.length > 0) {
      await this.studentIndustryRepository.save(toInsert);
    }

    return { message: 'Industries updated', added: toInsert.length };
  }

  async setLanguages(userId: string, dto: { languages: { language: string; level: string }[] }) {
    const student = await this.getStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const normalized = dto.languages
      .map((l) => ({
        language: (l.language ?? '').toString().trim(),
        level: (l.level ?? '').toString().trim(),
      }))
      .filter((l) => l.language.length > 0 || l.level.length > 0);

    const existingStudentLanguages: StudentLanguage[] = await this.studentProfileRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.studentLanguages', 'studentLanguage')
      .where('sp.id = :id', { id: student.id })
      .getOne()
      .then((s) => (s ? (s.studentLanguages as StudentLanguage[]) : []));

    // If no languages provided, delete all existing
    if (normalized.length === 0) {
      // delete via repository
      await this.studentProfileRepository.manager.delete('student_languages', { student_id: student.id }).catch(() => undefined);
      return { message: 'Languages replaced', added: 0, removed: existingStudentLanguages.length };
    }

    // Ensure master language records exist (create if missing)
    const names = Array.from(new Set(normalized.map((n) => n.language.toLowerCase())));
    const existingMasters = await this.studentProfileRepository.manager.getRepository('m_languages').createQueryBuilder('lang').where('LOWER(lang.name) IN (:...names)', { names }).getMany().catch(() => []);

    const existingNameToId = new Map<string, string>(existingMasters.map((m: any) => [m.name.toLowerCase(), m.id] as [string, string]));

    const toCreate = names.filter((n) => !existingNameToId.has(n)).map((n) => ({ name: n, is_active: true }));
    let created: any[] = [];
    if (toCreate.length > 0) {
      // insert and return created rows
      const insertRes = await this.studentProfileRepository.manager.getRepository('m_languages').createQueryBuilder().insert().values(toCreate).returning('*').execute().catch(() => null);
      if (insertRes && insertRes.raw) created = insertRes.raw;
    }

    // refresh master map
    const allMasters = [...existingMasters, ...created];
    allMasters.forEach((m: any) => existingNameToId.set(m.name.toLowerCase(), m.id));

    // Build target map of languageId -> level
    const target = new Map<string, string>();
    normalized.forEach((item) => {
      const id = existingNameToId.get(item.language.toLowerCase());
      if (id) target.set(id as string, item.level || '');
    });

    // current language ids
    const currentLangIds = new Set(
      existingStudentLanguages.map((sl) => sl.languageId),
    );

    const toInsert = Array.from(target.entries())
      .filter(([langId]) => !currentLangIds.has(langId))
      .map(([langId, level]) => ({ student_id: student.id, language_id: langId, level }));

    const toUpdate = Array.from(target.entries())
      .filter(([langId]) => currentLangIds.has(langId))
      .map(([langId, level]) => ({ language_id: langId, level }));

    const toRemove = Array.from(currentLangIds).filter((id) => !target.has(id));

    // perform DB ops
    if (toInsert.length > 0) {
      await this.studentProfileRepository.manager.getRepository('student_languages').createQueryBuilder().insert().values(toInsert).execute().catch(() => undefined);
    }

    if (toUpdate.length > 0) {
      // update levels for existing rows
      for (const [langId, level] of target.entries()) {
        if (currentLangIds.has(langId)) {
          await this.studentProfileRepository.manager.getRepository('student_languages').createQueryBuilder().update().set({ level }).where('student_id = :studentId AND language_id = :langId', { studentId: student.id, langId }).execute().catch(() => undefined);
        }
      }
    }

    if (toRemove.length > 0) {
      await this.studentProfileRepository.manager.getRepository('student_languages').createQueryBuilder().delete().where('student_id = :studentId AND language_id IN (:...ids)', { studentId: student.id, ids: toRemove }).execute().catch(() => undefined);
    }

    return { message: 'Languages replaced', added: toInsert.length, removed: toRemove.length };
  }

  async addEducation(userId: string, dto: any): Promise<StudentEducation> {
    const student = await this.getStudentProfileByUserId(userId);

    const education = this.studentEducationRepository.create({
      studentId: student.id,
      institutionName: dto.institutionName,
      educationLevel: dto.educationLevel ?? null,
      fieldOfStudy: dto.fieldOfStudy ?? null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
    });

    return this.studentEducationRepository.save(education);
  }

  async updateEducation(
    userId: string,
    id: string,
    dto: UpdateStudentEducationDto,
  ): Promise<StudentEducation> {
    const student = await this.getStudentProfileByUserId(userId);

    const education = await this.studentEducationRepository.findOne({
      where: { id, studentId: student.id },
    });

    if (!education) {
      throw new NotFoundException(`Education record with ID ${id} not found`);
    }

    if (dto.institutionName !== undefined) {
      education.institutionName = dto.institutionName;
    }
    if (dto.educationLevel !== undefined) {
      education.educationLevel = dto.educationLevel;
    }
    if (dto.fieldOfStudy !== undefined) {
      education.fieldOfStudy = dto.fieldOfStudy;
    }
    if (dto.startDate !== undefined) {
      education.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      education.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    return this.studentEducationRepository.save(education);
  }

  async removeEducation(userId: string, id: string): Promise<void> {
    const student = await this.getStudentProfileByUserId(userId);

    const result = await this.studentEducationRepository.delete({
      id,
      studentId: student.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID "${id}" not found`);
    }
  }
}
