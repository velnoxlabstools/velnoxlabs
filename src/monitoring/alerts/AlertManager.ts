import type { AlertEvent, AlertSeverity } from "../types";
import { monId, sanitizeContext } from "../utils";
import { metricsRegistry } from "../metrics";

const alerts: AlertEvent[] = [];
const MAX = 100;

export class AlertManager {
  raise(
    rule: string,
    message: string,
    severity: AlertSeverity = "warning",
    context?: Record<string, unknown>
  ): AlertEvent {
    const event: AlertEvent = {
      id: monId("alert"),
      severity,
      rule,
      message: message.slice(0, 300),
      timestamp: Date.now(),
      context: sanitizeContext(context),
    };
    alerts.unshift(event);
    if (alerts.length > MAX) alerts.length = MAX;
    return event;
  }

  evaluate(): AlertEvent[] {
    const raised: AlertEvent[] = [];
    const toolSamples = metricsRegistry.list("tool_execution");
    const slow = toolSamples.filter((s) => s.value > 3000);
    if (slow.length >= 3) {
      raised.push(
        this.raise("slow_tool_execution", "Multiple slow tool executions detected", "warning", {
          count: slow.length,
        })
      );
    }
    const errors = metricsRegistry.list("error_rate");
    if (errors.length >= 10) {
      raised.push(
        this.raise("high_error_rate", "Elevated error rate", "critical", { count: errors.length })
      );
    }
    return raised;
  }

  list(): AlertEvent[] {
    return [...alerts];
  }

  clear(): void {
    alerts.length = 0;
  }
}

export const alertManager = new AlertManager();
