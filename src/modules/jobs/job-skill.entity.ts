import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { Skill } from '../../entities/master/skill.entity';

@Entity('job_skills')
export class JobSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.jobSkills)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => Skill, (skill) => skill.jobSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
