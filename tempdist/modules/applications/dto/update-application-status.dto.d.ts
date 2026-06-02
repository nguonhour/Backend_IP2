export declare class UpdateApplicationStatusDto {
    statusId: string;
    sendNotification?: boolean;
    interviewDetails?: {
        date?: string;
        time?: string;
        meetingType?: string;
        meetingLocation?: string;
    };
}
