import { logger } from './Logger';

export class SecurityLogger {
  blocked(reason: string, context?: Record<string, unknown>) {
    return logger.security(reason, context);
  }

  invalidInput(field: string, context?: Record<string, unknown>) {
    return logger.security('invalid_input', { field, ...context });
  }
}

export const securityLogger = new SecurityLogger();
