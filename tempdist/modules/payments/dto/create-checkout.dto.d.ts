declare const PAYMENT_OPTIONS: readonly ["cards", "abapay_khqr", "abapay_khqr_deeplink", "google_pay"];
export declare class CreateCheckoutDto {
    amount: number;
    transactionId?: string;
    items?: string;
    planName?: string;
    planType?: string;
    jobPostLimit?: number;
    currency?: 'USD' | 'KHR';
    returnUrl?: string;
    cancelUrl?: string;
    continueSuccessUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    paymentOption?: (typeof PAYMENT_OPTIONS)[number];
}
export {};
