// notifications.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './entities/employer-notification.entity'
import { CreateNotificationDto } from './dto/create-employer-notification.dto'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.repo.create({
      ...dto,
      data: dto.data ? JSON.stringify(dto.data) : null,
    })
    return this.repo.save(notification)
  }

  async findAll(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  async markAsRead(id: number) {
    await this.repo.update(id, { read: true })
    return { success: true }
  }

  async markAllAsRead(userId: number) {
    await this.repo.update({ userId }, { read: true })
    return { success: true }
  }

  async remove(id: number) {
    return this.repo.delete(id)
  }
}