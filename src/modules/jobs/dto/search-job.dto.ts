import { Transform, Type as TransformType } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TypeJob } from '../../../entities/master';
import { Type } from 'class-transformer';

export class JobSearchDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  // @IsOptional()
  // @IsString()
  // industry?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  blocked?: boolean;

  @IsOptional()
  @IsEnum(TypeJob)
  type?: TypeJob;

  @IsOptional()
  @TransformType(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  deadlineSort?: 'asc' | 'desc';
}
