import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/CreateNotification.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    return await this.service.findAllByUserId(req.user.id);
  }

  @Get(':id/replies')
  @UseGuards(JwtAuthGuard)
  async getReplies(@Param('id') id: string) {
    return await this.service.findReplies(id);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  async reply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.service.reply(id, req.user.id, dto);
  }

  @Get(':userId')
  async findAllByUserId(@Param('userId') userId: string) {
    return await this.service.findAllByUserId(userId);
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.service.create(dto);
  }

  @Patch('me/read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead(@Req() req: AuthenticatedRequest) {
    return await this.service.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return await this.service.markRead(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return await this.service.remove(id, req.user.id);
  }
}
