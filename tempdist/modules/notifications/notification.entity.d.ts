import { User } from '../users/user.entity';
import { NotificationType } from './notification-type.enum';
import { NotificationStatus } from './notification-status.enum';
import { NotificationChannel } from './notification-channel.enum';
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    title: string;
    message: string;
    content: string;
    metadata: Record<string, any>;
    referenceId: string;
    recipientEmail: string;
    readAt: Date | null;
    sentAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}
