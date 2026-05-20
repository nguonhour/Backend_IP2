import { IsEnum, MaxLength } from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @MaxLength(50)
  status: PaymentStatus;
}
