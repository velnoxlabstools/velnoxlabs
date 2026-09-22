import type { BackupKind, RecoveryMode } from "../types";
import { backupManager } from "../backup";
import { restoreManager } from "../restore";
import { rollbackManager } from "../rollback";
import { integrityChecker } from "../integrity";
import { recoveryPlanner } from "./RecoveryPlanner";
import { snapshotManager } from "../snapshots";

let mode: RecoveryMode = "normal";

export class RecoveryManager {
  getMode(): RecoveryMode {
    return mode;
  }

  setMode(next: RecoveryMode): void {
    mode = next;
  }

  async createBackup(kind: BackupKind = "full", label?: string) {
    return backupManager.backup(kind, label);
  }

  async restore(snapshotId: string) {
    return restoreManager.restore(snapshotId);
  }

  async rollback(kind?: BackupKind) {
    return rollbackManager.rollback(kind);
  }

  verify(snapshotId: string) {
    return integrityChecker.verifySnapshot(snapshotId);
  }

  plan(mode?: RecoveryMode) {
    return recoveryPlanner.plan(mode);
  }

  listSnapshots(kind?: BackupKind) {
    return snapshotManager.list(kind);
  }

  /** Register default no-op sources/handlers — apps override with real data */
  bootstrapDefaults(): void {
    const kinds: BackupKind[] = [
      "configuration",
      "metadata",
      "tool-registry",
      "category-registry",
      "settings",
      "search-index",
    ];
    for (const k of kinds) {
      backupManager.registerSource(k, () => ({ kind: k, empty: true, at: Date.now() }));
      restoreManager.registerHandler(k, async () => {
        /* dry-run default */
      });
    }
  }
}

export const recoveryManager = new RecoveryManager();
recoveryManager.bootstrapDefaults();
