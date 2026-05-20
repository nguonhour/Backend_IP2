import { existsSync, mkdirSync, appendFile } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const ERROR_LOG = join(LOG_DIR, 'errors.log');

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function logErrorToFile(error: any, meta?: Record<string, any>) {
  try {
    ensureLogDir();
    const payload = {
      timestamp: new Date().toISOString(),
      message: error?.message ?? String(error),
      stack: error?.stack ?? null,
      meta: meta ?? null,
    };
    appendFile(ERROR_LOG, JSON.stringify(payload) + '\n', (err) => {
      // swallow write errors to avoid crashing the app
      if (err) console.error('Failed to write error log:', err);
    });
  } catch (e) {
    // Keep this extremely robust: never throw from logger
    // eslint-disable-next-line no-console
    console.error('Logger failure:', e);
  }
}

export function logInfoToFile(message: string, meta?: Record<string, any>) {
  try {
    ensureLogDir();
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      meta: meta ?? null,
    };
    appendFile(ERROR_LOG, JSON.stringify(payload) + '\n', (err) => {
      if (err) console.error('Failed to write info log:', err);
    });
  } catch (e) {
    console.error('Logger failure:', e);
  }
}
