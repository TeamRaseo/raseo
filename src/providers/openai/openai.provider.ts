import OpenAI from "openai";

import type {
  Response,
} from "openai/resources/responses/responses.js";

import { BaseModelProvider } from "../base.model.provider.js";

import type { ProviderConfig } from "../provider.config.js";

import type {
  ModelRequest,
  ModelResponse,
  ModelStreamChunk,
  ModelStreamResponse,
} from "../provider.types.js";

import { OpenAIMapper } from "./openai.mapper.js";

type OpenAIResponseStream = ReturnType<OpenAI["responses"]["stream"]>;

/**
 * OpenAI implementation backed by the Responses API.
 */
export class OpenAIProvider extends BaseModelProvider {

  readonly name = "openai";

  protected readonly client: OpenAI;

  protected readonly mapper: OpenAIMapper;

  constructor(
    config: ProviderConfig,
  ) {
    super(config);

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      organization: config.organization,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      defaultHeaders: config.headers,
    });

    this.mapper = new OpenAIMapper();
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
      const openAIStream =
        await this.invokeModelStream(request);

      return this.handleStreamResponse(openAIStream);

    } catch (error) {
      this.normalizeError(error);
    }
  }

  /**
   * Sends a request to OpenAI.
   */
  protected async invokeModel(
    request: ModelRequest,
  ): Promise<Response> {

    const openAIRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    return this.client.responses.create(
      openAIRequest,
    );
  }

  /**
   * Sends a streaming request to OpenAI.
   */
  protected async invokeModelStream(
    request: ModelRequest,
  ): Promise<OpenAIResponseStream> {

    const openAIRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    const { stream: _stream, ...streamParams } = openAIRequest;

    return this.client.responses.stream(
      streamParams,
    );
  }

  /**
   * Converts the provider response into the SDK response.
   */
  protected handleResponse(
    response: Response,
  ): ModelResponse {

    return this.attachMetadata(
      this.mapper.toModelResponse(response),
    );
  }

  /**
   * Converts the provider stream into the SDK stream response.
   */
  protected handleStreamResponse(
    openAIStream: OpenAIResponseStream,
  ): ModelStreamResponse {
    const self = this;

    const finalResponsePromise: Promise<ModelResponse> = openAIStream
      .finalResponse()
      .then((finalResp) => self.handleResponse(finalResp));

    finalResponsePromise.catch(() => {});

    async function* createChunkStream(): AsyncGenerator<ModelStreamChunk, void, unknown> {
      try {
        for await (const event of openAIStream) {
          if (event.type === "response.output_text.delta" && event.delta) {
            yield {
              type: "text-delta",
              textDelta: event.delta,
            };
          } else if (event.type === "response.function_call_arguments.delta") {
            yield {
              type: "tool-call-delta",
              toolCallIndex: event.output_index ?? 0,
              ...(event.item_id ? { id: event.item_id } : {}),
              ...(event.delta ? { argumentsDelta: event.delta } : {}),
            };
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