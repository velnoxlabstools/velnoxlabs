import type { AppEnvironment } from "../types";
import { environmentLoader } from "./EnvironmentLoader";

export class EnvironmentResolver {
  current(): AppEnvironment {
    return environmentLoader.load().env;
  }

  isProduction(): boolean {
    return this.current() === "production";
  }

  isStaging(): boolean {
    return this.current() === "staging";
  }

  isDev(): boolean {
    const e = this.current();
    return e === "local" || e === "development";
  }
}

export const environmentResolver = new EnvironmentResolver();
