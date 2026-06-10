import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';

@Entity('m_universities')
export class University {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // @OneToMany(() => StudentProfile, (profile) => profile.university)
  // students: StudentProfile[];
}
