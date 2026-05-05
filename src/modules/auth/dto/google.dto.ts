import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsOptional()
  @IsIn(['STUDENT', 'EMPLOYER'])
  role?: string;
}
