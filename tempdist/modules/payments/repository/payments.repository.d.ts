import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';
export declare class PaymentsRepository extends BaseRepository<Payment> {
    protected paymentRepository: Repository<Payment>;
    constructor(paymentRepository: Repository<Payment>);
    findByEmployerId(employerId: string, relations?: string[]): Promise<void | Payment[]>;
    findByStatus(status: string, relations?: string[]): Promise<void | Payment[]>;
    findByTransactionRef(transactionRef: string): Promise<void | Payment | null>;
}
