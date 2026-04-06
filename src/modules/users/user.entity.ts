import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../entities/master/role.entity';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
import { Resume } from '../resumes/resume.entity';
import { Notification } from '../notifications/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  authProvider: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @Column({ nullable: true })
  isVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => StudentProfile, (profile) => profile.user)
  studentProfile: StudentProfile;

  @OneToOne(() => EmployerProfile, (profile) => profile.user)
  employerProfile: EmployerProfile;

  @OneToMany(() => Resume, (resume) => resume.user)
  resumes: Resume[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
