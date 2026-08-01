import { z } from "zod";
import type { ChatMessage, AssistantMessage, ToolCall } from "./message.types.js";

export interface ToolSpec {
  name: string;
  description: string;
  parameters: z.ZodType<any, any, any>;
}

export interface ModelRequest {
  messages: ChatMessage[];
  tools?: ToolSpec[];
  outputSchema?: z.ZodType<any, any, any>;
  signal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
}

export type FinishReason = "stop" | "tool_calls" | "length" | "content_filter" | "error";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ModelResponse {
  message: AssistantMessage;
  toolCalls?: ToolCall[];
  finishReason: FinishReason;
  usage?: TokenUsage;
}
