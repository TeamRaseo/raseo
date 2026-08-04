import type {
    Response,
    ResponseCreateParams,
    ResponseInput,
    ResponseInputContent,
    ResponseInputItem,
    ResponseTextConfig,
    ResponseCreateParamsNonStreaming,
    Tool,
} from "openai/resources/responses/responses.js";

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

//   OpenAIMapper converts between Raseo internal types and OpenAI SDK (Responses API) types.

export class OpenAIMapper {

    //   Converts a Raseo ModelRequest into OpenAI ResponseCreateParams.

    public toRequest(
        request: ModelRequest,
        model: string,
        temperature?: number,
        maxTokens?: number,
    ): ResponseCreateParamsNonStreaming {
        const input = this.toInput(request.messages);
        const instructions = this.toInstructions(request.messages);
        const tools = this.toTools(request.tools);
        const textFormat = this.toResponseFormat(request.outputSchema);

        const params: ResponseCreateParamsNonStreaming = {
            model,
            input,
            ...(instructions !== undefined ? { instructions } : {}),
            ...(tools !== undefined ? { tools } : {}),
            ...(textFormat !== undefined ? { text: textFormat } : {}),
            ...(temperature !== undefined ? { temperature } : {}),
            ...(maxTokens !== undefined ? { max_output_tokens: maxTokens } : {}),
        };

        return params;
    }


    //   Converts an OpenAI Response into Raseo's ModelResponse.

    public toModelResponse(
        response: Response,
    ): ModelResponse {
        const toolCalls = this.toToolCalls(response);

        const usage = this.toTokenUsage(response);

        return {
            message: this.toAssistantMessage(
                response,
                toolCalls,
            ),

            ...(toolCalls?.length
                ? { toolCalls }
                : {}),

            finishReason: this.toFinishReason(
                response,
                toolCalls,
            ),

            ...(usage
                ? { usage }
                : {}),
        };
    }


    //  Converts ChatMessage[] into OpenAI Responses API input.

    private toInput(messages: readonly ChatMessage[]): ResponseInput {
        const items: ResponseInputItem[] = [];

        for (const message of messages) {
            switch (message.role) {
                case "system": {
                    items.push({
                        type: "message",
                        role: "system",
                        content: message.content,
                    });
                    break;
                }

                case "user": {
                    if (typeof message.content === "string") {
                        items.push({
                            type: "message",
                            role: "user",
                            content: message.content,
                        });
                    } else {
                        const contentParts: ResponseInputContent[] = message.content.map(
                            (part) => {
                                if (part.type === "text") {
                                    return {
                                        type: "input_text",
                                        text: part.text,
                                    };
                                }
                                return {
                                    type: "input_image",
                                    image_url: part.imageUrl,
                                    detail: "auto",
                                };
                            }
                        );

                        items.push({
                            type: "message",
                            role: "user",
                            content: contentParts,
                        });
                    }
                    break;
                }

                case "assistant": {
                    if (message.content) {
                        items.push({
                            type: "message",
                            role: "assistant",
                            content: message.content,
                        });
                    }

                    if (message.toolCalls && message.toolCalls.length > 0) {
                        for (const toolCall of message.toolCalls) {
                            items.push({
                                type: "function_call",
                                call_id: toolCall.id,
                                name: toolCall.name,
                                arguments:
                                    typeof toolCall.arguments === "string"
                                        ? toolCall.arguments
                                        : JSON.stringify(toolCall.arguments),
                            });
                        }
                    }
                    break;
                }

                case "tool": {
                    items.push({
                        type: "function_call_output",
                        call_id: message.toolCallId,
                        output: message.content,
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
     * Converts ToolSpec or ToolDefinition into OpenAI tool definitions.
     */
    private toTools(tools?: readonly (ToolSpec | ToolDefinition)[]): Tool[] | undefined {
        if (!tools || tools.length === 0) {
            return undefined;
        }

        return tools.map((toolInput) => {
            const tool = toToolSpec(toolInput);
            return {
                type: "function",
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
                strict: null,
            };
        });
    }


    private toResponseFormat(
        outputSchema?: Record<string, unknown>
    ): ResponseTextConfig | undefined {
        if (!outputSchema || Object.keys(outputSchema).length === 0) {
            return undefined;
        }

        return {
            format: {
                type: "json_schema",
                name: "response_format",
                schema: outputSchema,
                strict: true,
            },
        };
    }


    //  Extracts assistant text and optional tool calls into an AssistantMessage.

    private toAssistantMessage(
        response: Response,
        toolCalls?: readonly ToolCall[],
    ): AssistantMessage {
        return {
            role: "assistant",

            content: response.output_text ?? "",

            ...(toolCalls?.length
                ? { toolCalls }
                : {}),
        };
    }

    //  Extracts OpenAI function calls and converts them into SDK ToolCalls.

    private toToolCalls(
        response: Response,
    ): ToolCall[] | undefined {
        if (!response.output?.length) {
            return undefined;
        }

        const toolCalls: ToolCall[] = [];

        for (const item of response.output) {
            if (item.type !== "function_call") {
                continue;
            }

            toolCalls.push({
                id: item.call_id,
                name: item.name,
                arguments: this.parseArguments(item.arguments),
            });
        }

        return toolCalls.length > 0
            ? toolCalls
            : undefined;
    }

    //parse arguments

    private parseArguments(
        argumentsJson: string,
    ): Record<string, unknown> {
        try {
            const parsed = JSON.parse(argumentsJson);

            if (
                parsed !== null &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
            ) {
                return parsed as Record<string, unknown>;
            }
        } catch {
            // Ignore invalid JSON.
        }

        return {};
    }


    // Converts OpenAI status into SDK FinishReason.

    private toFinishReason(
        response: Response,
        toolCalls?: readonly ToolCall[],
    ): FinishReason {
        if (toolCalls?.length) {
            return "tool_calls";
        }

        switch (response.status) {
            case "completed":
                return "stop";

            case "incomplete":
                return "length";

            case "failed":
            case "cancelled":
                return "error";

            case "queued":
            case "in_progress":
                return "error";

            default:
                return "error";
        }
    }

    //   Maps token usage from OpenAI response to SDK TokenUsage.

    private toTokenUsage(response: Response): TokenUsage | undefined {
        if (!response.usage) {
            return undefined;
        }

        return {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.total_tokens,
        };
    }
}