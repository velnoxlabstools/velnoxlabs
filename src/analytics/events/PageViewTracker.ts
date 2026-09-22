import { eventTracker } from '../tracking';

export function trackPageView(path: string, label?: string) {
  eventTracker.track({
    name: 'page_view',
    timestamp: Date.now(),
    path,
    label,
  });
}
