export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
}

export function createAnthropicProvider(options: AnthropicProviderOptions = {}) {
  return {
    name: "anthropic",
    options,
  };
}
