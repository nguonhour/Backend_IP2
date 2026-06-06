import {
  Injectable,
  // BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationType } from './notification-type.enum';
import { NotificationStatus } from './notification-status.enum';
import { NotificationChannel } from './notification-channel.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create and send a notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    channel: NotificationChannel = NotificationChannel.IN_APP,
    options?: {
      content?: string;
      referenceId?: string;
      recipientEmail?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      channel,
      content: options?.content,
      referenceId: options?.referenceId,
      recipientEmail: options?.recipientEmail || user.email,
      metadata: options?.metadata,
      status: NotificationStatus.PENDING,
    });

    const saved = await this.notificationRepository.save(notification);

    // TODO: Queue for email sending if channel is EMAIL or BOTH
    if (
      channel === NotificationChannel.EMAIL ||
      channel === NotificationChannel.BOTH
    ) {
      // This would typically queue the email in a job queue (Bull, RabbitMQ, etc.)
      // For now, we're just marking it as pending
      await this.queueEmailNotification(saved);
    }

    return saved;
  }

  /**
   * Send notification to multiple users
   */
  async createBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    channel: NotificationChannel = NotificationChannel.IN_APP,
    options?: {
      content?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<Notification[]> {
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    const notifications = users.map((user) =>
      this.notificationRepository.create({
        userId: user.id,
        type,
        title,
        message,
        channel,
        content: options?.content,
        recipientEmail: user.email,
        metadata: options?.metadata,
        status: NotificationStatus.PENDING,
      }),
    );

    const saved = await this.notificationRepository.save(notifications);

    // Queue email notifications if needed
    if (
      channel === NotificationChannel.EMAIL ||
      channel === NotificationChannel.BOTH
    ) {
      for (const notification of saved) {
        await this.queueEmailNotification(notification);
      }
    }

    return saved;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ) {
    let query = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC');

    if (unreadOnly) {
      query = query.andWhere('n.status IN (:...statuses)', {
        statuses: [NotificationStatus.PENDING, NotificationStatus.SENT],
      });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { data, total, unreadCount: unreadOnly ? data.length : total };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: In([NotificationStatus.PENDING, NotificationStatus.SENT]),
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[], userId: string) {
    const result = await this.notificationRepository.update(
      { id: In(notificationIds), userId },
      { status: NotificationStatus.READ, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.update(
      {
        userId,
        status: In([NotificationStatus.PENDING, NotificationStatus.SENT]),
      },
      { status: NotificationStatus.READ, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  /**
   * Clear all notifications for user
   */
  async clearAll(userId: string) {
    const result = await this.notificationRepository.delete({ userId });
    return { deleted: result.affected || 0 };
  }

  /**
   * Queue email notification for sending (placeholder for actual email queue)
   */
  private async queueEmailNotification(
    notification: Notification,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log(`Queued email notification: ${notification.id}`);
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();

    return this.notificationRepository.save(notification);
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(
    notificationId: string,
    error: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.FAILED;
    notification.errorMessage = error;

    return this.notificationRepository.save(notification);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    notificationId: string,
    userId?: string,
  ): Promise<Notification> {
    let query = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.id = :id', {
        id: notificationId,
      });

    if (userId) {
      query = query.andWhere('n.userId = :userId', { userId });
    }

    const notification = await query.getOne();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Get notification statistics for user
   */
  async getStats(userId: string) {
    const total = await this.notificationRepository.count({
      where: { userId },
    });
    const unread = await this.notificationRepository.count({
      where: {
        userId,
        status: In([NotificationStatus.PENDING, NotificationStatus.SENT]),
      },
    });
    const byType = await this.notificationRepository
      .createQueryBuilder('n')
      .select('n.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('n.userId = :userId', { userId })
      .groupBy('n.type')
      .getRawMany();

    return { total, unread, byType };
  }
}
