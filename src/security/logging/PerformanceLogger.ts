import { logger } from './Logger';

export class SecurityPerformanceLogger {
  mark(name: string, durationMs: number, context?: Record<string, unknown>) {
    return logger.debug(`perf:${name}`, { durationMs, ...context });
  }
}

export const securityPerformanceLogger = new SecurityPerformanceLogger();
