import test from "node:test";
import assert from "node:assert";
import { z } from "zod";
import {
  tool,
  ToolRegistry,
  ToolExecutor,
} from "../src/tool/index.js";

test("tool() helper creates valid ToolDefinition with automatic Zod input type inference", async () => {
  // Developer DX usage pattern requested:
  const weather = tool({
    name: "weather",
    description: "Get current weather",
    input: z.object({
      city: z.string(),
    }),
    async execute({ city }) {
      // TypeScript infers city as string automatically
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

test("ToolRegistry manages registration, lookup, and removal without execution logic", () => {
  const registry = new ToolRegistry();

  const calcTool = tool({
    name: "calculator",
    description: "Adds numbers",
    input: z.object({ a: z.number(), b: z.number() }),
    execute: ({ a, b }) => a + b,
  });

  assert.strictEqual(registry.has("calculator"), false);
  registry.register(calcTool);
  assert.strictEqual(registry.has("calculator"), true);
  assert.strictEqual(registry.get("calculator")?.name, "calculator");
  assert.strictEqual(registry.getAll().length, 1);

  // Duplicate registration should throw unless override is true
  assert.throws(() => registry.register(calcTool), /already registered/);

  // Unregister
  const removed = registry.unregister("calculator");
  assert.strictEqual(removed, true);
  assert.strictEqual(registry.has("calculator"), false);
});

test("ToolExecutor validates input schema, executes tools, and catches errors into ToolResult", async () => {
  const addTool = tool({
    name: "add",
    description: "Add two numbers",
    input: z.object({
      x: z.number(),
      y: z.number(),
    }),
    execute: ({ x, y }) => {
      if (x < 0 || y < 0) {
        throw new Error("Negative numbers not allowed");
      }
      return { sum: x + y };
    },
  });

  const executor = new ToolExecutor([addTool]);

  // 1. Successful execution
  const successRes = await executor.execute("add", { x: 10, y: 20 }, { toolCallId: "call-1" });
  assert.strictEqual(successRes.success, true);
  assert.strictEqual(successRes.toolCallId, "call-1");
  assert.deepStrictEqual(successRes.data, { sum: 30 });

  // 2. Input validation failure (Zod schema rejection)
  const invalidInputRes = await executor.execute("add", { x: "not-a-number", y: 20 });
  assert.strictEqual(invalidInputRes.success, false);
  assert.match(invalidInputRes.error ?? "", /Input validation failed/);

  // 3. Execution runtime error catching
  const errorRes = await executor.execute("add", { x: -5, y: 10 });
  assert.strictEqual(errorRes.success, false);
  assert.match(errorRes.error ?? "", /Negative numbers not allowed/);

  // 4. Missing tool lookup
  const missingRes = await executor.execute("unknown_tool", {});
  assert.strictEqual(missingRes.success, false);
  assert.match(missingRes.error ?? "", /not found in ToolRegistry/);
});
