import { z } from "zod";
import type { AgentRunContext } from "./run.types.js";

export interface GuardrailResult {
  passed: boolean;
  reason?: string;
}

export type ToolGuardrailHook = (
  input: unknown,
  context: AgentRunContext
) => Promise<GuardrailResult> | GuardrailResult;

export interface Tool<TSchema extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  schema: TSchema;
  execute: (input: z.infer<TSchema>, context: AgentRunContext) => Promise<unknown> | unknown;
  guardrail?: ToolGuardrailHook;
}

export function createTool<TSchema extends z.ZodType>(
  tool: Tool<TSchema>
): Tool<TSchema> {
  return tool;
}
