import type { ErrorCode, LogEntry, LogLevel } from '../types';
import { createId, redactSensitive } from '../utils';
import { logFormatter } from './LogFormatter';
import { logStorage } from './LogStorageAdapter';

export class Logger {
  private write(level: LogLevel, message: string, opts?: { code?: ErrorCode; context?: Record<string, unknown>; path?: string }) {
    const entry: LogEntry = {
      id: createId(),
      level,
      message,
      code: opts?.code,
      context: opts?.context ? redactSensitive(opts.context) : undefined,
      timestamp: Date.now(),
      path: opts?.path,
    };
    logStorage.write(entry);

    if (process.env.NODE_ENV !== 'production') {
      const line = logFormatter.format(entry);
      if (level === 'error' || level === 'security') {
        console.error(line);
      } else if (level === 'warn') {
        console.warn(line);
      } else {
        console.debug(line);
      }
    }

    return entry;
  }

  debug(message: string, context?: Record<string, unknown>) {
    return this.write('debug', message, { context });
  }

  info(message: string, context?: Record<string, unknown>) {
    return this.write('info', message, { context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    return this.write('warn', message, { context });
  }

  error(message: string, code?: ErrorCode, context?: Record<string, unknown>) {
    return this.write('error', message, { code, context });
  }

  security(message: string, context?: Record<string, unknown>) {
    return this.write('security', message, { code: 'FORBIDDEN', context });
  }
}

export const logger = new Logger();
