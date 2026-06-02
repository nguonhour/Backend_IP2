import { Role } from '../../entities/master/role.entity';
import { StudentProfile } from '../../modules/student-profiles/student-profile.entity';
import { EmployerProfile } from '../../modules/employer-profiles/employer-profile.entity';
import { Notification } from '../notifications/notification.entity';
import { ApplicationStatusHistory } from '../applications/application-status-history.entity';
import { UserStatus } from './user-status.enum';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    authProvider: string;
    role: Role;
    isVerified: boolean;
    status: UserStatus;
    refreshTokenHash: string | null;
    emailVerificationTokenHash: string | null;
    emailVerificationExpiresAt: Date | null;
    resetTokenHash: string | null;
    resetTokenExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    studentProfile: StudentProfile;
    employerProfile: EmployerProfile;
    notifications: Notification[];
    applicationStatusChanges: ApplicationStatusHistory[];
}
