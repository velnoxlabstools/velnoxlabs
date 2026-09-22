import { logger } from './Logger';

export class WarningLogger {
  warn(message: string, context?: Record<string, unknown>) {
    return logger.warn(message, context);
  }
}

export const warningLogger = new WarningLogger();
