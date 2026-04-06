import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';

@Entity('application_status_history')
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, (application) => application.statusHistory)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column()
  statusId: string;

  @Column({ nullable: true })
  changedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;
}
