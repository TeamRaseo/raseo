import type {  ToolDefinition } from "../../core/index.js";
import type { ModelProvider } from "../../providers/model.provider.js";

export interface RuntimeOptions {
 
  provider: ModelProvider;
  tools?: readonly ToolDefinition[];

  /**
   * Maximum number of reasoning iterations.
   *
   * Default: 10
   */
  maxIterations?: number;

  /**
   * Maximum number of retries for provider failures.
   *
   * Default: 2
   */
  maxRetries?: number;

  /**
   * Abort the run after this many milliseconds.
   */
  timeout?: number;

  /**
   * Enable token streaming.
   *
   * Default: false
   */
  stream?: boolean;
}