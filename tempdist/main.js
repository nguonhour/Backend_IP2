"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("@nestjs/common/pipes/validation.pipe");
const common_1 = require("@nestjs/common");
const init_hook_1 = require("./database/init-hook");
const typeorm_1 = require("typeorm");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const reflector = app.get(core_1.Reflector);
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(reflector), app.get(audit_interceptor_1.AuditInterceptor));
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        await (0, init_hook_1.initializeDatabase)(dataSource);
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to initialize database:', error);
    }
    const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    app.enableCors({
        origin: (requestOrigin, callback) => {
            if (!requestOrigin)
                return callback(null, true);
            if (corsOrigins.includes('*') || corsOrigins.includes(requestOrigin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'ngrok-skip-browser-warning',
        ],
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.use((0, cookie_parser_1.default)());
    await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map