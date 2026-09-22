"use client";

import { useMemo } from "react";
import { environmentManager } from "../services/EnvironmentManager";
import { featureFlagManager } from "../configuration";

export function useEnvironment() {
  const config = useMemo(() => environmentManager.getConfig(), []);
  return {
    config,
    env: config.env,
    isProduction: config.env === "production",
    isEnabled: (flag: string) => featureFlagManager.isEnabled(flag),
    validate: () => environmentManager.validate(),
  };
}
