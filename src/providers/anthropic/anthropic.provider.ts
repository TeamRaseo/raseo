import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages.js";

import { BaseModelProvider } from "../base.model.provider.js";

import type { ProviderConfig } from "../provider.config.js";

import type {
  ModelRequest,
  ModelResponse,
  ModelStreamChunk,
  ModelStreamResponse,
} from "../provider.types.js";

import { AnthropicMapper } from "./anthropic.mapper.js";

type AnthropicResponseStream = ReturnType<Anthropic["messages"]["stream"]>;

/**
 * Anthropic implementation backed by the @anthropic-ai/sdk.
 */
export class AnthropicProvider extends BaseModelProvider {

  readonly name = "anthropic";

  protected readonly client: Anthropic;

  protected readonly mapper: AnthropicMapper;

  constructor(
    config: ProviderConfig,
  ) {
    super(config);

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      defaultHeaders: config.headers,
    });

    this.mapper = new AnthropicMapper();
  }

  /**
   * Generates a model response.
   */
  async generate(
    request: ModelRequest,
  ): Promise<ModelResponse> {
    this.validateRequest(request);

    try {
      const response =
        await this.invokeModel(request);

      return this.handleResponse(response);

    } catch (error) {
      this.normalizeError(error);
    }
  }

  /**
   * Streams a model response.
   */
  async stream(
    request: ModelRequest,
  ): Promise<ModelStreamResponse> {
    this.validateRequest(request);

    try {
      const anthropicStream =
        await this.invokeModelStream(request);

      return this.handleStreamResponse(anthropicStream);

    } catch (error) {
      this.normalizeError(error);
    }
  }

  /**
   * Sends a request to Anthropic.
   */
  protected async invokeModel(
    request: ModelRequest,
  ): Promise<Message> {

    const anthropicRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    return this.client.messages.create(
      anthropicRequest,
    );
  }

  /**
   * Sends a streaming request to Anthropic.
   */
  protected async invokeModelStream(
    request: ModelRequest,
  ): Promise<AnthropicResponseStream> {

    const anthropicRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    return this.client.messages.stream(
      anthropicRequest,
    );
  }

  /**
   * Converts the provider response into the SDK response.
   */
  protected handleResponse(
    response: Message,
  ): ModelResponse {

    return this.attachMetadata(
      this.mapper.toModelResponse(response),
    );
  }

  /**
   * Converts the provider stream into the SDK stream response.
   */
  protected handleStreamResponse(
    anthropicStream: AnthropicResponseStream,
  ): ModelStreamResponse {
    const self = this;

    const finalResponsePromise: Promise<ModelResponse> = anthropicStream
      .finalMessage()
      .then((finalMsg: Message) => self.handleResponse(finalMsg));

    finalResponsePromise.catch(() => {});

    async function* createChunkStream(): AsyncGenerator<ModelStreamChunk, void, unknown> {
      try {
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta as any;
            if (delta.type === "text_delta" && delta.text) {
              yield {
                type: "text-delta",
                textDelta: delta.text,
              };
            } else if (delta.type === "input_json_delta" && delta.partial_json) {
              yield {
                type: "tool-call-delta",
                toolCallIndex: event.index,
                argumentsDelta: delta.partial_json,
              };
            }
          } else if (event.type === "content_block_start") {
            const block = event.content_block as any;
            if (block.type === "tool_use") {
              yield {
                type: "tool-call-delta",
                toolCallIndex: event.index,
                id: block.id,
                name: block.name,
              };
            }
          }
        }

        const response = await finalResponsePromise;
        yield {
          type: "finish",
          finishReason: response.finishReason,
          ...(response.usage ? { usage: response.usage } : {}),
          ...(response.metadata ? { metadata: response.metadata } : {}),
        };
      } catch (error) {
        const normalizedErr =
          error instanceof Error ? error : new Error(String(error));
        yield {
          type: "error",
          error: normalizedErr,
        };
        throw normalizedErr;
      }
    }

    async function* createTextStream(): AsyncGenerator<string, void, unknown> {
      for await (const chunk of createChunkStream()) {
        if (chunk.type === "text-delta") {
          yield chunk.textDelta;
        }
      }
    }

    return {
      [Symbol.asyncIterator]() {
        return createChunkStream();
      },
      textStream: createTextStream(),
      response: finalResponsePromise,
    };
  }

}

/**
 * Creates a new AnthropicProvider instance.
 */
export function createAnthropicProvider(config: ProviderConfig): AnthropicProvider {
  return new AnthropicProvider(config);
}
