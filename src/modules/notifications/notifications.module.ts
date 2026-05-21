import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { NotificationsRepository } from './repository/notifications.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsRepository],
  exports: [NotificationsRepository],
})
export class NotificationsModule {}
