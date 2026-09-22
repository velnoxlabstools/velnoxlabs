import type { ExecutionLogEntry } from '../types';

export class ExecutionLogger {
  private entries: ExecutionLogEntry[] = [];

  log(level: ExecutionLogEntry['level'], message: string, data?: unknown): void {
    this.entries.push({
      level,
      message,
      timestamp: Date.now(),
      data,
    });
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  getEntries(): ExecutionLogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
