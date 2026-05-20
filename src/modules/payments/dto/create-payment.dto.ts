import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class CreatePaymentDto {
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
}
