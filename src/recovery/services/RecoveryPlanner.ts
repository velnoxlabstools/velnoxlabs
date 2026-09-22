import type { RecoveryMode, RecoveryPlan } from "../types";
import { recoveryId } from "../utils";

export class RecoveryPlanner {
  plan(mode: RecoveryMode = "degraded"): RecoveryPlan {
    const steps =
      mode === "maintenance"
        ? [
            "Enable maintenance mode",
            "Create full backup snapshot",
            "Run integrity checks",
            "Restore last known-good full snapshot",
            "Validate health checks",
            "Disable maintenance mode",
          ]
        : mode === "fallback"
          ? [
              "Switch to fallback/static responses",
              "Backup current registries",
              "Restore configuration + tool registry",
              "Rebuild search index",
              "Return to normal mode",
            ]
          : [
              "Capture diagnostic snapshot",
              "Backup affected kind",
              "Restore previous snapshot",
              "Verify integrity",
            ];

    return {
      id: recoveryId("plan"),
      steps,
      mode,
      createdAt: Date.now(),
    };
  }
}

export const recoveryPlanner = new RecoveryPlanner();
