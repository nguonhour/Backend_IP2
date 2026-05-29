import { IsUUID, IsEnum, IsString, IsOptional } from 'class-validator';
import { UserStatus } from '../../users/user-status.enum';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateUserRoleDto {
  @IsUUID()
  roleId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SuspendUserDto {
  @IsString()
  reason: string;
}

export class AdminGetUsersDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  search?: string;

  page: number = 1;
  limit: number = 10;
}
