import type { AssistantMessage, ChatMessage, ToolCall } from "../core/index.js";


export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ModelRequest {
  messages: readonly ChatMessage[];

  tools?: readonly ToolSpec[];

  outputSchema?: Record<string, unknown>;
  temperature?: number;

  maxTokens?: number;

  signal?: AbortSignal;
}


export type FinishReason =
  | "stop"
  | "tool_calls"
  | "length"
  | "content_filter"
  | "error";


export interface TokenUsage {
  promptTokens: number;

  completionTokens: number;

  totalTokens: number;
}

export interface ProviderMetadata {
  provider: string;

  model: string;
}

/**
 * Response returned by every provider.
 */
export interface ModelResponse {
  message: AssistantMessage;

  toolCalls?: readonly ToolCall[];

  finishReason: FinishReason;

  usage?: TokenUsage;

  metadata?: ProviderMetadata;
}