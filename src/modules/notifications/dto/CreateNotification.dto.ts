import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  reference_id: string;

  @IsString()
  user_id: string;
}