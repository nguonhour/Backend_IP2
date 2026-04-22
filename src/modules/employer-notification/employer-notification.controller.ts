// notifications.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common'
import { NotificationsService } from './employer-notification.service'
import { CreateNotificationDto } from './dto/create-employer-notification.dto'

@Controller('employer-notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  // GET /notifications?userId=1
  @Get()
  getAll(@Query('userId') userId: number) {
    return this.service.findAll(userId)
  }

  // POST /notifications
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    console.log(dto)
    return this.service.create(dto)
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  markRead(@Param('id') id: number) {
    return this.service.markAsRead(id)
  }

  // PATCH /notifications/read-all
  @Patch('read-all')
  markAll(@Body('userId') userId: number) {
    return this.service.markAllAsRead(userId)
  }

  // DELETE /notifications/:id
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id)
  }
}