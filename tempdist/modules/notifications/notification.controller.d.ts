import { NotificationService } from './notification.service';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import { MarkMultipleNotificationsReadDto } from './dto/notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: AuthenticatedRequest, page?: string, limit?: string, unreadOnly?: string): Promise<{
        data: import("./notification.entity").Notification[];
        total: number;
        unreadCount: number;
    }>;
    getUnreadCount(req: AuthenticatedRequest): Promise<{
        unreadCount: number;
    }>;
    getStats(req: AuthenticatedRequest): Promise<{
        total: number;
        unread: number;
        byType: any[];
    }>;
    getNotification(notificationId: string, req: AuthenticatedRequest): Promise<import("./notification.entity").Notification>;
    markAsRead(notificationId: string, req: AuthenticatedRequest): Promise<import("./notification.entity").Notification>;
    markMultipleAsRead(dto: MarkMultipleNotificationsReadDto, req: AuthenticatedRequest): Promise<{
        affected: number;
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<{
        affected: number;
    }>;
    deleteNotification(notificationId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    clearAll(req: AuthenticatedRequest): Promise<{
        deleted: number;
    }>;
}
