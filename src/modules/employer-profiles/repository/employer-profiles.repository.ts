import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployerProfile } from '../employer-profile.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class EmployerProfilesRepository extends BaseRepository<EmployerProfile> {
  protected employerRepository: Repository<EmployerProfile>;
  constructor(
    @InjectRepository(EmployerProfile)
    employerRepository: Repository<EmployerProfile>,
  ) {
    super(employerRepository);
    this.employerRepository = employerRepository;
  }

  async findByUserId(userId: string, relations?: string[]) {
    try {
      return await this.employerRepository.findOne({
        where: { user: { id: userId } } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByUserId', error, { userId });
    }
  }

  async findByCompanyName(companyName: string, relations?: string[]) {
    try {
      return await this.employerRepository.find({
        where: { companyName } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByCompanyName', error, { companyName });
    }
  }

  async findVerified(relations?: string[]) {
    try {
      return await this.employerRepository.find({
        where: { isVerified: true } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findVerified', error, { relations });
    }
  }
}
