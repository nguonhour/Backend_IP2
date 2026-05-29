import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../enum/payment-status.enum';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @MaxLength(50)
  status: PaymentStatus;
}

export class AdminUpdatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

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
  expiresAt?: string | null;

  @IsUUID()
  @IsOptional()
  employerId?: string | null;
}
