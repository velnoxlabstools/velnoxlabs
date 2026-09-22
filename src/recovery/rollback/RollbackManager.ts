import type { BackupKind, RestoreResult } from "../types";
import { snapshotManager } from "../snapshots";
import { restoreManager } from "../restore";
import { backupManager } from "../backup";

export class RollbackManager {
  /**
   * Snapshot current state (safety), then restore previous snapshot of kind.
   */
  async rollback(kind: BackupKind = "full"): Promise<RestoreResult> {
    await backupManager.backup(kind, "pre-rollback");
    const candidates = snapshotManager.list(kind).filter((s) => s.label !== "pre-rollback");
    const target = candidates[0];
    if (!target) return { ok: false, error: "No rollback target for " + kind };
    return restoreManager.restore(target.id);
  }

  async rollbackRelease(): Promise<RestoreResult> {
    return this.rollback("full");
  }
}

export const rollbackManager = new RollbackManager();
