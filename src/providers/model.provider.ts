import type { ModelRequest, ModelResponse } from "./provider.types.js";


/**
 * Base contract implemented by every model provider.
 */
export interface ModelProvider {

  readonly name: string;
  readonly model: string;

  generate(
    request: ModelRequest,
  ): Promise<ModelResponse>;
}