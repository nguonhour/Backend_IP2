import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async findAllByUserId(userId: string): Promise<Notification[]> {
    return await this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      ...data,
      isRead: false,
    });

    return await this.repo.save(notification);
  }
}