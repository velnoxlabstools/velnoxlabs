import type { BackupKind, SnapshotMeta, SnapshotRecord } from "../types";
import { checksum, recoveryId } from "../utils";

const store = new Map<string, SnapshotRecord>();
const MAX = 30;

export class SnapshotManager {
  create(kind: BackupKind, payload: string, label?: string): SnapshotRecord {
    const record: SnapshotRecord = {
      id: recoveryId("snap"),
      kind,
      createdAt: Date.now(),
      label,
      checksum: checksum(payload),
      size: payload.length,
      payload,
    };
    store.set(record.id, record);
    // prune oldest
    if (store.size > MAX) {
      const sorted = [...store.values()].sort((a, b) => a.createdAt - b.createdAt);
      for (const old of sorted.slice(0, store.size - MAX)) store.delete(old.id);
    }
    return record;
  }

  get(id: string): SnapshotRecord | undefined {
    return store.get(id);
  }

  list(kind?: BackupKind): SnapshotMeta[] {
    return [...store.values()]
      .filter((s) => !kind || s.kind === kind)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(({ payload: _p, ...meta }) => meta);
  }

  latest(kind?: BackupKind): SnapshotRecord | undefined {
    return [...store.values()]
      .filter((s) => !kind || s.kind === kind)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
  }

  delete(id: string): boolean {
    return store.delete(id);
  }

  clear(): void {
    store.clear();
  }
}

export const snapshotManager = new SnapshotManager();
