import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

@Injectable()
export class SupabaseService {
  private readonly supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_KEY'),
  );

  getClient() {
    return this.supabase;
  }
}
