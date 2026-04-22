import { Module } from '@nestjs/common';
import { NotificationsService } from './employer-notification.service';
import { NotificationsController } from './employer-notification.controller';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class EmployerNotificationModule {}
