import { Type as TransformType } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "../../../entities/master";



export class JobSearchDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(Type)
  type?: Type;

  @IsOptional()
  @TransformType(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;
}