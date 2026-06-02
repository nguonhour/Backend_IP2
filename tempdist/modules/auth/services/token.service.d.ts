type TokenUser = {
    id: string;
    email: string;
    role?: {
        name: string;
    };
};
export declare class TokenService {
    generateTokens(user: TokenUser): {
        accessToken: string;
        refreshToken: string;
    };
    private sign;
}
export {};
