export type BackupKind =
  | "configuration"
  | "metadata"
  | "tool-registry"
  | "category-registry"
  | "settings"
  | "search-index"
  | "full";

export type RecoveryMode = "normal" | "degraded" | "maintenance" | "fallback";

export interface SnapshotMeta {
  id: string;
  kind: BackupKind;
  createdAt: number;
  label?: string;
  checksum: string;
  size: number;
}

export interface SnapshotRecord extends SnapshotMeta {
  payload: string;
}

export interface BackupResult {
  ok: boolean;
  snapshot?: SnapshotMeta;
  error?: string;
}

export interface RestoreResult {
  ok: boolean;
  snapshotId?: string;
  error?: string;
  restoredKeys?: string[];
}

export interface IntegrityResult {
  ok: boolean;
  checks: { id: string; ok: boolean; message?: string }[];
}

export interface RecoveryPlan {
  id: string;
  steps: string[];
  mode: RecoveryMode;
  createdAt: number;
}
