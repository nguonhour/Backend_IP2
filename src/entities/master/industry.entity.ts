import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';

@Entity('m_industries')
export class Industry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => EmployerProfile, (profile) => profile.industry)
  employers: EmployerProfile[];
}
