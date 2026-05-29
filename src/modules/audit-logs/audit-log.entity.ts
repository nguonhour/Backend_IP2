import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUSPEND = 'SUSPEND',
  VERIFY = 'VERIFY',
  APPLY = 'APPLY',
  PAY = 'PAY',
  REPORT = 'REPORT',
  LOGIN = 'LOGIN',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({
    name: 'action',
    type: 'varchar',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ name: 'module', type: 'varchar' })
  module: string; // 'jobs', 'applications', 'payments', 'users', etc.

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string; // ID of affected entity

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType: string; // 'Job', 'Application', 'Payment', etc.

  @Column({
    name: 'old_data',
    type: 'jsonb',
    nullable: true,
  })
  oldData: Record<string, any>;

  @Column({
    name: 'new_data',
    type: 'jsonb',
    nullable: true,
  })
  newData: Record<string, any>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
