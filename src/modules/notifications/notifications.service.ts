import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationStatus } from './notification-status.enum';
import { CreateNotificationDto } from './dto/CreateNotification.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

export interface ReplyRecord {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  async findAllByUserId(userId: string): Promise<Notification[]> {
    return await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      type: data.type,
      title: data.title ?? data.message,
      message: data.message,
      referenceId: data.reference_id,
      metadata: { ...data.metadata, replies: [] },
      user: { id: data.user_id } as any,
      status: NotificationStatus.PENDING,
    });

    const saved = await this.repo.save(notification);

    this.gateway.sendNotification(data.user_id, 'notification:new', saved);

    // Also create a copy for the sender if specified
    if (data.metadata?.senderId && data.metadata.senderId !== data.user_id) {
      const senderCopy = this.repo.create({
        type: data.type,
        title: `Sent: ${data.title ?? data.message}`,
        message: data.message,
        referenceId: saved.id,
        metadata: { ...data.metadata, recipientId: data.user_id, isSenderCopy: true, replies: [] },
        user: { id: data.metadata.senderId } as any,
        status: NotificationStatus.READ,
      });
      await this.repo.save(senderCopy);
    }

    return saved;
  }

  async markAllRead(userId: string): Promise<{ affected: number }> {
    const result = await this.repo.update(
      { userId, status: In([NotificationStatus.PENDING, NotificationStatus.SENT]) },
      { status: NotificationStatus.READ, readAt: new Date() },
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

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    return await this.repo.save(notification);
  }

  async findReplies(notificationId: string): Promise<ReplyRecord[]> {
    console.log('[findReplies] looking up:', notificationId);
    const notification = await this.repo.findOne({ where: { id: notificationId } });
    if (!notification) {
      console.log('[findReplies] not found:', notificationId);
      return [];
    }
    console.log('[findReplies] found, metadata:', JSON.stringify(notification.metadata));
    return notification.metadata?.replies ?? [];
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

  async reply(id: string, currentUserId: string, dto: CreateReplyDto): Promise<ReplyRecord> {
    let original = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!original) {
      const child = await this.repo.findOne({
        where: { referenceId: id },
      });
      const recipientId = child?.metadata?.recipientId as string | undefined;
      if (child && recipientId) {
        original = this.repo.create({
          id,
          userId: recipientId,
          type: child.type,
          title: child.title,
          message: child.message,
          metadata: { senderId: child.metadata?.senderId, replies: [] },
          status: NotificationStatus.PENDING,
        });
        await this.repo.save(original);
      } else {
        throw new NotFoundException('Original notification not found');
      }
    }

    const senderId = original.metadata?.senderId as string | undefined;
    const targetUserId = currentUserId === senderId ? original.user.id : (senderId || original.user.id);

    const reply: ReplyRecord = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      message: dto.message,
      createdAt: new Date().toISOString(),
    };

    const replies: ReplyRecord[] = [...(original.metadata?.replies ?? []), reply];
    await this.repo.update(original.id, { metadata: { ...original.metadata, replies } });

    this.gateway.sendNotification(targetUserId, 'reply:new', {
      notificationId: original.referenceId || original.id,
      reply,
    });

    return reply;
  }
}
