import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Job } from '../../modules/jobs/job.entity';

@Entity('m_job_types')
export class JobType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Job, (job) => job.jobType)
  jobs: Job[];
}
