import { logStorage } from '../logging';
import type { LogEntry } from '../types';

export class SecurityMonitor {
  recentSecurityEvents(limit = 50): LogEntry[] {
    return logStorage.read(200).filter((e) => e.level === 'security').slice(-limit);
  }

  recentErrors(limit = 50): LogEntry[] {
    return logStorage.read(200).filter((e) => e.level === 'error').slice(-limit);
  }
}

export const securityMonitor = new SecurityMonitor();
