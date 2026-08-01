import type { ModelRequest, ModelResponse } from "./model.types.js";

export interface ModelProvider {
  readonly name: string;
  generateResponse(request: ModelRequest): Promise<ModelResponse>;
}
