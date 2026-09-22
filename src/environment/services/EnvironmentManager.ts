import { environmentLoader } from "./EnvironmentLoader";
import { environmentResolver } from "./EnvironmentResolver";
import { environmentValidator } from "../validators";
import { featureFlagManager } from "../configuration";
import type { EnvValidationResult, RuntimeConfig } from "../types";

export class EnvironmentManager {
  getConfig(): RuntimeConfig {
    return environmentLoader.load();
  }

  validate(): EnvValidationResult {
    return environmentValidator.validateConfig(this.getConfig());
  }

  resolve() {
    return environmentResolver;
  }

  flags() {
    return featureFlagManager;
  }

  reload(): RuntimeConfig {
    return environmentLoader.reload();
  }
}

export const environmentManager = new EnvironmentManager();
