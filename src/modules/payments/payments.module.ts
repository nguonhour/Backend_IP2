import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { EmployerProfile } from '../employer-profiles/employer-profile.entity';
import { PaymentsRepository } from './repository/payments.repository';
import { AuthModule } from '../auth/auth.module';
import { SystemSetting } from '../admin/system-settings/system-setting.entity';
import { PaymentPolicyService } from './services/payment-policy.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Payment, EmployerProfile, SystemSetting]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, PaymentPolicyService],
  exports: [PaymentsRepository],
})
export class PaymentsModule {}
