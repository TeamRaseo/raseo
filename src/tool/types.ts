import type { ToolDefinition } from "../core/types/tool.types.js";

export interface RegisterToolOptions {
  override?: boolean;
}

export interface ToolConfigOptions<
  TSchema extends import("zod").ZodType,
  TResult = unknown
> {
  name: string;
  description: string;
  input: TSchema;
  execute: (
    input: import("zod").infer<TSchema>,
    context?: import("../core/types/tool.types.js").ToolContext
  ) => Promise<TResult> | TResult;
  guardrail?: import("../core/types/tool.types.js").ToolGuardrailHook;
}
