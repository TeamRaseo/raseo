import type { ChatMessage } from "../../core/index.js";

export interface RuntimeResult {
  success: boolean;
  output: string;
  messages: readonly ChatMessage[];
  metadata: RuntimeMetadata;
}

export interface RuntimeMetadata {

  runId: string;
  duration: number;
  iterations: number;
  usage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}