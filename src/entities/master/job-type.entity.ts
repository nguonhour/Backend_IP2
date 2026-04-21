import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Job } from '../../modules/jobs/job.entity';
export enum Type {
  OnSite = 'On-site',
  Remote = 'Remote',
  Hybrid = 'Hybrid',
}

@Entity('m_job_types')
export class JobType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Type,
    nullable: true,
  })
  name: Type;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Job, (job) => job.jobType)
  jobs: Job[];
}
