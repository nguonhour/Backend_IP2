import { User } from '../users/user.entity';
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    APPROVE = "APPROVE",
    REJECT = "REJECT",
    SUSPEND = "SUSPEND",
    VERIFY = "VERIFY",
    APPLY = "APPLY",
    PAY = "PAY",
    REPORT = "REPORT",
    LOGIN = "LOGIN"
}
export declare class AuditLog {
    id: string;
    user: User;
    userId: string;
    action: AuditAction;
    module: string;
    entityId: string;
    entityType: string;
    oldData: Record<string, any>;
    newData: Record<string, any>;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
