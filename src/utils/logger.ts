/**
 * Pino-based structured logging
 */

import pino from 'pino';
import { getConfig } from '../config/index.js';

let loggerInstance: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  let level = 'info';
  try {
    const config = getConfig();
    level = config.LOG_LEVEL;
  } catch {
    // Config not loaded yet, use default
  }

  loggerInstance = pino({
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

  return loggerInstance;
}

export const logger = getLogger();
