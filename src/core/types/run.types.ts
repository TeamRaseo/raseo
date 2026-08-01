/**
 * Lifetime 2: Per-Run State
 * Exists ONLY for the duration of a single execution/invocation of an agent.
 */
export interface AgentRunContext {
  readonly runId: string;
  readonly sessionId?: string;
  readonly signal?: AbortSignal;
  turnCount: number;
  readonly maxTurns: number;
  currentAgentName: string;
  readonly metadata: Record<string, unknown>;
}
