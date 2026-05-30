import { Repository } from 'typeorm';
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
export declare class StudentProfilesService {
    private studentProfileRepository;
    private savedJobRepository;
    private jobRepository;
    private resumeRepository;
    private universityRepository;
    private majorRepository;
    private userRepository;
    private skillRepository;
    private studentSkillRepository;
    private industryRepository;
    private studentIndustryRepository;
    constructor(studentProfileRepository: Repository<StudentProfile>, savedJobRepository: Repository<SavedJob>, jobRepository: Repository<Job>, resumeRepository: Repository<Resume>, universityRepository: Repository<University>, majorRepository: Repository<Major>, userRepository: Repository<User>, skillRepository: Repository<Skill>, studentSkillRepository: Repository<StudentSkill>, industryRepository: Repository<Industry>, studentIndustryRepository: Repository<StudentIndustry>);
    saveJob(userId: string, jobId: string): Promise<SavedJob>;
    getSavedJobs(userId: string): Promise<Job[]>;
    removeSavedJob(userId: string, jobId: string): Promise<{
        message: string;
    }>;
    private getStudentProfileByUserId;
    private isUniqueViolation;
    getProfile(userId: string): Promise<StudentProfile | null>;
    getProfileById(studentId: string): Promise<StudentProfile | null>;
    updateProfile(userId: string, dto: Partial<{
        firstName: string;
        lastName: string;
        avatarUrl: string;
        yearOfStudy: number;
        universityName: string;
        majorName: string;
    }>): Promise<StudentProfile>;
    private findOrCreateUniversity;
    private findOrCreateMajor;
    addResume(userId: string, fileUrl: string): Promise<Resume>;
    addSkills(userId: string, dto: AddStudentSkillDto): Promise<{
        message: string;
        added?: undefined;
    } | {
        message: string;
        added: number;
    }>;
    addIndustries(userId: string, dto: AddStudentIndustryDto): Promise<{
        message: string;
        added?: undefined;
    } | {
        message: string;
        added: number;
    }>;
}
