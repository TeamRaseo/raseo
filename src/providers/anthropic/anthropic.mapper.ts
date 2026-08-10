import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  MessageCreateParamsNonStreaming,
  Message,
  Tool,
  Usage,
} from "@anthropic-ai/sdk/resources/messages.js";

import type {
  AssistantMessage,
  ChatMessage,
  SystemMessage,
  ToolCall,
} from "../../core/types/message.types.js";

import type { ToolDefinition } from "../../core/types/tool.types.js";

import type {
  FinishReason,
  ModelRequest,
  ModelResponse,
  TokenUsage,
  ToolSpec,
} from "../provider.types.js";

import { toToolSpec } from "../../tool/tool.js";

/**
 * AnthropicMapper converts between Raseo internal types and Anthropic SDK types.
 */
export class AnthropicMapper {
  /**
   * Converts a Raseo ModelRequest into Anthropic MessageCreateParams.
   */
  public toRequest(
    request: ModelRequest,
    model: string,
    temperature?: number,
    maxTokens?: number
  ): MessageCreateParamsNonStreaming {
    const input = this.toInput(request.messages);
    const system = this.toInstructions(request.messages);
    const tools = this.toTools(request.tools);

    const params: MessageCreateParamsNonStreaming = {
      model,
      messages: input,
      max_tokens: maxTokens ?? 4096,
      ...(system !== undefined ? { system } : {}),
      ...(tools !== undefined ? { tools } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
    };

    return params;
  }

  /**
   * Converts an Anthropic Message into Raseo's ModelResponse.
   */
  public toModelResponse(message: Message): ModelResponse {
    const toolCalls = this.toToolCalls(message);
    const usage = this.toTokenUsage(message.usage);

    return {
      message: this.toAssistantMessage(message, toolCalls),
      ...(toolCalls?.length ? { toolCalls } : {}),
      finishReason: this.toFinishReason(message.stop_reason, toolCalls),
      ...(usage ? { usage } : {}),
    };
  }

  /**
   * Converts ChatMessage[] into Anthropic MessageParam[].
   */
  private toInput(messages: readonly ChatMessage[]): MessageParam[] {
    const items: MessageParam[] = [];

    for (const message of messages) {
      switch (message.role) {
        case "system":
          // System messages are handled separately in top-level system parameter
          break;

        case "user": {
          if (typeof message.content === "string") {
            items.push({
              role: "user",
              content: message.content,
            });
          } else {
            const contentBlocks = message.content.map((part) => {
              if (part.type === "text") {
                return {
                  type: "text" as const,
                  text: part.text,
                };
              }

              let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
              let base64Data = part.imageUrl;

              if (part.imageUrl.startsWith("data:")) {
                const matches = part.imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
                if (matches && matches[1] && matches[2]) {
                  mediaType = matches[1] as any;
                  base64Data = matches[2];
                }
              }

              return {
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: mediaType,
                  data: base64Data,
                },
              };
            });

            items.push({
              role: "user",
              content: contentBlocks,
            });
          }
          break;
        }

        case "assistant": {
          const contentBlocks: Array<
            | { type: "text"; text: string }
            | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
          > = [];

          if (message.content) {
            contentBlocks.push({
              type: "text",
              text: message.content,
            });
          }

          if (message.toolCalls && message.toolCalls.length > 0) {
            for (const toolCall of message.toolCalls) {
              contentBlocks.push({
                type: "tool_use",
                id: toolCall.id,
                name: toolCall.name,
                input: toolCall.arguments,
              });
            }
          }

          if (contentBlocks.length > 0) {
            items.push({
              role: "assistant",
              content: contentBlocks as any,
            });
          }
          break;
        }

        case "tool": {
          items.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: message.toolCallId,
                content: message.content,
              },
            ],
          });
          break;
        }
      }
    }

    return items;
  }

  /**
   * Extracts system instructions from System messages.
   */
  private toInstructions(messages: readonly ChatMessage[]): string | undefined {
    const systemContents = messages
      .filter((msg): msg is SystemMessage => msg.role === "system")
      .map((msg) => msg.content)
      .filter((content) => content.trim().length > 0);

    return systemContents.length > 0 ? systemContents.join("\n\n") : undefined;
  }

  /**
   * Converts ToolSpec or ToolDefinition into Anthropic tools parameter.
   */
  private toTools(tools?: readonly (ToolSpec | ToolDefinition)[]): Tool[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map((toolInput) => {
      const tool = toToolSpec(toolInput);
      return {
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters as Tool.InputSchema,
      };
    });
  }

  /**
   * Extracts assistant text into AssistantMessage.
   */
  private toAssistantMessage(
    message: Message,
    toolCalls?: readonly ToolCall[]
  ): AssistantMessage {
    const textParts = message.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text as string)
      .join("");

    return {
      role: "assistant",
      content: textParts,
      ...(toolCalls?.length ? { toolCalls } : {}),
      rawParts: message.content,
    };
  }

  /**
   * Extracts Anthropic tool_use blocks and converts them into SDK ToolCalls.
   */
  private toToolCalls(message: Message): ToolCall[] | undefined {
    const toolUseBlocks = message.content.filter(
      (block: any) => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      return undefined;
    }

    const toolCalls: ToolCall[] = toolUseBlocks.map((block: any) => ({
      id: block.id,
      name: block.name,
      arguments: block.input ?? {},
      rawFunctionCall: block as unknown as Record<string, unknown>,
    }));

    return toolCalls;
  }

  /**
   * Converts Anthropic stop_reason into SDK FinishReason.
   */
  private toFinishReason(
    stopReason: string | null,
    toolCalls?: readonly ToolCall[]
  ): FinishReason {
    if (toolCalls?.length || stopReason === "tool_use") {
      return "tool_calls";
    }

    switch (stopReason) {
      case "end_turn":
      case "stop_sequence":
        return "stop";
      case "max_tokens":
        return "length";
      default:
        return "stop";
    }
  }

  /**
   * Maps token usage from Anthropic response to SDK TokenUsage.
   */
  private toTokenUsage(usage: Usage): TokenUsage {
    return {
      promptTokens: usage.input_tokens ?? 0,
      completionTokens: usage.output_tokens ?? 0,
      totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
    };
  }
}
