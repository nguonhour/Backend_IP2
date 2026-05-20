import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const PAYMENT_OPTIONS = [
  'cards',
  'abapay_khqr',
  'abapay_khqr_deeplink',
  'google_pay',
] as const;

export class CreateCheckoutDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  transactionId?: string;

  @IsOptional()
  @IsString()
  items?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  planName?: string;

  @IsOptional()
  @IsIn(['USD', 'KHR'])
  currency?: 'USD' | 'KHR';

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @IsOptional()
  @IsString()
  continueSuccessUrl?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(PAYMENT_OPTIONS)
  paymentOption?: (typeof PAYMENT_OPTIONS)[number];
}
