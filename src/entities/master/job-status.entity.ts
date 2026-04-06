import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Job } from '../../modules/jobs/job.entity';

@Entity('m_job_statuses')
export class JobStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Job, (job) => job.status)
  jobs: Job[];
}
