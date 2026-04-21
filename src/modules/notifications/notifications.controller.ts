import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.service.create(dto);
  }
}