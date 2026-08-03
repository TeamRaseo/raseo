import OpenAI from "openai";

import type {
  Response,
} from "openai/resources/responses/responses.js";

import { BaseModelProvider } from "../base.model.provider.js";

import type { ProviderConfig } from "../provider.config.js";

import type {
  ModelRequest,
  ModelResponse,
} from "../provider.types.js";

import { OpenAIMapper } from "./openai.mapper.js";

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
   * Converts the provider response into the SDK response.
   */
  protected handleResponse(
    response: Response,
  ): ModelResponse {

    return this.attachMetadata(
      this.mapper.toModelResponse(response),
    );
  }

}