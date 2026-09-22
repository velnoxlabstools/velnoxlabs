import { eventTracker } from '../tracking';

export function trackToolView(slug: string, toolId?: string, path?: string) {
  eventTracker.track({
    name: 'tool_view',
    timestamp: Date.now(),
    toolSlug: slug,
    toolId,
    path: path ?? `/tools/${slug}`,
  });
}

export function trackToolExecute(slug: string, toolId?: string) {
  eventTracker.track({
    name: 'tool_execute',
    timestamp: Date.now(),
    toolSlug: slug,
    toolId,
  });
}

export function trackCopyResult(slug: string) {
  eventTracker.track({ name: 'copy_result', timestamp: Date.now(), toolSlug: slug });
}

export function trackDownloadResult(slug: string) {
  eventTracker.track({ name: 'download_result', timestamp: Date.now(), toolSlug: slug });
}

export function trackShareResult(slug: string) {
  eventTracker.track({ name: 'share_result', timestamp: Date.now(), toolSlug: slug });
}
