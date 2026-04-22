import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  userId!: number

  @Column()
  type!: string

  @Column({ nullable: true })
  title?: string | null

  @Column()
  message!: string

  @Column({ default: false })
  read!: boolean

  @Column({ nullable: true })
  data?: string | null

  @CreateDateColumn()
  createdAt!: Date
}