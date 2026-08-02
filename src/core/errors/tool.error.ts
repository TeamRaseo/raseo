import { RaseoError } from "./runtime.error.js";

export class ToolExecutionError extends RaseoError {
  readonly toolName: string;
  readonly cause: unknown;

  constructor(toolName: string, message: string, cause?: unknown) {
    super(`Tool '${toolName}' execution failed: ${message}`, "TOOL_EXECUTION_FAILED");
    this.toolName = toolName;
    this.cause = cause;
  }
}
export class ToolRegistryError extends RaseoError {
  readonly toolName: string;

  constructor(toolName: string, message: string) {
    super(
      `Tool registry error for '${toolName}': ${message}`,
      "TOOL_REGISTRY_ERROR"
    );

    this.toolName = toolName;
  }
}
