import type { ModelProvider } from "./model.provider.js";
import type { ModelResponse, ModelRequest } from "./provider.types.js";


export interface MockProviderOptions {
  name?: string;
  responses?: ModelResponse[];
  defaultResponse?: ModelResponse;
}

export class MockProvider implements ModelProvider {
  readonly name: string;
  readonly model: string;
  private responses: ModelResponse[];
  private defaultResponse: ModelResponse;
  public requests: ModelRequest[] = [];

  constructor(options: MockProviderOptions = {}) {
    this.name = options.name ?? "mock-provider";
    this.model = "gpt-4o-mini"// only for test
    this.responses = [...(options.responses ?? [])];
    this.defaultResponse = options.defaultResponse ?? {
      message: { role: "assistant", content: "Mock provider response" },
      finishReason: "stop",
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    };
  }

  async generate(request: ModelRequest): Promise<ModelResponse> {
    this.requests.push(request);
    if (this.responses.length > 0) {
      return this.responses.shift()!;
    }
    return this.defaultResponse;
  }
}

export function createMockProvider(options: MockProviderOptions = {}): MockProvider {
  return new MockProvider(options);
}
