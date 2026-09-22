import { environmentManager } from "../services/EnvironmentManager";
import type { EnvValidationResult } from "../types";

export interface DeploymentChecklistItem {
  id: string;
  ok: boolean;
  message: string;
}

export class DeploymentValidator {
  checklist(): DeploymentChecklistItem[] {
    const config = environmentManager.getConfig();
    const validation = environmentManager.validate();
    const items: DeploymentChecklistItem[] = [
      {
        id: "env-validation",
        ok: validation.ok,
        message: validation.ok ? "Environment config valid" : validation.errors.join("; "),
      },
      {
        id: "app-url",
        ok: Boolean(config.appUrl),
        message: config.appUrl ? "appUrl set" : "appUrl missing",
      },
      {
        id: "production-indexing",
        ok: config.env !== "production" || config.seo.allowIndexing,
        message:
          config.env === "production" && !config.seo.allowIndexing
            ? "Warning: production indexing off"
            : "Indexing policy OK",
      },
      {
        id: "maintenance",
        ok: !config.flags.maintenanceMode || config.env !== "production",
        message: config.flags.maintenanceMode
          ? "Maintenance mode is ON"
          : "Maintenance mode off",
      },
    ];
    return items;
  }

  validate(): EnvValidationResult & { checklist: DeploymentChecklistItem[] } {
    const base = environmentManager.validate();
    const checklist = this.checklist();
    const hardFail = checklist.filter((c) =>
      ["env-validation", "app-url"].includes(c.id) && !c.ok
    );
    return {
      ...base,
      ok: base.ok && hardFail.length === 0,
      checklist,
    };
  }
}

export const deploymentValidator = new DeploymentValidator();
