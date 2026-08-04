import type { z } from "zod";
import type { ToolDefinition, ToolContext, ToolGuardrailHook } from "../core/types/tool.types.js";
import type { ToolSpec } from "../providers/provider.types.js";

export interface ToolConfig<
  TSchema extends z.ZodType,
  TResult = unknown
> {
  name: string;
  description: string;
  input: TSchema;
  execute: (input: z.infer<TSchema>, context?: ToolContext) => Promise<TResult> | TResult;
  guardrail?: ToolGuardrailHook;
}

/**
 * Developer-facing helper function to define a tool with automatic input type inference.
 *
 * Example:
 * ```ts
 * const weather = tool({
 *   name: "weather",
 *   description: "Get current weather",
 *   input: z.object({ city: z.string() }),
 *   async execute({ city }) {
 *     return { temperature: 32, condition: "Sunny" };
 *   }
 * });
 * ```
 */
export function tool<TSchema extends z.ZodType, TResult = unknown>(
  config: ToolConfig<TSchema, TResult>
): ToolDefinition<TSchema, TResult> {
  return {
    name: config.name,
    description: config.description,
    input: config.input,
    execute: config.execute,
    ...(config.guardrail ? { guardrail: config.guardrail } : {}),
  };
}

/**
 * Alias for `tool()` developer helper function.
 */
export const createTool = tool;

/**
 * Converts a Zod schema object into a JSON Schema object for LLM function parameters.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (!schema) {
    return { type: "object", properties: {} };
  }

  return parseZodType(schema);
}

function parseZodType(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = schema._def;
  const description = def?.description ?? (schema as any).description;

  const result: Record<string, unknown> = {};

  if (description) {
    result.description = description;
  }

  const typeName = def?.typeName;

  switch (typeName) {
    case "ZodString":
      result.type = "string";
      break;

    case "ZodNumber":
      result.type = "number";
      break;

    case "ZodBoolean":
      result.type = "boolean";
      break;

    case "ZodArray":
      result.type = "array";
      if (def.type) {
        result.items = parseZodType(def.type);
      }
      break;

    case "ZodEnum":
      result.type = "string";
      result.enum = def.values;
      break;

    case "ZodNativeEnum":
      result.type = "string";
      result.enum = Object.values(def.values);
      break;

    case "ZodObject": {
      result.type = "object";
      const shape = typeof def.shape === "function" ? def.shape() : def.shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      if (shape) {
        for (const [key, childSchema] of Object.entries(shape)) {
          const fieldSchema = childSchema as z.ZodTypeAny;
          properties[key] = parseZodType(fieldSchema);

          if (!isOptionalZodType(fieldSchema)) {
            required.push(key);
          }
        }
      }

      result.properties = properties;
      if (required.length > 0) {
        result.required = required;
      }
      break;
    }

    case "ZodOptional":
    case "ZodNullable":
    case "ZodDefault":
      if (def.innerType) {
        const innerParsed = parseZodType(def.innerType);
        Object.assign(result, innerParsed);
      }
      break;

    case "ZodEffects":
      if (def.schema) {
        Object.assign(result, parseZodType(def.schema));
      }
      break;

    default:
      if (def?.shape) {
        result.type = "object";
        const shape = typeof def.shape === "function" ? def.shape() : def.shape;
        const properties: Record<string, unknown> = {};
        const required: string[] = [];

        for (const [key, childSchema] of Object.entries(shape)) {
          const fieldSchema = childSchema as z.ZodTypeAny;
          properties[key] = parseZodType(fieldSchema);
          if (!isOptionalZodType(fieldSchema)) {
            required.push(key);
          }
        }
        result.properties = properties;
        if (required.length > 0) {
          result.required = required;
        }
      } else {
        result.type = "object";
      }
      break;
  }

  return result;
}

function isOptionalZodType(schema: z.ZodTypeAny): boolean {
  const typeName = schema._def?.typeName;
  if (typeName === "ZodOptional" || typeName === "ZodNullable" || typeName === "ZodDefault") {
    return true;
  }
  return false;
}

/**
 * Converts a ToolDefinition or ToolSpec into a normalized ToolSpec for LLM providers.
 */
export function toToolSpec(tool: ToolSpec | ToolDefinition): ToolSpec {
  if ("parameters" in tool && typeof tool.parameters === "object" && tool.parameters !== null) {
    return tool as ToolSpec;
  }

  const toolDef = tool as ToolDefinition;
  return {
    name: toolDef.name,
    description: toolDef.description,
    parameters: zodToJsonSchema(toolDef.input),
  };
}

