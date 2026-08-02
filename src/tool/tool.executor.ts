import type {
    ToolCall,
    ToolContext,
    ToolDefinition,
    ToolExecutionOptions,
    ToolResult,
} from "../core/types/tool.types.js";

import { ToolExecutionError } from "../core/errors/tool.error.js";
import { ToolRegistry } from "./tool.registry.js";
import type z from "zod";

/**
 * Executes registered tools.
 *
 * Responsibilities:
 * - Resolve tools
 * - Validate input
 * - Run guardrails
 * - Execute tool logic
 * - Normalize results
 *
 * Does NOT:
 * - Call LLM providers
 * - Manage conversations
 * - Handle retries
 * - Perform tracing
 */
export class ToolExecutor {
    constructor(
        private readonly registry: ToolRegistry,
    ) { }

    getRegistry(): ToolRegistry {
        return this.registry;
    }
    async executeCall(
        call: ToolCall,
        options: ToolExecutionOptions = {},
    ): Promise<ToolResult> {
        return this.execute(
            call.name,
            call.args,
            {
                ...options,
                toolCallId: call.id,
            },
        );
    }

    /**
     * Execute a tool by name.
     */
    async execute(
        toolName: string,
        rawInput: unknown,
        options: ToolExecutionOptions & {
            toolCallId?: string;
        } = {},
    ): Promise<ToolResult> {
        try {
            const tool = this.resolveTool(toolName);

            const input = this.validateInput(
                tool,
                rawInput,
            );

            await this.runGuardrails(
                tool,
                input,
                options.context,
            );

            const data = await this.invokeTool(
                tool,
                input,
                options.context,
            );

            return this.createSuccess(
                tool.name,
                data,
                options.toolCallId,
            );
        } catch (error) {
            return this.createFailure(
                toolName,
                error,
                options.toolCallId,
            );
        }
    }


    private resolveTool<TSchema extends z.ZodTypeAny, TResult>(
        toolName: string,
    ): ToolDefinition {
        const tool = this.registry.get(toolName);

        if (!tool) {
            throw new ToolExecutionError(
                toolName,
                "Tool is not registered.",
            );
        }

        return tool;
    }

    /**
     * Validate raw input against the tool schema.
     */
    /**
 * Validate raw input against the tool schema.
 */
    private validateInput(
        tool: ToolDefinition,
        rawInput: unknown,
    ): unknown {
        const result = tool.input.safeParse(rawInput);

        if (!result.success) {
            throw new ToolExecutionError(
                tool.name,
                `Input validation failed.\n${result.error.message}`,
                result.error,
            );
        }

        return result.data;
    }

    /**
     * Execute guardrails before tool execution.
     */
    /**
  * Execute tool guardrails.
  *
  * Throws when a guardrail rejects execution.
  */
    private async runGuardrails(
        tool: ToolDefinition,
        input: unknown,
        context?: ToolContext,
    ): Promise<void> {
        if (!tool.guardrail) {
            return;
        }

        const result = await tool.guardrail(
            input,
            context,
        );

        if (!result.passed) {
            throw new ToolExecutionError(
                tool.name,
                result.reason ?? "Tool guardrail rejected execution.",
            );
        }
    }

    /**
     * Invoke the tool.
     */
    private async invokeTool(
        tool: ToolDefinition,
        input: unknown,
        context?: ToolContext,
    ): Promise<unknown> {
        return await tool.execute(
            input,
            context,
        );
    }


    /**
     * Create a successful ToolResult.
     */
    private createSuccess(
        toolName: string,
        data: unknown,
        toolCallId?: string,
    ): ToolResult {
        const result: ToolResult = {
            toolName,
            success: true,
            data,
        };

        if (toolCallId !== undefined) {
            result.toolCallId = toolCallId;
        }

        return result;
    }

    /**
     * Create a failed ToolResult.
     */
    /**
 * Normalize execution failures.
 */
    private createFailure(
        toolName: string,
        error: unknown,
        toolCallId?: string,
    ): ToolResult {
        const result: ToolResult = {
            toolName,
            success: false,
        };

        if (toolCallId !== undefined) {
            result.toolCallId = toolCallId;
        }

        if (error instanceof ToolExecutionError) {
            result.error = error.message;
            result.rawError = error;
            return result;
        }

        if (error instanceof Error) {
            result.error = error.message;
            result.rawError = error;
            return result;
        }

        result.error = String(error);
        result.rawError = error;

        return result;
    }
}


export function createToolExecutor(
    registry: ToolRegistry,
): ToolExecutor {
    return new ToolExecutor(registry);
}