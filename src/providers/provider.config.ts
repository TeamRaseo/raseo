export interface ProviderConfig {
    readonly apiKey: string;
    readonly model: string;

    readonly baseURL?: string;
    readonly timeout?: number;
    readonly maxRetries?: number;
    readonly organization?: string;
    readonly headers?: Record<string, string>;
}