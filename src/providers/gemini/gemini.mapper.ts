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
 * GeminiMapper converts between Raseo internal types and Google Gen AI SDK types.
 */
export class GeminiMapper {
  /**
   * Converts a Raseo ModelRequest into Gemini generateContent parameters.
   */
  public toRequest(
    request: ModelRequest,
    model: string,
    temperature?: number,
    maxTokens?: number
  ): any {
    const contents = this.toInput(request.messages);
    const systemInstruction = this.toInstructions(request.messages);
    const tools = this.toTools(request.tools);
    const responseSchema = request.outputSchema;

    const config: Record<string, unknown> = {
      ...(systemInstruction !== undefined ? { systemInstruction } : {}),
      ...(tools !== undefined ? { tools } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { maxOutputTokens: maxTokens } : {}),
      ...(responseSchema !== undefined
        ? { responseMimeType: "application/json", responseSchema }
        : {}),
    };

    return {
      model,
      contents,
      ...(Object.keys(config).length > 0 ? { config } : {}),
    };
  }

  /**
   * Converts a Gemini GenerateContentResponse into Raseo's ModelResponse.
   */
  public toModelResponse(response: any): ModelResponse {
    const toolCalls = this.toToolCalls(response);
    const usage = this.toTokenUsage(response);

    return {
      message: this.toAssistantMessage(response, toolCalls),
      ...(toolCalls?.length ? { toolCalls } : {}),
      finishReason: this.toFinishReason(response, toolCalls),
      ...(usage ? { usage } : {}),
    };
  }

  /**
   * Converts ChatMessage[] into Gemini contents input.
   */
  private toInput(messages: readonly ChatMessage[]): any[] {
    const contents: any[] = [];

    for (const message of messages) {
      switch (message.role) {
        case "system":
          // System messages are handled separately in config.systemInstruction
          break;

        case "user": {
          if (typeof message.content === "string") {
            contents.push({
              role: "user",
              parts: [{ text: message.content }],
            });
          } else {
            const parts = message.content.map((part) => {
              if (part.type === "text") {
                return { text: part.text };
              }
              return {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: part.imageUrl,
                },
              };
            });

            contents.push({
              role: "user",
              parts,
            });
          }
          break;
        }

        case "assistant": {
          if (message.rawParts && message.rawParts.length > 0) {
            contents.push({
              role: "model",
              parts: message.rawParts,
            });
          } else {
            const parts: any[] = [];
            if (message.content) {
              parts.push({ text: message.content });
            }

            if (message.toolCalls && message.toolCalls.length > 0) {
              for (const toolCall of message.toolCalls) {
                if (toolCall.rawFunctionCall) {
                  parts.push({
                    functionCall: toolCall.rawFunctionCall,
                  });
                } else {
                  parts.push({
                    functionCall: {
                      name: toolCall.name,
                      args: toolCall.arguments,
                    },
                  });
                }
              }
            }

            if (parts.length > 0) {
              contents.push({
                role: "model",
                parts,
              });
            }
          }
          break;
        }

        case "tool": {
          let parsedOutput: Record<string, unknown>;
          try {
            parsedOutput = JSON.parse(message.content);
          } catch {
            parsedOutput = { output: message.content };
          }

          contents.push({
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: message.toolName,
                  response: parsedOutput,
                },
              },
            ],
          });
          break;
        }
      }
    }

    return contents;
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
   * Converts ToolSpec or ToolDefinition into Gemini tools parameter.
   */
  private toTools(tools?: readonly (ToolSpec | ToolDefinition)[]): any[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    const functionDeclarations = tools.map((toolInput) => {
      const tool = toToolSpec(toolInput);
      return {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      };
    });

    return [{ functionDeclarations }];
  }

  /**
   * Extracts assistant text into AssistantMessage.
   */
  private toAssistantMessage(
    response: any,
    toolCalls?: readonly ToolCall[]
  ): AssistantMessage {
    const rawParts = response.candidates?.[0]?.content?.parts;
    return {
      role: "assistant",
      content: this.extractText(response),
      ...(toolCalls?.length ? { toolCalls } : {}),
      ...(rawParts ? { rawParts } : {}),
    };
  }

  /**
   * Safely extracts text from candidate parts without triggering @google/genai getter warning.
   */
  private extractText(response: any): string {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || !Array.isArray(parts)) {
      return "";
    }
    return parts
      .filter((p: any) => typeof p.text === "string")
      .map((p: any) => p.text)
      .join("");
  }

  /**
   * Extracts Gemini function calls and converts them into SDK ToolCalls.
   */
  private toToolCalls(response: any): ToolCall[] | undefined {
    let functionCalls: any[] | undefined;

    if (typeof response.functionCalls === "function") {
      functionCalls = response.functionCalls();
    } else if (response.functionCalls && Array.isArray(response.functionCalls)) {
      functionCalls = response.functionCalls;
    } else if (response.candidates?.[0]?.content?.parts) {
      functionCalls = response.candidates[0].content.parts
        .filter((p: any) => p.functionCall)
        .map((p: any) => p.functionCall);
    }

    if (!functionCalls || functionCalls.length === 0) {
      return undefined;
    }

    const toolCalls: ToolCall[] = [];
    for (let i = 0; i < functionCalls.length; i++) {
      const fc = functionCalls[i];
      toolCalls.push({
        id: fc.id ?? `call_gemini_${i}_${Date.now()}`,
        name: fc.name,
        arguments: fc.args ?? {},
        rawFunctionCall: fc,
      });
    }

    return toolCalls.length > 0 ? toolCalls : undefined;
  }

  /**
   * Converts Gemini status into SDK FinishReason.
   */
  private toFinishReason(
    response: any,
    toolCalls?: readonly ToolCall[]
  ): FinishReason {
    if (toolCalls?.length) {
      return "tool_calls";
    }

    const rawReason = response.candidates?.[0]?.finishReason;
    switch (rawReason) {
      case "STOP":
        return "stop";
      case "MAX_TOKENS":
        return "length";
      case "SAFETY":
      case "RECITATION":
        return "content_filter";
      default:
        return "stop";
    }
  }

  /**
   * Maps token usage from Gemini response to SDK TokenUsage.
   */
  private toTokenUsage(response: any): TokenUsage | undefined {
    const usage = response.usageMetadata;
    if (!usage) {
      return undefined;
    }

    return {
      promptTokens: usage.promptTokenCount ?? 0,
      completionTokens: usage.candidatesTokenCount ?? 0,
      totalTokens: usage.totalTokenCount ?? 0,
    };
  }
}
