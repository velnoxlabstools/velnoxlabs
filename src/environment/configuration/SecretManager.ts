/**
 * Interface-only secret access — never log values.
 * Implementations can wrap vault/KMS later.
 */
export interface SecretManager {
  get(key: string): string | undefined;
  require(key: string): string;
}

export class EnvSecretManager implements SecretManager {
  get(key: string): string | undefined {
    if (typeof process === "undefined") return undefined;
    return process.env[key];
  }

  require(key: string): string {
    const v = this.get(key);
    if (v == null || v === "") {
      throw new Error("Missing required secret: " + key);
    }
    return v;
  }
}

export const secretManager: SecretManager = new EnvSecretManager();
