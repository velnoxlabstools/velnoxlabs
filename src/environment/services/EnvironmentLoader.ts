import { runtimeConfiguration } from "../runtime-config";
import type { RuntimeConfig } from "../types";

export class EnvironmentLoader {
  load(): RuntimeConfig {
    return runtimeConfiguration.get();
  }

  reload(): RuntimeConfig {
    return runtimeConfiguration.reload();
  }
}

export const environmentLoader = new EnvironmentLoader();
