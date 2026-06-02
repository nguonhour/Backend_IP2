import { StudentCompanyPreferencesService } from './student-company-preferences.service';
import type { AuthenticatedRequest } from '../../common/types/auth-request.type';
export declare class StudentCompanyPreferencesController {
    private readonly service;
    constructor(service: StudentCompanyPreferencesService);
    upsert(req: AuthenticatedRequest, body: {
        employerId: string;
        blocked?: boolean;
        muted?: boolean;
    }): Promise<import("./student-company-preference.entity").StudentCompanyPreference | import("./student-company-preference.entity").StudentCompanyPreference[]>;
    listMe(req: AuthenticatedRequest): Promise<import("./student-company-preference.entity").StudentCompanyPreference[]>;
    list(studentId: string, req: AuthenticatedRequest): Promise<import("./student-company-preference.entity").StudentCompanyPreference[]>;
}
