export interface GeminiProviderOptions {
  apiKey?: string;
  model?: string;
}

export function createGeminiProvider(options: GeminiProviderOptions = {}) {
  return {
    name: "gemini",
    options,
  };
}
