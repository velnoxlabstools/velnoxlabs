import type { ErrorCode } from '../types';
import { logger } from './Logger';

export class ErrorLogger {
  capture(error: unknown, code: ErrorCode = 'UNKNOWN', context?: Record<string, unknown>) {
    const message = error instanceof Error ? error.message : String(error);
    return logger.error(message, code, context);
  }
}

export const errorLogger = new ErrorLogger();
