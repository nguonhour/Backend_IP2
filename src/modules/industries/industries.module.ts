import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Industry } from '../../entities/master/industry.entity';
import { IndustriesController } from './industries.controller';
import { IndustriesService } from './industries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
