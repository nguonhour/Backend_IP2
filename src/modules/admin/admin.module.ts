import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { Payment } from '../payments/payment.entity';
import { Report } from '../reports/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Job, Application, Payment, Report]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
