import { Application } from './application.entity';
import { ApplicationStatus } from '../../entities/master/application-status.entity';
import { User } from '../users/user.entity';
export declare class ApplicationStatusHistory {
    id: string;
    application: Application;
    status: ApplicationStatus;
    notes: string;
    changedBy: User;
    changedAt: Date;
}
