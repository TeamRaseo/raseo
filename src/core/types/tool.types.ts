import type { z } from "zod";
import type { ToolCall } from "./message.types.js";

export type { ToolCall };

export interface ToolContext {
  runId?: string;
  sessionId?: string;
  currentAgentName?: string;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
}

export interface GuardrailResult {
  passed: boolean;
  reason?: string;
}

export type ToolGuardrailHook = (
  input: unknown,
  context?: ToolContext
) => Promise<GuardrailResult> | GuardrailResult;

/**
 * Pure contract for a tool definition.
 */
export interface ToolDefinition<
  TSchema extends z.ZodType = z.ZodType,
  TResult = unknown
> {
  name: string;
  description: string;
  input: TSchema;
  execute: (input: z.infer<TSchema>, context?: ToolContext) => Promise<TResult> | TResult;
  guardrail?: ToolGuardrailHook;
}

/**
 * Alias for ToolDefinition contract.
 */
export type Tool<
  TSchema extends z.ZodType = z.ZodType,
  TResult = unknown
> = ToolDefinition<TSchema, TResult>;

export interface ToolResult<TData = unknown> {
  toolCallId?: string;
  toolName: string;
  success: boolean;
  data?: TData;
  error?: string;
  rawError?: unknown;
}

export interface ToolExecutionOptions {
  context?: ToolContext;
  signal?: AbortSignal;
}
