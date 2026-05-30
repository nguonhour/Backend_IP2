import { StudentSkill } from '../../modules/student-profiles/student-skill.entity';
import { JobSkill } from '../../modules/jobs/job-skill.entity';
export declare class Skill {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    studentSkills: StudentSkill[];
    jobSkills: JobSkill[];
}
