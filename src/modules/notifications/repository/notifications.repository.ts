import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notification.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class NotificationsRepository extends BaseRepository<Notification> {
  protected notificationRepository: Repository<Notification>;
  constructor(
    @InjectRepository(Notification)
    notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository);
    this.notificationRepository = notificationRepository;
  }

  async findByUserId(userId: string, relations?: string[]) {
    try {
      return await this.notificationRepository.find({
        where: { user: { id: userId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByUserId', error, { userId });
    }
  }

  async findUnread(userId: string, relations?: string[]) {
    try {
      return await this.notificationRepository.find({
        where: { user: { id: userId }, isRead: false } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findUnread', error, { userId });
    }
  }

  async markAsRead(id: string) {
    try {
      return await this.notificationRepository.update({ id } as any, {
        isRead: true,
      });
    } catch (error) {
      return this.handleError('markAsRead', error, { id });
    }
  }

  async markAllAsRead(userId: string) {
    try {
      return await this.notificationRepository.update(
        { user: { id: userId } } as any,
        { isRead: true },
      );
    } catch (error) {
      return this.handleError('markAllAsRead', error, { userId });
    }
  }
}
