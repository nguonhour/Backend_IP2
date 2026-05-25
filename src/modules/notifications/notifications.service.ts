import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
      user: { id: data.user_id },
      type: data.type,
      referenceId: data.reference_id,
      message: data.message,
      isRead: false,
    });

    return await this.repo.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user.id !== userId) {
      throw new ForbiddenException('Cannot update this notification');
    }

    notification.isRead = true;
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ user: { id: userId } }, { isRead: true });
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
      throw new ForbiddenException('Cannot delete this notification');
    }

    await this.repo.delete({ id });
  }
}
