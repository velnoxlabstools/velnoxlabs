import type { LogEntry } from '../types';

/**
 * In-memory ring buffer. Swap for remote sink later without changing Logger API.
 */
export class LogStorageAdapter {
  private buffer: LogEntry[] = [];
  private max = 500;

  write(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.max) {
      this.buffer = this.buffer.slice(-this.max);
    }
  }

  read(limit = 100): LogEntry[] {
    return this.buffer.slice(-limit);
  }

  clear(): void {
    this.buffer = [];
  }
}

export const logStorage = new LogStorageAdapter();
