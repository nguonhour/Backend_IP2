import { User } from '../../modules/users/user.entity';
export declare class Role {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    users: User[];
}
