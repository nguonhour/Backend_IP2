import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { StudentSkill } from './student-skill.entity';
import { Application } from '../applications/application.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { SearchHistory } from './search-history.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => University)
  @JoinColumn({ name: 'university_id' })
  university: University;

  @ManyToOne(() => Major, { nullable: true })
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @Column({ nullable: true })
  yearOfStudy: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.student)
  studentSkills: StudentSkill[];

  @OneToMany(() => Application, (application) => application.student)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.student)
  savedJobs: SavedJob[];

  @OneToMany(() => SearchHistory, (history) => history.student)
  searchHistory: SearchHistory[];
}
