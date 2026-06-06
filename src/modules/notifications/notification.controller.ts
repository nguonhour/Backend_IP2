import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
import {
  // MarkNotificationAsReadDto,
  MarkMultipleNotificationsReadDto,
  // DeleteNotificationDto,
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get user's notifications with pagination
   */
  @Get()
  async getNotifications(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getUserNotifications(
      req.user.id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      unreadOnly === 'true',
    );
  }

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  /**
   * Get notification statistics
   */
  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.notificationService.getStats(req.user.id);
  }

  /**
   * Get single notification by ID
   */
  @Get(':id')
  async getNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.notificationService.getNotificationById(
      notificationId,
      req.user.id,
    );
  }

  /**
   * Mark single notification as read
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.notificationService.markAsRead(notificationId, req.user.id);
  }

  /**
   * Mark multiple notifications as read
   */
  @Post('bulk/read')
  async markMultipleAsRead(
    @Body() dto: MarkMultipleNotificationsReadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.notificationService.markMultipleAsRead(
      dto.notificationIds,
      req.user.id,
    );
  }

  /**
   * Mark all notifications as read
   */
  @Post('read-all')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  /**
   * Delete single notification
   */
  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.notificationService.deleteNotification(
      notificationId,
      req.user.id,
    );
    return { message: 'Notification deleted' };
  }

  /**
   * Clear all notifications
   */
  @Post('clear-all')
  async clearAll(@Request() req: AuthenticatedRequest) {
    return this.notificationService.clearAll(req.user.id);
  }
}
