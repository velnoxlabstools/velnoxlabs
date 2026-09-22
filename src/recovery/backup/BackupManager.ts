import type { BackupKind, BackupResult } from "../types";
import { snapshotManager } from "../snapshots";
import { safeJsonStringify } from "../utils";

export type BackupSource = () => unknown | Promise<unknown>;

const sources = new Map<BackupKind, BackupSource>();

export class BackupManager {
  registerSource(kind: BackupKind, source: BackupSource): void {
    sources.set(kind, source);
  }

  async backup(kind: BackupKind, label?: string): Promise<BackupResult> {
    try {
      let data: unknown = { kind, at: Date.now(), note: "empty-source" };
      const source = sources.get(kind);
      if (source) data = await source();
      else if (kind === "full") {
        const parts: Record<string, unknown> = {};
        for (const [k, src] of sources) {
          if (k === "full") continue;
          parts[k] = await src();
        }
        data = parts;
      }
      const payload = safeJsonStringify(data);
      const snap = snapshotManager.create(kind, payload, label);
      return {
        ok: true,
        snapshot: {
          id: snap.id,
          kind: snap.kind,
          createdAt: snap.createdAt,
          label: snap.label,
          checksum: snap.checksum,
          size: snap.size,
        },
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Backup failed" };
    }
  }

  async backupAll(label?: string): Promise<BackupResult[]> {
    const kinds: BackupKind[] = [
      "configuration",
      "metadata",
      "tool-registry",
      "category-registry",
      "settings",
      "search-index",
    ];
    const results: BackupResult[] = [];
    for (const k of kinds) results.push(await this.backup(k, label));
    results.push(await this.backup("full", label));
    return results;
  }
}

export const backupManager = new BackupManager();
