# raseo-sdk

> **An open-source, strongly-typed Agent SDK for TypeScript and Node.js.**

`raseo-sdk` provides a unified, production-ready foundation for building AI agents and LLM applications in TypeScript. It features a standardized model provider layer (backed by OpenAI's Responses API), real-time response streaming, type-safe tool definitions with automatic Zod JSON schema conversion, an automated agent reasoning loop (`runAgent`), and session state management.

---

## Key Features

- **OpenAI Provider (Responses API)**: Full support for non-streaming (`generate()`) and real-time streaming (`stream()`) responses backed by OpenAI's Responses API.
- **Real-Time Response Streaming**: Stream text chunks (`textStream`), typed deltas (`text-delta`, `tool-call-delta`, `finish`), and await the final `ModelResponse` with full token usage metadata.
- **Type-Safe Tool System**: Define tools using `tool()` with Zod schema validation, featuring automatic TypeScript input type inference and Zod-to-JSON-Schema parameter conversion.
- **Automated Agent Reasoning Loop (`runAgent`)**: Multi-turn agent runtime (`AgentRuntime`) that automatically resolves system instructions, calls the LLM, executes tools via `ToolExecutor`, feeds results back, and returns the final answer.
- **Tool Registry & Executor**: Manage tools in `ToolRegistry` and execute them via `ToolExecutor` with input validation, guardrail hooks, and structured `ToolResult` error handling.
- **Session State Management**: Track multi-turn conversation sessions using `MemorySessionStorageAdapter` or custom storage adapters.

---

## Installation

Install `raseo-sdk` along with peer dependencies `openai` and `zod`:

```bash
# Using pnpm
pnpm add raseo-sdk zod

# Using npm
npm install raseo-sdk zod

# Using yarn
yarn add raseo-sdk zod

# Using bun
bun add raseo-sdk zod
```

> **Requirements**: Node.js `>= 18.0.0` with ESM or CommonJS support.

---

## Quickstart & Guide

### 1. Generating Model Responses (`provider.generate()`)

Initialize the `OpenAIProvider` to generate non-streaming model responses:

```typescript
import { OpenAIProvider } from "raseo-sdk/openai";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const response = await provider.generate({
  messages: [
    {
      role: "system",
      content: "You are a helpful programming assistant.",
    },
    {
      role: "user",
      content: "Explain asynchronous programming in TypeScript in one short sentence.",
    },
  ],
  temperature: 0.7,
  maxTokens: 150,
});

console.log("Assistant Response:", response.message.content);
console.log("Finish Reason:", response.finishReason);
console.log("Token Usage:", response.usage);
```

---

### 2. Real-Time Response Streaming (`provider.stream()`)

Stream tokens in real-time using `provider.stream()`. The SDK returns a `ModelStreamResponse` object with support for direct text streaming or full typed event iteration:

```typescript
import { OpenAIProvider } from "raseo-sdk/openai";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

// Option A: Convenient Text-Only Streaming
const streamResult = await provider.stream({
  messages: [
    { role: "user", content: "Write a short poem about code." }
  ],
});

for await (const text of streamResult.textStream) {
  process.stdout.write(text);
}

// Access the accumulated final response and usage metadata
const finalResponse = await streamResult.response;
console.log("\nToken Usage:", finalResponse.usage);
```

You can also iterate over typed chunks (`text-delta`, `tool-call-delta`, `finish`, `error`):

```typescript
const streamResult = await provider.stream({ messages });

for await (const chunk of streamResult) {
  if (chunk.type === "text-delta") {
    process.stdout.write(chunk.textDelta);
  } else if (chunk.type === "finish") {
    console.log("\nFinished:", chunk.finishReason);
  }
}
```

---

### 3. Defining & Using Type-Safe Tools (`tool()`)

Define tools using `tool()` and Zod schemas. Zod inputs are automatically converted into valid JSON Schema function specifications for LLM providers.

```typescript
import { tool } from "raseo-sdk/tool";
import { OpenAIProvider } from "raseo-sdk/openai";
import { z } from "zod";

// 1. Define a tool with Zod input schema
const weatherTool = tool({
  name: "get_weather",
  description: "Get current weather for a city",
  input: z.object({
    city: z.string().describe("The city name, e.g. Tokyo, San Francisco"),
    unit: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature unit"),
  }),
  async execute({ city, unit }) {
    return {
      city,
      temperature: 22,
      unit: unit ?? "celsius",
      condition: "Sunny",
    };
  },
});

// 2. Pass tool definitions directly into provider calls!
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const response = await provider.generate({
  messages: [{ role: "user", content: "What is the weather in Tokyo?" }],
  tools: [weatherTool], // Automatically converted to JSON Schema!
});

console.log("Model Tool Calls:", response.toolCalls);
```

---

### 4. Automated Agent Runtime Loop (`runAgent`)

Use `runAgent` (or `AgentRuntime`) to run multi-turn agent execution loops. The runtime automatically handles prompt resolution, provider generation, tool execution via `ToolExecutor`, feeding tool response messages back to the LLM, and returning the final text answer.

```typescript
import { tool, runAgent } from "raseo-sdk";
import { OpenAIProvider } from "raseo-sdk/openai";
import { z } from "zod";

const weatherTool = tool({
  name: "get_weather",
  description: "Get current weather for a city",
  input: z.object({
    city: z.string().describe("City name"),
  }),
  async execute({ city }) {
    return { city, temperature: 22, condition: "Sunny" };
  },
});

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

// Automatically runs LLM -> executes tools -> feeds results -> returns final answer
const result = await runAgent(
  {
    name: "WeatherAssistant",
    instructions: "You are a helpful assistant. Use tools to answer user questions.",
    model: provider,
    tools: [weatherTool],
  },
  "What is the weather in Tokyo?"
);

console.log("Final Answer:", result.output);
// Output: "The weather in Tokyo is currently 22°C and sunny."
console.log("Turns Executed:", result.turnCount);
```

---

### 5. Standalone Tool Registry & Executor

For custom or manual tool execution pipelines without full agent runtime:

```typescript
import { tool, ToolRegistry, ToolExecutor } from "raseo-sdk/tool";
import { z } from "zod";

const calculatorTool = tool({
  name: "add_numbers",
  description: "Adds two numbers together",
  input: z.object({
    a: z.number(),
    b: z.number(),
  }),
  async execute({ a, b }) {
    return { sum: a + b };
  },
});

const registry = new ToolRegistry([calculatorTool]);
const executor = new ToolExecutor(registry);

const result = await executor.execute("add_numbers", { a: 10, b: 25 });

if (result.success) {
  console.log("Sum:", result.data); // Output: { sum: 35 }
}
```

---

### 6. Tool Execution Guardrails

Attach custom guardrail hooks to validate arguments before tool logic executes:

```typescript
import { tool } from "raseo-sdk/tool";
import { z } from "zod";

const sensitiveOperation = tool({
  name: "delete_user",
  description: "Deletes a user account by ID",
  input: z.object({ userId: z.string() }),
  guardrail: (input) => {
    const { userId } = input as { userId: string };
    if (userId === "root" || userId === "admin") {
      return { passed: false, reason: "Deleting system accounts is forbidden." };
    }
    return { passed: true };
  },
  async execute({ userId }) {
    return { status: `User ${userId} deleted` };
  },
});
```

---

### 7. Managing Session State

Store and manage conversation histories across turns using `MemorySessionStorageAdapter` or custom adapters:

```typescript
import { MemorySessionStorageAdapter } from "raseo-sdk/session";
import type { SessionState } from "raseo-sdk/session";

const storage = new MemorySessionStorageAdapter();

const sessionState: SessionState = {
  sessionId: "session-user-101",
  messages: [
    { role: "user", content: "Hello, I need help with my account." },
  ],
  metadata: { userId: "user-101" },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

await storage.saveSession(sessionState);

const retrieved = await storage.getSession("session-user-101");
console.log("Loaded Session Messages:", retrieved?.messages.length);
```

---

## Package Architecture & Subpath Exports

`raseo-sdk` provides modular subpath exports for clean dependency management:

| Export Path | Description & Exported Symbols |
| :--- | :--- |
| `raseo-sdk` | Main entry point: `runAgent`, `AgentRuntime`, `tool`, `toToolSpec`, core types, errors, session adapters |
| `raseo-sdk/openai` | `OpenAIProvider`, `OpenAIMapper`, provider configuration types |
| `raseo-sdk/tool` | `tool()`, `createTool`, `ToolRegistry`, `ToolExecutor`, `zodToJsonSchema`, `toToolSpec` |
| `raseo-sdk/session` | `MemorySessionStorageAdapter`, `createSession`, session interfaces |

---

## License

[MIT](LICENSE) © 2026 Aansh Malhotra
