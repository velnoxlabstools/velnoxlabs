import type { WebVitalsSnapshot } from '../types';
import { performanceLogger } from './PerformanceLogger';
import { rateCls, rateInp, rateLcp } from '../utils';

/**
 * Lightweight CWV tracker — call reportWebVital from app instrumentation.
 */
export class CoreWebVitalsTracker {
  private snapshot: WebVitalsSnapshot = {};

  report(name: string, value: number, path?: string): void {
    const key = name.toLowerCase();
    if (key === 'lcp') {
      this.snapshot.lcp = value;
      performanceLogger.record({
        name: 'LCP',
        value,
        rating: rateLcp(value),
        timestamp: Date.now(),
        path,
      });
    } else if (key === 'cls') {
      this.snapshot.cls = value;
      performanceLogger.record({
        name: 'CLS',
        value,
        rating: rateCls(value),
        timestamp: Date.now(),
        path,
      });
    } else if (key === 'inp' || key === 'fid') {
      this.snapshot.inp = value;
      performanceLogger.record({
        name: 'INP',
        value,
        rating: rateInp(value),
        timestamp: Date.now(),
        path,
      });
    } else if (key === 'fcp') {
      this.snapshot.fcp = value;
      performanceLogger.record({ name: 'FCP', value, timestamp: Date.now(), path });
    } else if (key === 'ttfb') {
      this.snapshot.ttfb = value;
      performanceLogger.record({ name: 'TTFB', value, timestamp: Date.now(), path });
    }
  }

  getSnapshot(): WebVitalsSnapshot {
    return { ...this.snapshot };
  }
}

export const coreWebVitalsTracker = new CoreWebVitalsTracker();
