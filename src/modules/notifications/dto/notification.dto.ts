import { IsUUID, IsEnum, MinLength, MaxLength } from 'class-validator';
import { NotificationChannel } from '../notification-channel.enum';

export class MarkNotificationAsReadDto {
  @IsUUID()
  notificationId: string;
}

export class MarkMultipleNotificationsReadDto {
  @IsUUID('4', { each: true })
  notificationIds: string[];
}

export class DeleteNotificationDto {
  @IsUUID()
  notificationId: string;
}
