export interface GuardrailResult {
  passed: boolean;
  reason?: string;
}

export type GuardrailFn = (input: unknown) => Promise<GuardrailResult> | GuardrailResult;
