import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  controllers: [],
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
