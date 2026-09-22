import { logger } from './Logger';

export class EventLogger {
  route(path: string, event: string, context?: Record<string, unknown>) {
    logger.info(`route:${event}`, { path, ...context });
  }

  tool(slug: string, event: string, context?: Record<string, unknown>) {
    logger.info(`tool:${event}`, { slug, ...context });
  }

  validation(field: string, event: string, context?: Record<string, unknown>) {
    logger.warn(`validation:${event}`, { field, ...context });
  }
}

export const eventLogger = new EventLogger();
