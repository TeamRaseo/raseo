import type { ToolDefinition, ToolCall, ToolResult, ToolExecutionOptions } from "../core/types/tool.types.js";
import { ToolExecutionError } from "../core/errors/tool.error.js";
import { ToolRegistry } from "./tool.registry.js";

/**
 * Responsible ONLY for tool execution:
 * 1. Find tool
 * 2. Validate input against tool Zod schema
 * 3. Evaluate guardrail hook (if present)
 * 4. Execute tool logic
 * 5. Catch errors & return standardized ToolResult
 */
export class ToolExecutor {
  private registry: ToolRegistry;

  constructor(registryOrTools?: ToolRegistry | ToolDefinition<any, any>[]) {
    if (registryOrTools instanceof ToolRegistry) {
      this.registry = registryOrTools;
    } else {
      this.registry = new ToolRegistry(registryOrTools ?? []);
    }
  }

  getRegistry(): ToolRegistry {
    return this.registry;
  }

  async executeCall(
    call: ToolCall,
    options: ToolExecutionOptions = {}
  ): Promise<ToolResult> {
    return this.execute(call.name, call.args, {
      ...options,
      toolCallId: call.id,
    });
  }

  async execute(
    toolName: string,
    rawInput: unknown,
    options: ToolExecutionOptions & { toolCallId?: string } = {}
  ): Promise<ToolResult> {
    const toolDef = this.registry.get(toolName);
    const toolCallIdProp = options.toolCallId ? { toolCallId: options.toolCallId } : {};

    if (!toolDef) {
      const errorMsg = `Tool '${toolName}' not found in ToolRegistry.`;
      return {
        ...toolCallIdProp,
        toolName,
        success: false,
        error: errorMsg,
        rawError: new ToolExecutionError(toolName, errorMsg),
      };
    }

    try {
      // Step 1: Validate input against Zod schema
      const parseResult = toolDef.input.safeParse(rawInput);
      if (!parseResult.success) {
        const validationErrorMsg = `Input validation failed for tool '${toolName}': ${parseResult.error.message}`;
        return {
          ...toolCallIdProp,
          toolName,
          success: false,
          error: validationErrorMsg,
          rawError: parseResult.error,
        };
      }

      const validatedInput = parseResult.data;

      // Step 2: Guardrail check if provided
      if (toolDef.guardrail) {
        const guardrailRes = await toolDef.guardrail(validatedInput, options.context);
        if (!guardrailRes.passed) {
          const reason = guardrailRes.reason ?? "Guardrail check failed";
          return {
            ...toolCallIdProp,
            toolName,
            success: false,
            error: `Guardrail violation for tool '${toolName}': ${reason}`,
            rawError: new Error(reason),
          };
        }
      }

      // Step 3: Execute tool logic
      const resultData = await toolDef.execute(validatedInput, options.context);

      return {
        ...toolCallIdProp,
        toolName,
        success: true,
        data: resultData,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ...toolCallIdProp,
        toolName,
        success: false,
        error: `Execution error in tool '${toolName}': ${message}`,
        rawError: err,
      };
    }
  }
}

export function createToolExecutor(registryOrTools?: ToolRegistry | ToolDefinition<any, any>[]): ToolExecutor {
  return new ToolExecutor(registryOrTools);
}
