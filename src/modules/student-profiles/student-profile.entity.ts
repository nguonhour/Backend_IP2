import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { University } from '../../entities/master/university.entity';
import { Major } from '../../entities/master/major.entity';
import { StudentSkill } from './student-skill.entity';
import { StudentLanguage } from './student-language.entity';
import { Application } from '../applications/application.entity';
import { SavedJob } from '../jobs/saved-job.entity';
import { SearchHistory } from './search-history.entity';
// import { Resume } from '../resumes/resume.entity';
import { Exclude, Expose } from 'class-transformer';
import { StudentIndustry } from './student-industry.entity';
import { Report } from '../reports/report.entity';
import { StudentEducation } from './student-education.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Expose()
  get email(): string | null {
    return this.user?.email ?? null;
  }

  @Column({
    name: 'external_user_id',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  externalUserId: string | null;

  @Column({ name: 'first_name', type: 'varchar', nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: false })
  lastName: string;

  // @ManyToOne(() => University, { nullable: true })
  // @JoinColumn({ name: 'university_id' })
  // university: University | null;

  @ManyToOne(() => Major, { nullable: true })
  @JoinColumn({ name: 'major_id' })
  major: Major | null;

  // @Column({ name: 'year_of_study', type: 'int', nullable: true })
  // yearOfStudy: number;

  @Column({ name: 'quote', type: 'text', nullable: true })
  quote: string | null;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ name: 'about_me', type: 'text', nullable: true })
  aboutMe: string | null;

  @Column({ name: 'experiences', type: 'jsonb', nullable: true, default: [] })
  experiences: Array<{ title: string; description: string }> | null;

  @Column({ name: 'expertise', type: 'jsonb', nullable: true, default: [] })
  expertise: string[] | null;

  @Column({ name: 'languages', type: 'jsonb', nullable: true, default: [] })
  languages: Array<{ language: string; level: string }> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => StudentSkill, (studentSkill) => studentSkill.student)
  studentSkills: StudentSkill[];

  @OneToMany(() => StudentEducation, (education) => education.student)
  educations: StudentEducation[];

  @OneToMany(
    () => StudentLanguage,
    (studentLanguage) => studentLanguage.student,
  )
  studentLanguages: StudentLanguage[];

  @OneToMany(
    () => StudentIndustry,
    (studentIndustry) => studentIndustry.student,
  )
  studentIndustries: StudentIndustry[];

  @OneToMany(() => Application, (application) => application.student)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.student)
  savedJobs: SavedJob[];

  @OneToMany(() => SearchHistory, (history) => history.student)
  searchHistory: SearchHistory[];
}
