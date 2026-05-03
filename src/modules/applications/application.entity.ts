  import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Unique,
  } from 'typeorm';
  import { Job } from '../jobs/job.entity';
  import { StudentProfile } from '../student-profiles/student-profile.entity';
  import { Resume } from '../resumes/resume.entity';
  import { ApplicationStatus } from '../../entities/master/application-status.entity';
  import { ApplicationStatusHistory } from './application-status-history.entity';

  @Unique('UQ_applications_student_job', ['job', 'student'])
  @Entity('applications')
  export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

  @ManyToOne(() => Job, (job) => job.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => StudentProfile, (student) => student.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

    @ManyToOne(() => Resume, { nullable: true })
    @JoinColumn({ name: 'resume_id' })
    resume: Resume;

    @ManyToOne(() => ApplicationStatus)
    @JoinColumn({ name: 'current_status_id' })
    currentStatus: ApplicationStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    appliedAt: Date;

    @OneToMany(() => ApplicationStatusHistory, (history) => history.application)
    statusHistory: ApplicationStatusHistory[];
  }
