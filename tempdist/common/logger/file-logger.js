"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErrorToFile = logErrorToFile;
exports.logInfoToFile = logInfoToFile;
const fs_1 = require("fs");
const path_1 = require("path");
const LOG_DIR = (0, path_1.join)(process.cwd(), 'logs');
const ERROR_LOG = (0, path_1.join)(LOG_DIR, 'errors.log');
function ensureLogDir() {
    if (!(0, fs_1.existsSync)(LOG_DIR)) {
        (0, fs_1.mkdirSync)(LOG_DIR, { recursive: true });
    }
}
function logErrorToFile(error, meta) {
    try {
        ensureLogDir();
        const payload = {
            timestamp: new Date().toISOString(),
            message: error?.message ?? String(error),
            stack: error?.stack ?? null,
            meta: meta ?? null,
        };
        (0, fs_1.appendFile)(ERROR_LOG, JSON.stringify(payload) + '\n', (err) => {
            if (err)
                console.error('Failed to write error log:', err);
        });
    }
    catch (e) {
        console.error('Logger failure:', e);
    }
}
function logInfoToFile(message, meta) {
    try {
        ensureLogDir();
        const payload = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message,
            meta: meta ?? null,
        };
        (0, fs_1.appendFile)(ERROR_LOG, JSON.stringify(payload) + '\n', (err) => {
            if (err)
                console.error('Failed to write info log:', err);
        });
    }
    catch (e) {
        console.error('Logger failure:', e);
    }
}
//# sourceMappingURL=file-logger.js.map