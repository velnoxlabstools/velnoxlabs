import type { LogEntry } from '../types';
import { redactSensitive } from '../utils';

export class LogFormatter {
  format(entry: LogEntry): string {
    const ctx = entry.context ? JSON.stringify(redactSensitive(entry.context)) : '';
    return `[${new Date(entry.timestamp).toISOString()}] ${entry.level.toUpperCase()}${
      entry.code ? ` (${entry.code})` : ''
    }: ${entry.message}${ctx ? ` ${ctx}` : ''}`;
  }
}

export const logFormatter = new LogFormatter();
