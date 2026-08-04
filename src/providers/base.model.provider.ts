import type {
    ModelProvider,
} from "./model.provider.js";
import type { ProviderConfig } from "./provider.config.js";

import type {
    ModelRequest,
    ModelResponse,
    ModelStreamResponse,
    ProviderMetadata,
} from "./provider.types.js";

export abstract class BaseModelProvider implements ModelProvider {
    abstract readonly name: string;

    protected readonly config: ProviderConfig;

    protected constructor(config: ProviderConfig) {
        this.config = config;
    }

    get model(): string {
        return this.config.model;
    }

    abstract generate(
        request: ModelRequest,
    ): Promise<ModelResponse>;

    abstract stream(
        request: ModelRequest,
    ): Promise<ModelStreamResponse>;



    /**
      Validate a request before sending it to a model.
     **/
    protected validateRequest(
        request: ModelRequest,
    ): void {
        this.ensureMessages(request);

        this.ensureNotAborted(request.signal);
    }

    protected ensureMessages(
        request: ModelRequest,
    ): void {
        if (request.messages.length === 0) {
            throw new Error(
                "ModelRequest must contain at least one message.",
            );
        }
    }


    protected ensureNotAborted(
        signal?: AbortSignal,
    ): void {
        if (signal?.aborted) {
            throw new DOMException(
                "The operation was aborted.",
                "AbortError",
            );
        }
    }

    /**
     * Create provider metadata attached to responses.
     */
    protected createMetadata(): ProviderMetadata {
        return {
            provider: this.name,
            model: this.model,
        };
    }

    protected resolveTemperature(
        temperature?: number,
    ): number | undefined {
        return temperature;
    }


    protected resolveMaxTokens(
        maxTokens?: number,
    ): number | undefined {
        return maxTokens;
    }


    protected getMessages(
        request: ModelRequest,
    ) {
        return request.messages;
    }


    protected getTools(
        request: ModelRequest,
    ) {
        return request.tools ?? [];
    }


    protected getOutputSchema(
        request: ModelRequest,
    ) {
        return request.outputSchema;
    }


    protected attachMetadata(
        response: ModelResponse,
    ): ModelResponse {
        return {
            ...response,
            metadata: this.createMetadata(),
        };
    }



    protected normalizeError(
        error: unknown,
    ): never {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error(String(error));
    }
}