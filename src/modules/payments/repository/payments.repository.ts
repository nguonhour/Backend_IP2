import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class PaymentsRepository extends BaseRepository<Payment> {
  protected paymentRepository: Repository<Payment>;
  constructor(
    @InjectRepository(Payment)
    paymentRepository: Repository<Payment>,
  ) {
    super(paymentRepository);
    this.paymentRepository = paymentRepository;
  }

  async findByEmployerId(employerId: string, relations?: string[]) {
    try {
      return await this.paymentRepository.find({
        where: { employer: { id: employerId } } as any,
        relations,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      return this.handleError('findByEmployerId', error, { employerId });
    }
  }

  async findByStatus(status: string, relations?: string[]) {
    try {
      return await this.paymentRepository.find({
        where: { status } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findByStatus', error, { status });
    }
  }

  async findByTransactionRef(transactionRef: string) {
    try {
      return await this.paymentRepository.findOne({
        where: { transactionRef } as any,
      });
    } catch (error) {
      return this.handleError('findByTransactionRef', error, {
        transactionRef,
      });
    }
  }
}
