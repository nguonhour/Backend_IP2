import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, Repository } from 'typeorm';
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
    role?: string,
    universityId?: string,
    majorId?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user');

    query.leftJoinAndSelect('user.role', 'role');
    query.leftJoinAndSelect('user.studentProfile', 'studentProfile');
    query.leftJoinAndSelect('studentProfile.university', 'university');
    query.leftJoinAndSelect('studentProfile.major', 'major');
    query.leftJoinAndSelect('studentProfile.studentSkills', 'studentSkills');
    query.leftJoinAndSelect('studentSkills.skill', 'skill');
    query.leftJoinAndSelect('user.employerProfile', 'employerProfile');
    query.leftJoinAndSelect('employerProfile.industry', 'industry');

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (role) {
      query.andWhere('UPPER(role.name) = :role', {
        role: role.toUpperCase(),
      });
    }

    if (universityId) {
      query.andWhere('university.id = :universityId', { universityId });
    }

    if (majorId) {
      query.andWhere('major.id = :majorId', { majorId });
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.email ILIKE :search')
            .orWhere('CAST(user.id AS text) ILIKE :search')
            .orWhere('studentProfile.firstName ILIKE :search')
            .orWhere('studentProfile.lastName ILIKE :search')
            .orWhere('employerProfile.companyName ILIKE :search');
        }),
        { search: `%${search}%` },
      );
    }

    query.skip(skip);
    query.take(limit);
    query.orderBy('user.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data: data.map((user) => this.toAdminUserRow(user)), total };
  }

  async getStats(): Promise<AdminUserStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalActiveStudents, newRegistrationsToday, activeEmployers] =
      await Promise.all([
        this.countUsersByRole('STUDENT', { status: UserStatus.ACTIVE }),
        this.userRepository.count({
          where: {
            createdAt: Between(today, tomorrow),
          },
        }),
        this.countUsersByRole('EMPLOYER', { status: UserStatus.ACTIVE }),
      ]);

    return {
      totalActiveStudents,
      newRegistrationsToday,
      activeEmployers,
      systemSecurity: {
        status: 'Optimal',
        helper: 'No threats detected',
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
    return this.toAdminUserRow(user);
  }

  private countUsersByRole(
    roleName: string,
    filters: { status?: UserStatus } = {},
  ): Promise<number> {
    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'role')
      .where('UPPER(role.name) = :roleName', {
        roleName: roleName.toUpperCase(),
      });

    if (filters.status) {
      query.andWhere('u.status = :status', { status: filters.status });
    }

    return query.getCount();
  }

  private async getUserEntityById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'role',
        'studentProfile',
        'studentProfile.university',
        'studentProfile.major',
        'studentProfile.studentSkills',
        'studentProfile.studentSkills.skill',
        'employerProfile',
        'employerProfile.industry',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return user;
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    reason: string | undefined,
    adminId: string,
  ): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
    const oldData = { status: user.status };

    user.status = status;
    if (status !== UserStatus.ACTIVE) {
      user.refreshTokenHash = null;
    }
    const updated = await this.userRepository.save(user);

    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      module: 'users',
      entityId: userId,
      entityType: 'User',
      oldData,
      newData: { status },
      description: reason
        ? `Updated user status: ${reason}`
        : `Updated user status to ${status}`,
    });

    return this.toAdminUserRow({ ...user, ...updated });
  }

  /**
   * Suspend user
   */
  async suspendUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
    const oldData = { status: user.status };

    user.status = UserStatus.SUSPENDED;
    user.refreshTokenHash = null;
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

    return this.toAdminUserRow({ ...user, ...updated });
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(userId: string, adminId: string): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
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

    return this.toAdminUserRow({ ...user, ...updated });
  }

  /**
   * Verify employer (approve for job posting)
   */
  async verifyEmployer(userId: string, adminId: string): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
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

    return this.toAdminUserRow({ ...user, ...updated });
  }

  /**
   * Reject employer verification
   */
  async rejectEmployer(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);
    const oldData = { status: user.status };

    user.status = UserStatus.BLOCKED;
    user.refreshTokenHash = null;
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

    return this.toAdminUserRow({ ...user, ...updated });
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, adminId: string): Promise<AdminUserRow> {
    const user = await this.getUserEntityById(userId);

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

    return this.toAdminUserRow({ ...user, ...deleted });
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
    return { data: data.map((user) => this.toAdminUserRow(user)), total };
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

    return { data: data.map((user) => this.toAdminUserRow(user)), total };
  }

  private toAdminUserRow(user: User): AdminUserRow {
    const student = user.studentProfile;
    const employer = user.employerProfile;
    const studentName = [student?.firstName, student?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const skills =
      student?.studentSkills
        ?.map((item) => item.skill?.name)
        .filter((value): value is string => Boolean(value)) ?? [];

    return {
      id: user.id,
      email: user.email,
      role: user.role?.name ?? '',
      status: user.status,
      isVerified: user.isVerified,
      name: studentName || employer?.companyName || user.email,
      avatarUrl: student?.avatarUrl ?? employer?.avatarUrl ?? null,
      createdAt: user.createdAt,
      studentProfile: student
        ? {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            university: student.university
              ? { id: student.university.id, name: student.university.name }
              : null,
            major: student.major
              ? { id: student.major.id, name: student.major.name }
              : null,
            skills,
          }
        : null,
      employerProfile: employer
        ? {
            id: employer.id,
            companyName: employer.companyName,
            industry: employer.industry
              ? { id: employer.industry.id, name: employer.industry.name }
              : null,
            location: employer.location,
          }
        : null,
    };
  }
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  status: UserStatus;
  isVerified: boolean;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  studentProfile: {
    id: string;
    firstName: string;
    lastName: string;
    university: { id: string; name: string } | null;
    major: { id: string; name: string } | null;
    skills: string[];
  } | null;
  employerProfile: {
    id: string;
    companyName: string;
    industry: { id: string; name: string } | null;
    location: string | null;
  } | null;
}

export interface AdminUserStats {
  totalActiveStudents: number;
  newRegistrationsToday: number;
  activeEmployers: number;
  systemSecurity: {
    status: string;
    helper: string;
  };
}
