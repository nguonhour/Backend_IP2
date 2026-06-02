import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentProfilesService } from './student-profiles.service';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { AddStudentSkillDto } from './dto/add-student-skill.dto';
import { AddStudentIndustryDto } from './dto/add-student-industry.dto';
export declare class StudentProfilesController {
    private readonly studentProfilesService;
    constructor(studentProfilesService: StudentProfilesService);
    saveJob(req: AuthenticatedRequest, jobId: string): Promise<import("../jobs/saved-job.entity").SavedJob>;
    getSavedJobs(req: AuthenticatedRequest): Promise<import("../jobs/job.entity").Job[]>;
    getProfile(req: AuthenticatedRequest): Promise<import("./student-profile.entity").StudentProfile | null>;
    getProfileById(studentId: string): Promise<import("./student-profile.entity").StudentProfile | null>;
    updateProfile(req: AuthenticatedRequest, dto: UpdateStudentDto): Promise<import("./student-profile.entity").StudentProfile>;
    addResume(req: AuthenticatedRequest, body: {
        fileUrl: string;
    }): Promise<import("../resumes/resume.entity").Resume>;
    addSkills(req: AuthenticatedRequest, dto: AddStudentSkillDto): Promise<{
        message: string;
        added?: undefined;
    } | {
        message: string;
        added: number;
    }>;
    addIndustries(req: AuthenticatedRequest, dto: AddStudentIndustryDto): Promise<{
        message: string;
        added?: undefined;
    } | {
        message: string;
        added: number;
    }>;
    removeSavedJob(req: AuthenticatedRequest, jobId: string): Promise<{
        message: string;
    }>;
}
