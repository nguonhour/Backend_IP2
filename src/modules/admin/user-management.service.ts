import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { UserStatus } from '../../modules/users/user-status.enum';
import { AuditService } from '../audit-logs/audit.service';
import { AuditAction } from '../audit-logs/audit-log.entity';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  /**
   * Get all users with optional filters
   */
  async getUsers(
    status?: UserStatus,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user');

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (search) {
      query.andWhere('(user.email ILIKE :search OR user.id ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    query.leftJoinAndSelect('user.role', 'role');
    query.leftJoinAndSelect('user.studentProfile', 'studentProfile');
    query.leftJoinAndSelect('user.employerProfile', 'employerProfile');
    query.skip(skip);
    query.take(limit);
    query.orderBy('user.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'studentProfile', 'employerProfile'],
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return user;
  }

  /**
   * Suspend user
   */
  async suspendUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<User> {
    const user = await this.getUserById(userId);
    const oldData = { status: user.status };

    user.status = UserStatus.SUSPENDED;
    const updated = await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.SUSPEND,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData,
      newData: { status: user.status },
      description: `Suspended user: ${reason}`,
    });

    return updated;
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(userId: string, adminId: string): Promise<User> {
    const user = await this.getUserById(userId);
    const oldData = { status: user.status };

    user.status = UserStatus.ACTIVE;
    const updated = await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData,
      newData: { status: user.status },
      description: 'Unsuspended user',
    });

    return updated;
  }

  /**
   * Verify employer (approve for job posting)
   */
  async verifyEmployer(userId: string, adminId: string): Promise<User> {
    const user = await this.getUserById(userId);
    const oldData = { isVerified: user.isVerified };

    user.isVerified = true;
    user.status = UserStatus.ACTIVE;
    const updated = await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.VERIFY,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData: { ...oldData, status: UserStatus.PENDING_APPROVAL },
      newData: { isVerified: true, status: UserStatus.ACTIVE },
      description: 'Employer verified',
    });

    return updated;
  }

  /**
   * Reject employer verification
   */
  async rejectEmployer(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<User> {
    const user = await this.getUserById(userId);
    const oldData = { status: user.status };

    user.status = UserStatus.BLOCKED;
    const updated = await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REJECT,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData,
      newData: { status: user.status },
      description: `Employer rejected: ${reason}`,
    });

    return updated;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, adminId: string): Promise<User> {
    const user = await this.getUserById(userId);

    const deleted = await this.userRepository.softRemove(user);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.DELETE,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData: { email: user.email, status: user.status },
      description: 'User deleted (soft delete)',
    });

    return deleted;
  }

  /**
   * Get pending approvals (employers with PENDING_APPROVAL status)
   */
  async getPendingApprovals(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: UserStatus.PENDING_APPROVAL });

    query.leftJoinAndSelect('user.employerProfile', 'employerProfile');
    query.skip(skip);
    query.take(limit);
    query.orderBy('user.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  /**
   * Get suspended users
   */
  async getSuspendedUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.userRepository.findAndCount({
      where: { status: UserStatus.SUSPENDED },
      relations: ['role', 'employerProfile', 'studentProfile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }
}
