"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function requireEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is required`);
    return value;
}
function parseBoolean(value, fallback = false) {
    if (value === undefined)
        return fallback;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}
const databaseUrl = requireEnv('DATABASE_URL').trim();
const isSupabase = databaseUrl.includes('supabase.com');
const synchronize = parseBoolean(process.env.DB_SYNC, false);
const dropSchema = parseBoolean(process.env.DB_DROP_SCHEMA, false);
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: databaseUrl,
    synchronize,
    dropSchema,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
    migrations: ['src/migrations/*.ts'],
    entities: ['src/**/*.entity.ts'],
    migrationsRun: false,
});
//# sourceMappingURL=data-source.js.map