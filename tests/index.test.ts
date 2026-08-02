import test from "node:test";
import assert from "node:assert";
import { z } from "zod";
import {
  VERSION,
  tool,
  createMockProvider,
  RaseoError,
  TurnLimitExceededError,
  ToolExecutionError,
  InvalidStructuredOutputError,
  HandoffLoopError,
  ModelProviderError,
  GuardrailViolationError,
  MemorySessionStorageAdapter,
} from "../src/index.js";
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
  AgentConfig,
  AgentRunContext,
  SessionState,
} from "../src/index.js";

test("VERSION is exported cleanly", () => {
  assert.strictEqual(VERSION, "0.0.1");
});

test("Tool execute parameter type inference from Zod input schema", async () => {
  const calculatorTool = tool({
    name: "calculator",
    description: "Adds two numbers together",
    input: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async (input) => {
      const sum: number = input.a + input.b;
      return { result: sum };
    },
  });

  assert.strictEqual(calculatorTool.name, "calculator");
  assert.strictEqual(calculatorTool.description, "Adds two numbers together");

  const output = await calculatorTool.execute({ a: 5, b: 7 });
  assert.deepStrictEqual(output, { result: 12 });
});

test("MockProvider satisfies ModelProvider interface and records requests", async () => {
  const customResponse: ModelResponse = {
    message: {
      role: "assistant",
      content: "Hello from MockProvider",
    },
    finishReason: "stop",
    usage: { promptTokens: 15, completionTokens: 8, totalTokens: 23 },
  };

  const mockProvider: ModelProvider = createMockProvider({
    responses: [customResponse],
  });

  assert.strictEqual(mockProvider.name, "mock-provider");

  const request: ModelRequest = {
    messages: [{ role: "user", content: "Hi" }],
  };

  const response = await mockProvider.generateResponse(request);

  assert.strictEqual(response.message.content, "Hello from MockProvider");
  assert.strictEqual(response.finishReason, "stop");
  assert.strictEqual(response.usage?.totalTokens, 23);

  const secondResponse = await mockProvider.generateResponse(request);
  assert.strictEqual(secondResponse.message.content, "Mock provider response");
});

test("Typed error hierarchy inheritance and field integrity", () => {
  const baseErr = new RaseoError("Base error", "BASE_CODE");
  assert.ok(baseErr instanceof Error);
  assert.ok(baseErr instanceof RaseoError);
  assert.strictEqual(baseErr.code, "BASE_CODE");

  const turnErr = new TurnLimitExceededError("run-456", 5, 5);
  assert.ok(turnErr instanceof RaseoError);
  assert.ok(turnErr instanceof TurnLimitExceededError);
  assert.strictEqual(turnErr.code, "TURN_LIMIT_EXCEEDED");
  assert.strictEqual(turnErr.runId, "run-456");
  assert.strictEqual(turnErr.turnCount, 5);

  const toolErr = new ToolExecutionError("calculator", "Division by zero");
  assert.ok(toolErr instanceof RaseoError);
  assert.ok(toolErr instanceof ToolExecutionError);
  assert.strictEqual(toolErr.toolName, "calculator");

  const structErr = new InvalidStructuredOutputError("{ bad }", { issue: "syntax" });
  assert.ok(structErr instanceof RaseoError);
  assert.strictEqual(structErr.rawOutput, "{ bad }");

  const handoffErr = new HandoffLoopError(["AgentA", "AgentB", "AgentA"]);
  assert.ok(handoffErr instanceof RaseoError);
  assert.deepStrictEqual(handoffErr.agentChain, ["AgentA", "AgentB", "AgentA"]);

  const providerErr = new ModelProviderError("openai", "Rate limit exceeded");
  assert.ok(providerErr instanceof RaseoError);
  assert.strictEqual(providerErr.providerName, "openai");

  const guardrailErr = new GuardrailViolationError("input", "Prompt injection detected");
  assert.ok(guardrailErr instanceof RaseoError);
  assert.strictEqual(guardrailErr.target, "input");
});

test("Lifetime type separation: Static Agent Config vs Per-Run State vs Persisted Session State", async () => {
  const mockProvider = createMockProvider();
  const agentConfig: AgentConfig = {
    name: "SupportAgent",
    instructions: "Help the user resolve their issue.",
    model: mockProvider,
  };
  assert.strictEqual(agentConfig.name, "SupportAgent");

  const runContext: AgentRunContext = {
    runId: "run-789",
    sessionId: "session-1",
    turnCount: 0,
    maxTurns: 5,
    currentAgentName: agentConfig.name,
    metadata: { traceId: "trace-xyz" },
  };
  assert.strictEqual(runContext.runId, "run-789");

  const sessionState: SessionState = {
    sessionId: "session-1",
    messages: [{ role: "user", content: "Initial greeting" }],
    metadata: { userId: "user-123" },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const storage = new MemorySessionStorageAdapter();
  await storage.saveSession(sessionState);
  const fetched = await storage.getSession("session-1");

  assert.ok(fetched !== null);
  assert.strictEqual(fetched.sessionId, "session-1");
  assert.strictEqual(fetched.messages.length, 1);
});
