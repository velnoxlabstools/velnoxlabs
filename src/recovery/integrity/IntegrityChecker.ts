import type { IntegrityResult } from "../types";
import { snapshotManager } from "../snapshots";
import { checksum } from "../utils";

export class IntegrityChecker {
  verifySnapshot(id: string): IntegrityResult {
    const snap = snapshotManager.get(id);
    if (!snap) {
      return { ok: false, checks: [{ id: "exists", ok: false, message: "Snapshot not found" }] };
    }
    const checks = [
      { id: "exists", ok: true },
      {
        id: "checksum",
        ok: checksum(snap.payload) === snap.checksum,
        message: checksum(snap.payload) === snap.checksum ? undefined : "Checksum mismatch",
      },
      {
        id: "non-empty",
        ok: snap.payload.length > 2,
        message: snap.payload.length > 2 ? undefined : "Payload empty",
      },
    ];
    return { ok: checks.every((c) => c.ok), checks };
  }

  verifyLatest(kind?: Parameters<typeof snapshotManager.latest>[0]): IntegrityResult {
    const latest = snapshotManager.latest(kind);
    if (!latest) return { ok: false, checks: [{ id: "latest", ok: false, message: "No snapshot" }] };
    return this.verifySnapshot(latest.id);
  }
}

export const integrityChecker = new IntegrityChecker();
