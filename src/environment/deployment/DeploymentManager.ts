import { deploymentValidator } from "./DeploymentValidator";
import { environmentManager } from "../services/EnvironmentManager";

export class DeploymentManager {
  preDeploy() {
    return deploymentValidator.validate();
  }

  summary() {
    const config = environmentManager.getConfig();
    return {
      env: config.env,
      appUrl: config.appUrl,
      flags: config.flags,
      validation: this.preDeploy(),
    };
  }
}

export const deploymentManager = new DeploymentManager();
