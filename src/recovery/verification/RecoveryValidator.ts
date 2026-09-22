import type { RestoreResult } from "../types";
import { integrityChecker } from "../integrity";

export class RecoveryValidator {
  canRestore(snapshotId: string): { ok: boolean; error?: string } {
    const integrity = integrityChecker.verifySnapshot(snapshotId);
    if (!integrity.ok) {
      return {
        ok: false,
        error: integrity.checks.find((c) => !c.ok)?.message ?? "Integrity failed",
      };
    }
    return { ok: true };
  }

  finalize(result: RestoreResult): RestoreResult {
    return result;
  }
}

export const recoveryValidator = new RecoveryValidator();
