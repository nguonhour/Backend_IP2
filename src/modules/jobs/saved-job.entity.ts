import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { StudentProfile } from '../student-profiles/student-profile.entity';
import { Job } from './job.entity';

@Unique('UQ_saved_jobs_student_job', ['student', 'job'])
@Entity('saved_jobs')
export class SavedJob {
  @PrimaryColumn({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => StudentProfile, (student) => student.savedJobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @ManyToOne(() => Job, (job) => job.savedBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
