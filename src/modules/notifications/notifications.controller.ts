import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMine(@Request() req: AuthenticatedRequest) {
    return this.service.findAllByUserId(req.user.id);
  }

  @Get(':userId')
  async findAllByUserId(@Param('userId') userId: string) {
    return await this.service.findAllByUserId(userId);
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/read-all')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    await this.service.markAllAsRead(req.user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.service.markAsRead(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.service.remove(id, req.user.id);
    return { success: true };
  }
}
