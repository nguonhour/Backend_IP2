import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Application } from '../../modules/applications/application.entity';

@Entity('m_application_status')
export class ApplicationStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Application, (application) => application.currentStatus)
  applications: Application[];
}
