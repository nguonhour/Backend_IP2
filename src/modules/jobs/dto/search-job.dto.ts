import { Type as TransformType } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
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
