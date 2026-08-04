import type { AssistantMessage, ChatMessage, ToolCall, ToolDefinition } from "../core/index.js";


export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ModelRequest {
  messages: readonly ChatMessage[];

  tools?: readonly (ToolSpec | ToolDefinition)[];

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

export type ModelStreamChunkType =
  | "text-delta"
  | "tool-call-delta"
  | "finish"
  | "error";

export interface TextDeltaChunk {
  type: "text-delta";
  textDelta: string;
}

export interface ToolCallDeltaChunk {
  type: "tool-call-delta";
  toolCallIndex: number;
  id?: string;
  name?: string;
  argumentsDelta?: string;
}

export interface FinishChunk {
  type: "finish";
  finishReason: FinishReason;
  usage?: TokenUsage;
  metadata?: ProviderMetadata;
}

export interface ErrorChunk {
  type: "error";
  error: Error;
}

export type ModelStreamChunk =
  | TextDeltaChunk
  | ToolCallDeltaChunk
  | FinishChunk
  | ErrorChunk;

/**
 * Stream response object returned when streaming.
 */
export interface ModelStreamResponse extends AsyncIterable<ModelStreamChunk> {
  textStream: AsyncIterable<string>;
  response: Promise<ModelResponse>;
}