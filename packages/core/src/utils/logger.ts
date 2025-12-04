/**
 * Pino-based structured logging
 */

import pino from 'pino';

let loggerInstance: pino.Logger | null = null;

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  pretty?: boolean;
}

export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const level = options.level ?? (process.env.LOG_LEVEL as pino.Level) ?? 'info';
  const pretty = options.pretty ?? process.env.NODE_ENV !== 'production';

  if (pretty) {
    return pino({
      level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino({ level });
}

export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

export function setLogger(newLogger: pino.Logger): void {
  loggerInstance = newLogger;
}

export const logger = getLogger();
