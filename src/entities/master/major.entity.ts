import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';

@Entity('m_majors')
export class Major {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => StudentProfile, (profile) => profile.major)
  students: StudentProfile[];
}
