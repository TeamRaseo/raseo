import type { ChatMessage } from "./message.types.js";

export interface AgentRunResult<TOutput = unknown> {
  output?: TOutput;
  messages: ChatMessage[];
  turnCount: number;
  finalAgentName: string;
}
