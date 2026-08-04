import type { ChatMessage } from "../../core/index.js";
import type { TokenUsage } from "../../providers/provider.types.js";

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