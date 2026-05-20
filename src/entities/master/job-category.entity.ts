import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from '../../modules/jobs/job.entity';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';

@Entity('m_job_categories')
export class JobCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ManyToOne(() => EmployerProfile, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employer_id' })
  employer: EmployerProfile | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Job, (job) => job.category)
  jobs: Job[];
}
