export declare class EmailService {
    private readonly logger;
    private readonly isEnabled;
    constructor();
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendResetPasswordEmail(email: string, token: string): Promise<void>;
}
