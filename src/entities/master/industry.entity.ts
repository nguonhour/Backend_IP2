import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
import { StudentIndustry } from '../../modules/student-profiles/student-industry.entity';

@Entity('m_industries')
export class Industry {
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

  @OneToMany(() => EmployerProfile, (profile) => profile.industry)
  employers: EmployerProfile[];

  @OneToMany(() => StudentIndustry, (studentIndustry) => studentIndustry.industry)
  studentIndustries: StudentIndustry[];
}
