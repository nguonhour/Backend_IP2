import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
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
import { AddStudentIndustryDto } from './dto/add-student-industry.dto';
import { StudentIndustry } from './student-industry.entity';

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
    @InjectRepository(University)
    private universityRepository: Repository<University>,
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
    private studentIndustryRepository: Repository<StudentIndustry>
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
    let student = await this.studentProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    // Auto-create profile if it doesn't exist (for CV saves without prior profile creation)
    if (!student) {
      try {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });
        if (!user) {
          throw new NotFoundException(`User not found for id ${userId}`);
        }

        // Only auto-create a StudentProfile if the user's role is STUDENT
        if (!user.role || (user.role.name ?? '').toUpperCase() !== 'STUDENT') {
          throw new NotFoundException(`Student profile not found for user ${userId}`);
        }

        const profile = new StudentProfile();
        profile.firstName = 'Student';
        profile.lastName = '';
        profile.user = user;

        student = await this.studentProfileRepository.save(profile);
        console.log('Auto-created StudentProfile:', student.id);
      } catch (err) {
        console.error('Failed to auto-create StudentProfile:', err);
        throw new NotFoundException(`Student profile not found for user ${userId}`);
      }
    }

    return student;
  }

  async getProfile(userId: string): Promise<StudentProfile | null> {
    const student = await this.getStudentProfileByUserId(userId);

    const profile = await this.studentProfileRepository.findOne({
      where: { id: student.id },
      relations: ['user', 'university', 'major', 'studentSkills', 'studentIndustries'],
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
    dto: Partial<{
      firstName: string;
      lastName: string;
      avatarUrl: string;
      yearOfStudy: number;
      universityName: string;
      majorName: string;
    }>,
  ): Promise<StudentProfile> {
    const student = await this.getStudentProfileByUserId(userId);

    if (dto.firstName !== undefined) student.firstName = dto.firstName;
    if (dto.lastName !== undefined) student.lastName = dto.lastName;
    if (dto.avatarUrl !== undefined) student.avatarUrl = dto.avatarUrl;
    if (dto.yearOfStudy !== undefined) student.yearOfStudy = dto.yearOfStudy;

    if (dto.universityName !== undefined) {
      const normalizedUniversityName = dto.universityName.trim();
      if (!normalizedUniversityName) {
        student.university = null;
      } else {
        student.university = await this.findOrCreateUniversity(
          normalizedUniversityName,
        );
      }
    }

    if (dto.majorName !== undefined) {
      const normalizedMajorName = dto.majorName.trim();
      if (!normalizedMajorName) {
        student.major = null;
      } else {
        student.major = await this.findOrCreateMajor(normalizedMajorName);
      }
    }

    return this.studentProfileRepository.save(student);
  }

  private async findOrCreateUniversity(name: string): Promise<University> {
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

    // Mark any existing default resumes as non-default using QueryBuilder
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
    if(!student) {
      throw new NotFoundException('Student profile not found');
    }

    const normalized = dto.skills
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)

    if (normalized.length === 0) {
      return { message: 'No skills provided' }
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

    const createdSkills = newSkills.length > 0
      ? await this.skillRepository.save(newSkills)
      : [];

    const allSkills = [...existingSkills, ...createdSkills];

    const existingStudentSkills = await this.studentSkillRepository.find({
      where: { studentId: student.id },
    });

    const existingSkillIds = new Set(existingStudentSkills.map((s) => s.skillId));

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

    const createdIndustries = newIndustries.length > 0
      ? await this.industryRepository.save(newIndustries)
      : [];

    const allIndustries = [...existingIndustries, ...createdIndustries];

    const existingStudentIndustries = await this.studentIndustryRepository.find({
      where: { studentId: student.id },
    });

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
}
