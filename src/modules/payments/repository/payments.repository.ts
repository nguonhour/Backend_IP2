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

  // const payment = await this.paymentsRepository.findOne({
  //     where: { transactionId: payload.tran_id },
  //   });
  async findOne(options: Parameters<Repository<Payment>['findOne']>[0]) {
    try {
      return await this.paymentRepository.findOne(options);
    } catch (error) {
      return this.handleError('findOne', error, { options });
    }
  }

  async find(options: Parameters<Repository<Payment>['find']>[0]) {
    try {
      return await this.paymentRepository.find(options);
    } catch (error) {
      return this.handleError('find', error, { options });
    }
  }

  async update(id: string | number, data: Partial<Payment>) {
    try {
      await this.paymentRepository.update(id, data);
      return await this.paymentRepository.findOne({ where: { id } as any });
    } catch (error) {
      return this.handleError('update', error, { id, data });
    }
  }

  async save(entity: Payment) {
    try {
      return await this.paymentRepository.save(entity);
    } catch (error) {
      return this.handleError('save', error, { entity });
    }
  }

  async findAll(relations?: string[]) {
    try {
      return await this.paymentRepository.find({ relations });
    } catch (error) {
      return this.handleError('findAll', error, { relations });
    }
  }

  // async findAll(relations?: string[]) {
  //   try {
  //     return await this.paymentRepository.find({
  //       relations,
  //       order: { createdAt: 'DESC' },
  //     });
  //   } catch (error) {
  //     return this.handleError('findAll', error);
  //   }
  // }

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
