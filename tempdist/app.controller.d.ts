export declare class AppController {
    getRoot(): {
        message: string;
        statusCode: number;
    };
    getHealth(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
