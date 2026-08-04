import { GoogleGenAI } from "@google/genai";

import { BaseModelProvider } from "../base.model.provider.js";

import type { ProviderConfig } from "../provider.config.js";

import type {
  ModelRequest,
  ModelResponse,
  ModelStreamChunk,
  ModelStreamResponse,
} from "../provider.types.js";

import { GeminiMapper } from "./gemini.mapper.js";

type GeminiResponseStream = ReturnType<GoogleGenAI["models"]["generateContentStream"]>;

/**
 * Gemini implementation backed by the @google/genai SDK.
 */
export class GeminiProvider extends BaseModelProvider {

  readonly name = "gemini";

  protected readonly client: GoogleGenAI;

  protected readonly mapper: GeminiMapper;

  constructor(
    config: ProviderConfig,
  ) {
    super(config);

    this.client = new GoogleGenAI({
      apiKey: config.apiKey,
    });

    this.mapper = new GeminiMapper();
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
      const geminiStream =
        await this.invokeModelStream(request);

      return this.handleStreamResponse(geminiStream);

    } catch (error) {
      this.normalizeError(error);
    }
  }

  /**
   * Sends a request to Gemini.
   */
  protected async invokeModel(
    request: ModelRequest,
  ): Promise<any> {

    const geminiRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    return this.client.models.generateContent(
      geminiRequest,
    );
  }

  /**
   * Sends a streaming request to Gemini.
   */
  protected async invokeModelStream(
    request: ModelRequest,
  ): Promise<any> {

    const geminiRequest =
      this.mapper.toRequest(
        request,
        this.model,
        this.resolveTemperature(request.temperature),
        this.resolveMaxTokens(request.maxTokens),
      );

    return await this.client.models.generateContentStream(
      geminiRequest,
    );
  }

  /**
   * Converts the provider response into the SDK response.
   */
  protected handleResponse(
    response: any,
  ): ModelResponse {

    return this.attachMetadata(
      this.mapper.toModelResponse(response),
    );
  }

  /**
   * Converts the provider stream into the SDK stream response.
   */
  protected handleStreamResponse(
    geminiStream: GeminiResponseStream,
  ): ModelStreamResponse {
    const self = this;

    const streamObj = geminiStream as any;
    const finalResponsePromise: Promise<ModelResponse> = streamObj.response
      ? streamObj.response.then((finalResp: any) => self.handleResponse(finalResp))
      : Promise.resolve().then(async () => {
          let lastChunk: any = null;
          for await (const chunk of streamObj) {
            lastChunk = chunk;
          }
          return self.handleResponse(lastChunk ?? {});
        });

    finalResponsePromise.catch(() => {});

    async function* createChunkStream(): AsyncGenerator<ModelStreamChunk, void, unknown> {
      try {
        for await (const chunk of streamObj) {
          if (chunk.text) {
            yield {
              type: "text-delta",
              textDelta: chunk.text,
            };
          }

          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            for (let i = 0; i < chunk.functionCalls.length; i++) {
              const fc = chunk.functionCalls[i];
              yield {
                type: "tool-call-delta",
                toolCallIndex: i,
                ...(fc.id ? { id: fc.id } : {}),
                ...(fc.name ? { name: fc.name } : {}),
                ...(fc.args ? { argumentsDelta: JSON.stringify(fc.args) } : {}),
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
 * Creates a new GeminiProvider instance.
 */
export function createGeminiProvider(config: ProviderConfig): GeminiProvider {
  return new GeminiProvider(config);
}
