import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationsController } from './employer-notification.controller'
import { NotificationsService } from './employer-notification.service'
import { Notification } from './entities/employer-notification.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class EmployerNotificationModule {}