import { sanitizeContext } from "../utils";

/** Lightweight structured log bridge (console in dev; replaceable) */
export class MonitoringLogger {
  info(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.info("[monitoring]", message, sanitizeContext(context));
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error("[monitoring]", message, sanitizeContext(context));
  }
}

export const monitoringLogger = new MonitoringLogger();
