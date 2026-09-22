import { metricsCollector } from "../metrics";

export class HeartbeatService {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(intervalMs = 60000): void {
    if (this.timer || typeof window === "undefined") return;
    this.timer = setInterval(() => {
      metricsCollector.record("response_time", 0, { heartbeat: "1" });
    }, intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

export const heartbeatService = new HeartbeatService();
