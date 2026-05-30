import { UserStatus } from '../../users/user-status.enum';
export declare class UpdateUserStatusDto {
    status: UserStatus;
    reason?: string;
}
export declare class UpdateUserRoleDto {
    roleId: string;
    reason?: string;
}
export declare class SuspendUserDto {
    reason: string;
}
export declare class AdminGetUsersDto {
    status?: UserStatus;
    search?: string;
    page: number;
    limit: number;
}
