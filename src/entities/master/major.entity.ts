import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';

@Entity('m_majors')
export class Major {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StudentProfile, (profile) => profile.major)
  students: StudentProfile[];
}
