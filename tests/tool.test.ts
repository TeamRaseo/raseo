import test from "node:test";
import assert from "node:assert";
import { z } from "zod";
import {
  tool,
  ToolRegistry,
  ToolExecutor,
  createToolRegistry,
  createToolExecutor,
} from "../src/tool/index.js";
import { ToolRegistryError } from "../src/core/errors/tool.error.js";

test("tool() helper creates valid ToolDefinition with automatic Zod input type inference", async () => {
  const weather = tool({
    name: "weather",
    description: "Get current weather",
    input: z.object({
      city: z.string(),
    }),
    async execute({ city }) {
      return {
        temperature: 32,
        condition: "Sunny",
        location: city,
      };
    },
  });

  assert.strictEqual(weather.name, "weather");
  assert.strictEqual(weather.description, "Get current weather");

  const result = await weather.execute({ city: "Tokyo" });
  assert.deepStrictEqual(result, {
    temperature: 32,
    condition: "Sunny",
    location: "Tokyo",
  });
});

test("ToolRegistry manages registration, registerMany, list, size, lookup, and removal", () => {
  const registry = createToolRegistry();

  const calcTool = tool({
    name: "calculator",
    description: "Adds numbers",
    input: z.object({ a: z.number(), b: z.number() }),
    execute: ({ a, b }) => a + b,
  });

  const searchTool = tool({
    name: "search",
    description: "Search query",
    input: z.object({ query: z.string() }),
    execute: ({ query }) => `Results for ${query}`,
  });

  assert.strictEqual(registry.has("calculator"), false);
  assert.strictEqual(registry.size, 0);

  // Single & Multiple Registration
  registry.register(calcTool);
  registry.registerMany([searchTool]);

  assert.strictEqual(registry.has("calculator"), true);
  assert.strictEqual(registry.has("search"), true);
  assert.strictEqual(registry.size, 2);
  assert.strictEqual(registry.get("calculator")?.name, "calculator");
  assert.strictEqual(registry.list().length, 2);

  // Duplicate registration should throw ToolRegistryError
  assert.throws(
    () => registry.register(calcTool),
    (err: unknown) => err instanceof ToolRegistryError
  );

  // Override registration
  registry.register(calcTool, { override: true });
  assert.strictEqual(registry.size, 2);

  // Unregister
  const removed = registry.unregister("calculator");
  assert.strictEqual(removed, true);
  assert.strictEqual(registry.has("calculator"), false);
  assert.strictEqual(registry.size, 1);

  // Clear
  registry.clear();
  assert.strictEqual(registry.size, 0);
});

test("ToolExecutor validates input schema, executes tools, handles guardrails, and catches failures into ToolResult", async () => {
  const addTool = tool({
    name: "add",
    description: "Add two numbers",
    input: z.object({
      x: z.number(),
      y: z.number(),
    }),
    async execute({ x, y }) {
      if (x < 0 || y < 0) {
        throw new Error("Negative numbers not allowed");
      }
      return { sum: x + y };
    },
  });

  const guardedTool = tool({
    name: "secure_action",
    description: "Guarded tool execution",
    input: z.object({ action: z.string() }),
    guardrail: (input) => {
      const data = input as { action: string };
      if (data.action === "forbidden") {
        return { passed: false, reason: "Forbidden action rejected by guardrail" };
      }
      return { passed: true };
    },
    execute: ({ action }) => ({ status: "executed", action }),
  });

  const registry = new ToolRegistry([addTool, guardedTool]);
  const executor = createToolExecutor(registry);

  assert.strictEqual(executor.getRegistry(), registry);

  // 1. Successful execution
  const successRes = await executor.execute("add", { x: 10, y: 20 }, { toolCallId: "call-1" });
  assert.strictEqual(successRes.success, true);
  assert.strictEqual(successRes.toolCallId, "call-1");
  assert.deepStrictEqual(successRes.data, { sum: 30 });

  // 2. Successful executeCall using ToolCall interface
  const callRes = await executor.executeCall({
    id: "call-2",
    name: "add",
    args: { x: 5, y: 15 },
  });
  assert.strictEqual(callRes.success, true);
  assert.strictEqual(callRes.toolCallId, "call-2");
  assert.deepStrictEqual(callRes.data, { sum: 20 });

  // 3. Input validation failure (Zod schema rejection)
  const invalidInputRes = await executor.execute("add", { x: "not-a-number", y: 20 });
  assert.strictEqual(invalidInputRes.success, false);
  assert.match(invalidInputRes.error ?? "", /Input validation failed/);

  // 4. Guardrail rejection
  const guardedRes = await executor.execute("secure_action", { action: "forbidden" });
  assert.strictEqual(guardedRes.success, false);
  assert.match(guardedRes.error ?? "", /Forbidden action rejected by guardrail/);

  // 5. Execution runtime error catching
  const errorRes = await executor.execute("add", { x: -5, y: 10 });
  assert.strictEqual(errorRes.success, false);
  assert.match(errorRes.error ?? "", /Negative numbers not allowed/);

  // 6. Unregistered tool execution failure
  const missingRes = await executor.execute("unknown_tool", {});
  assert.strictEqual(missingRes.success, false);
  assert.match(missingRes.error ?? "", /not registered/i);
});
