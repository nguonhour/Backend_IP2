import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateReplyDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
