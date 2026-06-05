import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/update-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  async findAllByUserId(userId: string): Promise<Notification[]> {
    return await this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      type: data.type,
      message: data.message,
      referenceId: data.reference_id,
      user: { id: data.user_id },
      isRead: false,
    });

    const saved = await this.repo.save(notification);

    this.gateway.sendNotification(data.user_id, 'notification:new', saved);

    return saved;
  }

  async markAllRead(userId: string): Promise<{ affected: number }> {
    const result = await this.repo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { affected: result.affected ?? 0 };
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user.id !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    notification.isRead = true;
    return await this.repo.save(notification);
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own notifications');
    }

    await this.repo.remove(notification);
  }
}
