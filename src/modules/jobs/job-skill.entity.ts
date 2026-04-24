import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from './job.entity';
import { Skill } from '../../entities/master/skill.entity';

@Entity('job_skills')
export class JobSkill {
  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Job, (job) => job.jobSkills)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => Skill, (skill) => skill.jobSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
