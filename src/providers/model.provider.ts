import type { ModelRequest, ModelResponse, ModelStreamResponse } from "./provider.types.js";


/**
 * Base contract implemented by every model provider.
 */
export interface ModelProvider {

  readonly name: string;
  readonly model: string;

  generate(
    request: ModelRequest,
  ): Promise<ModelResponse>;

  stream(
    request: ModelRequest,
  ): Promise<ModelStreamResponse>;
}