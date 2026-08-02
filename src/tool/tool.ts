import type { z } from "zod";
import type { ToolDefinition, ToolContext, ToolGuardrailHook } from "../core/types/tool.types.js";

export interface ToolConfig<
  TSchema extends z.ZodType,
  TResult = unknown
> {
  name: string;
  description: string;
  input: TSchema;
  execute: (input: z.infer<TSchema>, context?: ToolContext) => Promise<TResult> | TResult;
  guardrail?: ToolGuardrailHook;
}

/**
 * Developer-facing helper function to define a tool with automatic input type inference.
 *
 * Example:
 * ```ts
 * const weather = tool({
 *   name: "weather",
 *   description: "Get current weather",
 *   input: z.object({ city: z.string() }),
 *   async execute({ city }) {
 *     return { temperature: 32, condition: "Sunny" };
 *   }
 * });
 * ```
 */
export function tool<TSchema extends z.ZodType, TResult = unknown>(
  config: ToolConfig<TSchema, TResult>
): ToolDefinition<TSchema, TResult> {
  return {
    name: config.name,
    description: config.description,
    input: config.input,
    execute: config.execute,
    ...(config.guardrail ? { guardrail: config.guardrail } : {}),
  };
}

/**
 * Alias for `tool()` developer helper function.
 */
export const createTool = tool;
