import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  IsUUID,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../enum/payment-status.enum';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  @MaxLength(50)
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  transactionRef?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  planName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  planType?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  jobPostLimit?: number;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsUUID()
  @IsOptional()
  employerId?: string;
}
