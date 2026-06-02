import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationType } from './notification-type.enum';
import { NotificationChannel } from './notification-channel.enum';
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    createNotification(userId: string, type: NotificationType, title: string, message: string, channel?: NotificationChannel, options?: {
        content?: string;
        referenceId?: string;
        recipientEmail?: string;
        metadata?: Record<string, any>;
    }): Promise<Notification>;
    createBulkNotification(userIds: string[], type: NotificationType, title: string, message: string, channel?: NotificationChannel, options?: {
        content?: string;
        metadata?: Record<string, any>;
    }): Promise<Notification[]>;
    getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: Notification[];
        total: number;
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markMultipleAsRead(notificationIds: string[], userId: string): Promise<{
        affected: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        affected: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    clearAll(userId: string): Promise<{
        deleted: number;
    }>;
    private queueEmailNotification;
    markAsSent(notificationId: string): Promise<Notification>;
    markAsFailed(notificationId: string, error: string): Promise<Notification>;
    getNotificationById(notificationId: string, userId?: string): Promise<Notification>;
    getStats(userId: string): Promise<{
        total: number;
        unread: number;
        byType: any[];
    }>;
}
