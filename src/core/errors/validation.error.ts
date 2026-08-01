import { RaseoError } from "./runtime.error.js";

export class InvalidStructuredOutputError extends RaseoError {
  readonly rawOutput: string;
  readonly validationError: unknown;

  constructor(rawOutput: string, validationError: unknown) {
    super(
      `Failed to parse structured output against schema: ${rawOutput}`,
      "INVALID_STRUCTURED_OUTPUT"
    );
    this.rawOutput = rawOutput;
    this.validationError = validationError;
  }
}
