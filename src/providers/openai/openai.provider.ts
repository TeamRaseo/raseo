import OpenAI from "openai";
import { BaseModelProvider } from "../base.model.provider.js";
import type { ProviderConfig } from "../provider.config.js";
import type { FinishReason, ModelRequest, ModelResponse, TokenUsage } from "../provider.types.js";
import type { Response, ResponseCreateParams } from "openai/resources/responses/responses.js";
import type { ToolCall } from "../../core/index.js";



export class OpenAIProvider extends BaseModelProvider {
  readonly name = "openai";

  protected readonly client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      defaultHeaders: config.headers,
    });
  }

  /**
   * Generates a response using the OpenAI Responses API.
   */
  async generate(
    request: ModelRequest,
  ): Promise<ModelResponse> {
    this.validateRequest(request);

    try {
      const response = await this.createResponse(request);

      return this.handleResponse(response);
    } catch (error) {
      this.normalizeError(error);
    }
  }

  
  protected async createResponse(
    request: ModelRequest,
  ): Promise<Response> {
    const response = await this.client.responses.create({
      model: this.model,

      input: this.getMessages(request),

      temperature: this.resolveTemperature(
        request.temperature,
      ),

      max_output_tokens: this.resolveMaxTokens(
        request.maxTokens,
      ),
    } satisfies ResponseCreateParams);

    return response;
  }

  /**
   * Converts an OpenAI response into a ModelResponse.
   */
  protected handleResponse(
    response: Response,
  ): ModelResponse {
    return this.attachMetadata({
      message: this.toAssistantMessage(response),

      // toolCalls: this.toToolCalls(response),

      finishReason: this.toFinishReason(response),

      // usage: this.toTokenUsage(response),
    });
  }

  private toAssistantMessage(
    response: Response,
  ): ModelResponse["message"] {
    return {
      role: "assistant",
      content: response.output_text ?? "",
    };
  }
  private toFinishReason(
    response: Response,
  ): FinishReason {
    switch (response.status) {
      case "completed":
        return "stop";

      case "failed":
        return "error";

      case "incomplete":
        return "length";

      case "cancelled":
        return "error";

      case "queued":
      case "in_progress":
        return "error";

      default:
        return "stop";
    }
  }

  private toTokenUsage(
    response: Response,
  ): TokenUsage | undefined {
    if (!response.usage) {
      return undefined;
    }

    return {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }
  private toToolCalls(
    _response: Response,
  ): ToolCall[] | undefined {
    return undefined;
  }
}