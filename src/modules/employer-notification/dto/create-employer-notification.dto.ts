import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator'

export class CreateNotificationDto {
  @IsInt()
  userId!: number

  @IsString()
  type!: string

  @IsOptional()
  @IsString()
  title?: string

  @IsString()
  message!: string

  @IsOptional()
  @IsBoolean()
  read?: boolean

  @IsOptional()
  data?: any
}