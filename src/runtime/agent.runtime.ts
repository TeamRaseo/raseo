import type {
  AgentConfig,
  AgentRunContext,
  AgentRunResult,
  ChatMessage,
  SystemMessage,
  ToolResponseMessage,
} from "../core/index.js";

import { createToolRegistry } from "../tool/tool.registry.js";
import { createToolExecutor } from "../tool/tool.executor.js";

export class AgentRuntime {
  constructor(private readonly config: AgentConfig) {}

  async run(
    input: string | readonly ChatMessage[],
    options: { maxTurns?: number; signal?: AbortSignal; sessionId?: string } = {}
  ): Promise<AgentRunResult> {
    const maxTurns = options.maxTurns ?? 10;
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const runContext: AgentRunContext = {
      runId,
      turnCount: 0,
      maxTurns,
      currentAgentName: this.config.name,
      metadata: {},
      ...(options.sessionId !== undefined ? { sessionId: options.sessionId } : {}),
      ...(options.signal !== undefined ? { signal: options.signal } : {}),
    };

    // Resolve system instructions
    const instructionsText =
      typeof this.config.instructions === "function"
        ? await this.config.instructions(runContext)
        : this.config.instructions;

    const messages: ChatMessage[] = [];

    if (instructionsText && instructionsText.trim().length > 0) {
      messages.push({
        role: "system",
        content: instructionsText,
      } as SystemMessage);
    }

    if (typeof input === "string") {
      messages.push({
        role: "user",
        content: input,
      });
    } else {
      messages.push(...input);
    }

    // Set up tool execution engine
    const tools = this.config.tools ?? [];
    const registry = createToolRegistry(tools);
    const executor = createToolExecutor(registry);

    let turnCount = 0;

    while (turnCount < maxTurns) {
      if (options.signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }

      turnCount++;

      const modelRequest = {
        messages,
        tools,
        ...(options.signal !== undefined ? { signal: options.signal } : {}),
      };

      const response = await this.config.model.generate(modelRequest);

      messages.push(response.message);

      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const toolContext = {
            runId,
            currentAgentName: this.config.name,
            ...(options.sessionId !== undefined ? { sessionId: options.sessionId } : {}),
            ...(options.signal !== undefined ? { signal: options.signal } : {}),
          };

          const toolResult = await executor.executeCall(toolCall, {
            context: toolContext,
          });

          const contentString = toolResult.success
            ? typeof toolResult.data === "string"
              ? toolResult.data
              : JSON.stringify(toolResult.data)
            : `Error: ${toolResult.error ?? "Tool execution failed"}`;

          const toolResponseMsg: ToolResponseMessage = {
            role: "tool",
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            content: contentString,
          };

          messages.push(toolResponseMsg);
        }
      } else {
        // No further tool calls, loop complete
        break;
      }
    }

    const lastMessage = messages[messages.length - 1];
    const outputText =
      lastMessage?.role === "assistant" && typeof lastMessage.content === "string"
        ? lastMessage.content
        : "";

    return {
      output: outputText,
      messages,
      turnCount,
      finalAgentName: this.config.name,
    };
  }
}

/**
 * Convenience helper to run an agent with given input and config.
 */
export async function runAgent(
  config: AgentConfig,
  input: string | readonly ChatMessage[],
  options: { maxTurns?: number; signal?: AbortSignal; sessionId?: string } = {}
): Promise<AgentRunResult> {
  const runtime = new AgentRuntime(config);
  return runtime.run(input, options);
}
