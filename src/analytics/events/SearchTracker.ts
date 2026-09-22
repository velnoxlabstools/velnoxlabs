import { eventTracker } from '../tracking';

export function trackSearch(query: string, path = '/search') {
  eventTracker.track({
    name: 'search',
    timestamp: Date.now(),
    query,
    path,
  });
}
