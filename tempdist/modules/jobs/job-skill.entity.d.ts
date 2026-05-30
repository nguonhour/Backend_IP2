import { Job } from './job.entity';
import { Skill } from '../../entities/master/skill.entity';
export declare class JobSkill {
    jobId: string;
    skillId: string;
    job: Job;
    skill: Skill;
}
