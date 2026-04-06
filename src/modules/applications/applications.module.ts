import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatusHistory } from './application-status-history.entity';
import { Application } from './application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationStatusHistory, Application])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
