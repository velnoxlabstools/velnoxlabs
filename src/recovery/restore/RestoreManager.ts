import type { RestoreResult } from "../types";
import { snapshotManager } from "../snapshots";
import { recoveryValidator } from "../verification";
import { safeJsonParse } from "../utils";

export type RestoreHandler = (data: unknown) => void | Promise<void>;

const handlers = new Map<string, RestoreHandler>();

export class RestoreManager {
  registerHandler(kind: string, handler: RestoreHandler): void {
    handlers.set(kind, handler);
  }

  async restore(snapshotId: string): Promise<RestoreResult> {
    const gate = recoveryValidator.canRestore(snapshotId);
    if (!gate.ok) return { ok: false, error: (gate as any).error ?? "Cannot restore", snapshotId };

    const snap = snapshotManager.get(snapshotId);
    if (!snap) return { ok: false, error: "Snapshot missing", snapshotId };

    const parsed = safeJsonParse(snap.payload);
    if (!parsed.ok) return { ok: false, error: (parsed as any).error ?? "Failed to parse snapshot", snapshotId };

    const restoredKeys: string[] = [];
    try {
      if (snap.kind === "full" && parsed.data && typeof parsed.data === "object") {
        for (const [key, value] of Object.entries(parsed.data as Record<string, unknown>)) {
          const handler = handlers.get(key);
          if (handler) {
            await handler(value);
            restoredKeys.push(key);
          }
        }
      } else {
        const handler = handlers.get(snap.kind);
        if (handler) {
          await handler(parsed.data);
          restoredKeys.push(snap.kind);
        } else {
          restoredKeys.push(snap.kind + ":dry-run");
        }
      }
      return recoveryValidator.finalize({ ok: true, snapshotId, restoredKeys });
    } catch (e) {
      return {
        ok: false,
        snapshotId,
        error: e instanceof Error ? e.message : "Restore failed",
      };
    }
  }
}

export const restoreManager = new RestoreManager();