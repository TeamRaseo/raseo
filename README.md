# raseo-sdk

> **An open-source, strongly-typed Agent SDK for TypeScript and Node.js.**

`raseo-sdk` provides a unified, production-ready foundation for building AI agents in TypeScript. It features a standardized model provider layer (backed by the OpenAI Responses API), type-safe tool definitions with Zod schema validation, a tool execution pipeline with guardrails, and persistent/in-memory session state management.

---

## Key Features

- **OpenAI Provider (Responses API)**: Native support for OpenAI's `client.responses.create()` API, multi-modal input (text & image), tool specs, structured outputs (`json_schema`), temperature/token control, and token usage tracking.
- **Type-Safe Tool System**: Define tools with `tool()` and Zod schemas featuring automatic TypeScript input type inference.
- **Tool Registry & Executor**: Register tools in `ToolRegistry` and execute them via `ToolExecutor` with input validation, guardrail hooks, and structured `ToolResult` error handling.
- **Session State Management**: Track multi-turn conversation sessions using `MemorySessionStorageAdapter` or custom storage adapters.
- **Typed Error Hierarchy**: Granular error types (`ToolExecutionError`, `GuardrailViolationError`, `ModelProviderError`, `TurnLimitExceededError`) for resilient error handling.

---

## Installation

Install `raseo-sdk` along with required peer dependencies `openai` and `zod`:

```bash
# Using pnpm
pnpm add raseo-sdk openai zod

# Using npm
npm install raseo-sdk openai zod

# Using yarn
yarn add raseo-sdk openai zod

# Using bun
bun add raseo-sdk openai zod
```

> **Requirements**: Node.js `>= 18.0.0` with ESM or CommonJS support.

---

## Quickstart

### 1. Generating Model Responses with `OpenAIProvider`

`raseo-sdk` exports dedicated provider subpaths for clean imports. Here is how to initialize and invoke the `OpenAIProvider`:

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

### 2. Multi-Modal Inputs (Text + Images)

Pass multi-modal content arrays directly into user messages:

```typescript
import { OpenAIProvider } from "raseo-sdk/openai";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const response = await provider.generate({
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What is shown in this image?" },
        { type: "image", imageUrl: "https://example.com/diagram.png" },
      ],
    },
  ],
});

console.log(response.message.content);
```

---

### 3. Defining & Executing Type-Safe Tools

Use the `tool()` helper to define tools with Zod schema validation. Inferred TypeScript types flow automatically into the `execute` handler.

```typescript
import { tool, ToolRegistry, ToolExecutor } from "raseo-sdk/tool";
import { z } from "zod";

// 1. Define a tool with Zod schema validation
const calculatorTool = tool({
  name: "add_numbers",
  description: "Adds two numbers together and returns the sum.",
  input: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  async execute({ a, b }) {
    return { sum: a + b };
  },
});

// 2. Register tools in a ToolRegistry
const registry = new ToolRegistry();
registry.register(calculatorTool);

// 3. Execute tools via ToolExecutor
const executor = new ToolExecutor(registry);

const result = await executor.execute("add_numbers", { a: 10, b: 25 });

if (result.success) {
  console.log("Result:", result.data); // Output: { sum: 35 }
} else {
  console.error("Execution Error:", result.error);
}
```

---

### 4. Tool Execution Guardrails

Attach custom guardrail hooks to validate input arguments before executing tool logic:

```typescript
import { tool } from "raseo-sdk/tool";
import { z } from "zod";

const sensitiveOperation = tool({
  name: "delete_user",
  description: "Deletes a user account by ID",
  input: z.object({ userId: z.string() }),
  // Guardrail hook called prior to execution
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

### 5. Managing Session State

Store and manage conversation histories across agent turns using `MemorySessionStorageAdapter` or by building custom adapters with `SessionStorageAdapter`:

```typescript
import { MemorySessionStorageAdapter, createSession } from "raseo-sdk/session";
import type { SessionState } from "raseo-sdk/session";

const storage = new MemorySessionStorageAdapter();

// Create or retrieve session state
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

## Package Architecture & Exports

`raseo-sdk` uses modular subpath exports for clean dependency tree management:

| Export Path | Exported Features |
| :--- | :--- |
| `raseo-sdk` | Core types, errors, tool functions, and session adapters |
| `raseo-sdk/openai` | `OpenAIProvider` and OpenAI Responses API mapper |
| `raseo-sdk/tool` | `tool()`, `ToolRegistry`, `ToolExecutor`, tool types |
| `raseo-sdk/session` | `MemorySessionStorageAdapter`, `createSession`, session interfaces |

---

## License

[MIT](LICENSE) © 2026 Aansh Malhotra
