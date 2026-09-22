"use client";

import { useCallback, useState } from "react";
import type { BackupKind, BackupResult, RestoreResult } from "../types";
import { recoveryManager } from "../services/RecoveryManager";

export function useRecovery() {
  const [lastBackup, setLastBackup] = useState<BackupResult | null>(null);
  const [lastRestore, setLastRestore] = useState<RestoreResult | null>(null);
  const [busy, setBusy] = useState(false);

  const backup = useCallback(async (kind: BackupKind = "full") => {
    setBusy(true);
    const res = await recoveryManager.createBackup(kind);
    setLastBackup(res);
    setBusy(false);
    return res;
  }, []);

  const restore = useCallback(async (snapshotId: string) => {
    setBusy(true);
    const res = await recoveryManager.restore(snapshotId);
    setLastRestore(res);
    setBusy(false);
    return res;
  }, []);

  return {
    busy,
    lastBackup,
    lastRestore,
    backup,
    restore,
    rollback: recoveryManager.rollback.bind(recoveryManager),
    plan: recoveryManager.plan.bind(recoveryManager),
    listSnapshots: recoveryManager.listSnapshots.bind(recoveryManager),
    mode: recoveryManager.getMode(),
    setMode: recoveryManager.setMode.bind(recoveryManager),
  };
}
