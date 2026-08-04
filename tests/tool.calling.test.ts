import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { tool, zodToJsonSchema, toToolSpec } from "../src/tool/tool.js";
import { ToolExecutor } from "../src/tool/tool.executor.js";
import { ToolRegistry } from "../src/tool/tool.registry.js";

test("zodToJsonSchema converts ZodObject schema to JSON Schema parameters", () => {
  const schema = z.object({
    city: z.string().describe("The name of the city"),
    unit: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature unit"),
    limit: z.number().default(5),
  });

  const jsonSchema = zodToJsonSchema(schema);

  assert.equal(jsonSchema.type, "object");
  assert.deepEqual(jsonSchema.required, ["city"]);
  
  const properties = jsonSchema.properties as Record<string, any>;
  assert.equal(properties.city.type, "string");
  assert.equal(properties.city.description, "The name of the city");
  assert.equal(properties.unit.type, "string");
  assert.deepEqual(properties.unit.enum, ["celsius", "fahrenheit"]);
  assert.equal(properties.limit.type, "number");
});

test("toToolSpec creates valid ToolSpec from ToolDefinition", () => {
  const weatherTool = tool({
    name: "get_weather",
    description: "Fetch current weather for a city",
    input: z.object({
      city: z.string().describe("City name"),
    }),
    async execute({ city }) {
      return { city, temp: "22°C" };
    },
  });

  const spec = toToolSpec(weatherTool);

  assert.equal(spec.name, "get_weather");
  assert.equal(spec.description, "Fetch current weather for a city");
  assert.equal((spec.parameters as any).type, "object");
  assert.equal((spec.parameters as any).properties.city.type, "string");
});

test("ToolExecutor executes registered tool with Zod validation", async () => {
  const weatherTool = tool({
    name: "get_weather",
    description: "Fetch current weather",
    input: z.object({
      city: z.string(),
    }),
    async execute({ city }) {
      return { city, temperature: "25C" };
    },
  });

  const registry = new ToolRegistry([weatherTool]);
  const executor = new ToolExecutor(registry);

  const result = await executor.executeCall({
    id: "call_123",
    name: "get_weather",
    arguments: { city: "Tokyo" },
  });

  assert.equal(result.success, true);
  assert.equal(result.toolName, "get_weather");
  assert.equal(result.toolCallId, "call_123");
  assert.deepEqual(result.data, { city: "Tokyo", temperature: "25C" });
});
