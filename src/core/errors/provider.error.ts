import { RaseoError } from "./runtime.error.js";

export class ModelProviderError extends RaseoError {
  readonly providerName: string;

  constructor(providerName: string, message: string) {
    super(`Provider '${providerName}' error: ${message}`, "MODEL_PROVIDER_ERROR");
    this.providerName = providerName;
  }
}
