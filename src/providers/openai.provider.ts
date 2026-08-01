export interface OpenAIProviderOptions {
  apiKey?: string;
  model?: string;
}

export function createOpenaiProvider(options: OpenAIProviderOptions = {}) {
  return {
    name: "openai",
    options,
  };
}
