import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

const databaseUrl = requireEnv('DATABASE_URL').trim();
const isSupabase = databaseUrl.includes('supabase.com');
const synchronize = parseBoolean(process.env.DB_SYNC, false);
const dropSchema = parseBoolean(process.env.DB_DROP_SCHEMA, false);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize,
  dropSchema,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  migrationsRun: false,
});
