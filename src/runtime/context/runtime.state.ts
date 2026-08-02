import type { ChatMessage } from "../../core/index.js";

export interface RuntimeState {
  runId: string;
  iteration: number;
  messages: ChatMessage[];
  completed: boolean;
  output?: string;
  startedAt: Date;
  finishedAt?: Date;
}