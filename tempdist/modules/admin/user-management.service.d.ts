import { Repository } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { UserStatus } from '../../modules/users/user-status.enum';
import { AuditService } from '../audit-logs/audit.service';
export declare class UserManagementService {
    private userRepository;
    private auditService;
    constructor(userRepository: Repository<User>, auditService: AuditService);
    getUsers(status?: UserStatus, search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    getUserById(userId: string): Promise<User>;
    suspendUser(userId: string, reason: string, adminId: string): Promise<User>;
    unsuspendUser(userId: string, adminId: string): Promise<User>;
    verifyEmployer(userId: string, adminId: string): Promise<User>;
    rejectEmployer(userId: string, reason: string, adminId: string): Promise<User>;
    deleteUser(userId: string, adminId: string): Promise<User>;
    getPendingApprovals(page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    getSuspendedUsers(page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
}
