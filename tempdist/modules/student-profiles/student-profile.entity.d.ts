import { User } from '../users/user.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { StudentSkill } from './student-skill.entity';
import { Application } from '../applications/application.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { SearchHistory } from './search-history.entity';
import { StudentIndustry } from './student-industry.entity';
export declare class StudentProfile {
    id: string;
    user: User | null;
    get email(): string | null;
    externalUserId: string | null;
    firstName: string;
    lastName: string;
    university: University | null;
    major: Major | null;
    yearOfStudy: number;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
    studentSkills: StudentSkill[];
    studentIndustries: StudentIndustry[];
    applications: Application[];
    savedJobs: SavedJob[];
    searchHistory: SearchHistory[];
}
