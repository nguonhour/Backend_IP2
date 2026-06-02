import { Application } from '../../modules/applications/application.entity';
export declare class ApplicationStatus {
    id: string;
    name: string;
    isActive: boolean;
    applications: Application[];
}
