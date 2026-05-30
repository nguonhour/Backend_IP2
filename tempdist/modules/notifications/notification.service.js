"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const user_entity_1 = require("../users/user.entity");
const notification_status_enum_1 = require("./notification-status.enum");
const notification_channel_enum_1 = require("./notification-channel.enum");
let NotificationService = class NotificationService {
    notificationRepository;
    userRepository;
    constructor(notificationRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    async createNotification(userId, type, title, message, channel = notification_channel_enum_1.NotificationChannel.IN_APP, options) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
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
            status: notification_status_enum_1.NotificationStatus.PENDING,
        });
        const saved = await this.notificationRepository.save(notification);
        if (channel === notification_channel_enum_1.NotificationChannel.EMAIL ||
            channel === notification_channel_enum_1.NotificationChannel.BOTH) {
            await this.queueEmailNotification(saved);
        }
        return saved;
    }
    async createBulkNotification(userIds, type, title, message, channel = notification_channel_enum_1.NotificationChannel.IN_APP, options) {
        const users = await this.userRepository.find({
            where: { id: (0, typeorm_2.In)(userIds) },
        });
        if (users.length === 0) {
            throw new common_1.NotFoundException('No users found');
        }
        const notifications = users.map((user) => this.notificationRepository.create({
            userId: user.id,
            type,
            title,
            message,
            channel,
            content: options?.content,
            recipientEmail: user.email,
            metadata: options?.metadata,
            status: notification_status_enum_1.NotificationStatus.PENDING,
        }));
        const saved = await this.notificationRepository.save(notifications);
        if (channel === notification_channel_enum_1.NotificationChannel.EMAIL ||
            channel === notification_channel_enum_1.NotificationChannel.BOTH) {
            for (const notification of saved) {
                await this.queueEmailNotification(notification);
            }
        }
        return saved;
    }
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        let query = this.notificationRepository
            .createQueryBuilder('n')
            .where('n.userId = :userId', { userId })
            .orderBy('n.createdAt', 'DESC');
        if (unreadOnly) {
            query = query.andWhere('n.status IN (:...statuses)', {
                statuses: [notification_status_enum_1.NotificationStatus.PENDING, notification_status_enum_1.NotificationStatus.SENT],
            });
        }
        const skip = (page - 1) * limit;
        const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
        return { data, total, unreadCount: unreadOnly ? data.length : total };
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: {
                userId,
                status: (0, typeorm_2.In)([notification_status_enum_1.NotificationStatus.PENDING, notification_status_enum_1.NotificationStatus.SENT]),
            },
        });
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.status = notification_status_enum_1.NotificationStatus.READ;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }
    async markMultipleAsRead(notificationIds, userId) {
        const result = await this.notificationRepository.update({ id: (0, typeorm_2.In)(notificationIds), userId }, { status: notification_status_enum_1.NotificationStatus.READ, readAt: new Date() });
        return { affected: result.affected || 0 };
    }
    async markAllAsRead(userId) {
        const result = await this.notificationRepository.update({
            userId,
            status: (0, typeorm_2.In)([notification_status_enum_1.NotificationStatus.PENDING, notification_status_enum_1.NotificationStatus.SENT]),
        }, { status: notification_status_enum_1.NotificationStatus.READ, readAt: new Date() });
        return { affected: result.affected || 0 };
    }
    async deleteNotification(notificationId, userId) {
        const result = await this.notificationRepository.delete({
            id: notificationId,
            userId,
        });
        if (!result.affected) {
            throw new common_1.NotFoundException('Notification not found');
        }
    }
    async clearAll(userId) {
        const result = await this.notificationRepository.delete({ userId });
        return { deleted: result.affected || 0 };
    }
    async queueEmailNotification(notification) {
        console.log(`Queued email notification: ${notification.id}`);
    }
    async markAsSent(notificationId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.status = notification_status_enum_1.NotificationStatus.SENT;
        notification.sentAt = new Date();
        return this.notificationRepository.save(notification);
    }
    async markAsFailed(notificationId, error) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.status = notification_status_enum_1.NotificationStatus.FAILED;
        notification.errorMessage = error;
        return this.notificationRepository.save(notification);
    }
    async getNotificationById(notificationId, userId) {
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
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async getStats(userId) {
        const total = await this.notificationRepository.count({
            where: { userId },
        });
        const unread = await this.notificationRepository.count({
            where: {
                userId,
                status: (0, typeorm_2.In)([notification_status_enum_1.NotificationStatus.PENDING, notification_status_enum_1.NotificationStatus.SENT]),
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map