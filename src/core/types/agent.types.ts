import { z } from "zod";
import type { ToolDefinition, GuardrailResult } from "./tool.types.js";
import type { AgentRunContext } from "./run.types.js";
import type { ModelProvider } from "../../providers/model.provider.js";

export type InstructionResolver = string | ((context: AgentRunContext) => string | Promise<string>);

export interface GuardrailContext {
  agentName: string;
  runContext: AgentRunContext;
}

export type AgentGuardrail = (
  input: unknown,
  ctx: GuardrailContext
) => Promise<GuardrailResult> | GuardrailResult;

export interface HandoffTarget {
  agent: AgentConfig;
  description?: string;
}

/**
 * Lifetime 1: Static Agent Configuration
 * Immutable definition of an agent's configuration, rules, tools, and handoffs.
 */
export interface AgentConfig<TOutput = unknown> {
  name: string;
  instructions: InstructionResolver;
  model: ModelProvider;
  tools?: ToolDefinition<any>[];
  handoffs?: (AgentConfig | HandoffTarget)[];
  guardrails?: {
    input?: AgentGuardrail[];
    output?: AgentGuardrail[];
  };
  outputSchema?: z.ZodType<TOutput>;
}
