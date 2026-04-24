import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get(':userId')
  async findAllByUserId(@Body('userId') userId: string) {
    return await this.service.findAllByUserId(userId);
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.service.create(dto);
  }
}
