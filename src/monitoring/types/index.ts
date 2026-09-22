export type HealthStatus = "pass" | "fail" | "degraded" | "unknown";

export interface HealthCheckResult {
  id: string;
  status: HealthStatus;
  message?: string;
  durationMs: number;
  timestamp: number;
}

export interface HealthReport {
  status: HealthStatus;
  checks: HealthCheckResult[];
  timestamp: number;
}

export type MetricName =
  | "response_time"
  | "page_load"
  | "tool_execution"
  | "memory"
  | "cache_hit_rate"
  | "error_rate"
  | "slow_request";

export interface MetricSample {
  name: MetricName | string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertEvent {
  id: string;
  severity: AlertSeverity;
  rule: string;
  message: string;
  timestamp: number;
  context?: Record<string, string | number>;
}

export interface DiagnosticReport {
  id: string;
  createdAt: number;
  health: HealthReport;
  metrics: MetricSample[];
  alerts: AlertEvent[];
  notes?: string[];
}
