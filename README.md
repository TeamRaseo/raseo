# raseo-sdk

> **An open-source, strongly-typed Agent SDK for TypeScript and Node.js.**

`raseo-sdk` provides a unified, production-ready foundation for building AI agents and LLM applications in TypeScript. It features a standardized model provider layer (supporting OpenAI's Responses API, Anthropic's `@anthropic-ai/sdk`, and Google's `@google/genai` Gemini SDK), real-time response streaming, type-safe tool definitions with automatic Zod JSON schema conversion, an automated agent reasoning loop (`runAgent`), and session state management.

---

## Key Features

- **OpenAI Provider (Responses API)**: Full support for non-streaming (`generate()`) and real-time streaming (`stream()`) responses backed by OpenAI's Responses API.
- **Anthropic Provider (@anthropic-ai/sdk)**: Full support for Anthropic Claude models (e.g. `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`) with identical `generate()`, `stream()`, multi-modal content, and tool calling interface.
- **Gemini Provider (@google/genai)**: Full support for Google Gemini models (e.g. `gemini-2.5-flash`, `gemini-1.5-pro`) with identical `generate()`, `stream()`, multi-modal content, and tool calling interface.
- **Real-Time Response Streaming**: Stream text chunks (`textStream`), typed deltas (`text-delta`, `tool-call-delta`, `finish`), and await the final `ModelResponse` with full token usage metadata across all providers.
- **Type-Safe Tool System**: Define tools using `tool()` with Zod schema validation, featuring automatic TypeScript input type inference and Zod-to-JSON-Schema parameter conversion.
- **Automated Agent Reasoning Loop (`runAgent`)**: Multi-turn agent runtime (`AgentRuntime`) that automatically resolves system instructions, calls the LLM, executes tools via `ToolExecutor`, feeds results back, and returns the final answer.
- **Tool Registry & Executor**: Manage tools in `ToolRegistry` and execute them via `ToolExecutor` with input validation, guardrail hooks, and structured `ToolResult` error handling.
- **Session State Management**: Track multi-turn conversation sessions using `MemorySessionStorageAdapter` or custom storage adapters.

---

## Installation

Install `raseo-sdk` along with `zod` 

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

Initialize `OpenAIProvider`, `AnthropicProvider`, or `GeminiProvider` using vendor-neutral subpath exports:

#### With OpenAI (`OpenAIProvider`)
```typescript
import { OpenAIProvider } from "raseo-sdk/openai";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const response = await provider.generate({
  messages: [
    { role: "system", content: "You are a helpful programming assistant." },
    { role: "user", content: "Explain asynchronous programming in TypeScript in one short sentence." },
  ],
  // temperature: 0.7,
  // maxTokens: 150,
});

console.log("Assistant Response:", response.message.content);
console.log("Finish Reason:", response.finishReason);
console.log("Token Usage:", response.usage);
```

#### With Anthropic (`AnthropicProvider`)
```typescript
import { AnthropicProvider } from "raseo-sdk/anthropic";

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});

const response = await provider.generate({
  messages: [
    { role: "system", content: "You are a helpful programming assistant." },
    { role: "user", content: "Explain asynchronous programming in TypeScript in one short sentence." },
  ],
  // temperature: 0.7,
  // maxTokens: 150,
});

console.log("Assistant Response:", response.message.content);
console.log("Finish Reason:", response.finishReason);
console.log("Token Usage:", response.usage);
```

#### With Gemini (`GeminiProvider`)
```typescript
import { GeminiProvider } from "raseo-sdk/gemini";

const provider = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash",
});

const response = await provider.generate({
  messages: [
    { role: "system", content: "You are a helpful programming assistant." },
    { role: "user", content: "Explain asynchronous programming in TypeScript in one short sentence." },
  ],
  // temperature: 0.7,
  // maxTokens: 150,
});

console.log("Assistant Response:", response.message.content);
console.log("Finish Reason:", response.finishReason);
console.log("Token Usage:", response.usage);
```

---

### 2. Real-Time Response Streaming (`provider.stream()`)

Stream tokens in real-time with zero API differences across providers:

#### With OpenAI (`OpenAIProvider`)
```typescript
import { OpenAIProvider } from "raseo-sdk/openai";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const streamResult = await provider.stream({
  messages: [{ role: "user", content: "Write a short poem about code." }],
});

// Convenient text stream iteration
for await (const text of streamResult.textStream) {
  process.stdout.write(text);
}

// Access accumulated final response and token usage metadata
const finalResponse = await streamResult.response;
console.log("\nToken Usage:", finalResponse.usage);
```

#### With Anthropic (`AnthropicProvider`)
```typescript
import { AnthropicProvider } from "raseo-sdk/anthropic";

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});

const streamResult = await provider.stream({
  messages: [{ role: "user", content: "Write a short poem about code." }],
});

// Convenient text stream iteration
for await (const text of streamResult.textStream) {
  process.stdout.write(text);
}

// Access accumulated final response and token usage metadata
const finalResponse = await streamResult.response;
console.log("\nToken Usage:", finalResponse.usage);
```

#### With Gemini (`GeminiProvider`)
```typescript
import { GeminiProvider } from "raseo-sdk/gemini";

const provider = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-2.5-flash",
});

const streamResult = await provider.stream({
  messages: [{ role: "user", content: "Write a short poem about code." }],
});

// Convenient text stream iteration
for await (const text of streamResult.textStream) {
  process.stdout.write(text);
}

// Access accumulated final response and token usage metadata
const finalResponse = await streamResult.response;
console.log("\nToken Usage:", finalResponse.usage);
```

---

### 3. Defining & Using Type-Safe Tools (`tool()`)

Define tools using `tool()` and Zod schemas. Zod inputs are automatically converted into valid JSON Schema specifications for OpenAI, Anthropic, and Gemini providers.

```typescript
import { tool } from "raseo-sdk/tool";
import { OpenAIProvider } from "raseo-sdk/openai";
import { AnthropicProvider } from "raseo-sdk/anthropic";
import { GeminiProvider } from "raseo-sdk/gemini";
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

// 2. Pass tool definitions directly into OpenAIProvider, AnthropicProvider, or GeminiProvider!
const anthropicProvider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});

const response = await anthropicProvider.generate({
  messages: [{ role: "user", content: "What is the weather in Tokyo?" }],
  tools: [weatherTool], // Automatically converted to JSON Schema!
});

console.log("Model Tool Calls:", response.toolCalls);
```

---

### 4. Automated Agent Runtime Loop (`runAgent`)

Use `runAgent` (or `AgentRuntime`) to run multi-turn agent execution loops. Switch between `OpenAIProvider`, `AnthropicProvider`, and `GeminiProvider` seamlessly without changing agent or tool code:

#### Multi-Turn Agent with OpenAI:
```typescript
import { tool, runAgent } from "raseo-sdk";
import { OpenAIProvider } from "raseo-sdk/openai";
import { z } from "zod";
import "dotenv/config"


const inputSchema = z.object({
  city: z.string().describe("City name"),
});

type Input = z.infer<typeof inputSchema>;

const weatherTool = {
  name: "get_weather",
  description: "Get current weather for a city",
  input: inputSchema,
  async execute({ city }: Input) {
    // Step 1: Geocode city → lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Could not find coordinates for city: ${city}`);
    }
    const { latitude, longitude } = geoData.results[0];

    // Step 2: Fetch current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const { temperature, weathercode } = weatherData.current_weather;

    // Step 3: Map weather code → condition string
    const conditionMap: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      61: "Slight rain",
      71: "Slight snow fall",
      80: "Rain showers",
    };

    return {
      city,
      temperature,
      condition: conditionMap[weathercode] || "Unknown",
    };
  },
};



const provider = new OpenAIProvider({
    apiKey: process.env.OPENAI_KEY!,
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
    "What is the weather in Delhi?"
);

console.log("Final Answer:", result.output);
console.log("Turns Executed:", result.turnCount);
```

#### Multi-Turn Agent with Anthropic:
```typescript
import { AnthropicProvider } from "raseo-sdk/anthropic";
import { tool, runAgent } from "raseo-sdk";
import { z } from "zod";
import "dotenv/config";

const inputSchema = z.object({
  city: z.string().describe("City name"),
});

type Input = z.infer<typeof inputSchema>;

const weatherTool = {
  name: "get_weather",
  description: "Get current weather for a city",
  input: inputSchema,
  async execute({ city }: Input) {
    // Step 1: Geocode city → lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Could not find coordinates for city: ${city}`);
    }
    const { latitude, longitude } = geoData.results[0];

    // Step 2: Fetch current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const { temperature, weathercode } = weatherData.current_weather;

    // Step 3: Map weather code → condition string
    const conditionMap: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      61: "Slight rain",
      71: "Slight snow fall",
      80: "Rain showers",
    };

    return {
      city,
      temperature,
      condition: conditionMap[weathercode] || "Unknown",
    };
  },
};

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});

// Automatically runs LLM -> executes tools -> feeds results -> returns final answer
const result = await runAgent(
  {
    name: "WeatherAssistant",
    instructions: "You are a helpful assistant. Use tools to answer user questions.",
    model: provider,
    tools: [weatherTool],
  },
  "What is the weather in Delhi?"
);

console.log("Final Answer:", result.output);
console.log("Turns Executed:", result.turnCount);
```

#### Multi-Turn Agent with Gemini:
```typescript
import {GeminiProvider} from "raseo-sdk/gemini"
import { tool, runAgent } from "raseo-sdk";
import {z} from "zod"
import "dotenv/config"

const inputSchema = z.object({
  city: z.string().describe("City name"),
});

type Input = z.infer<typeof inputSchema>;

const weatherTool = {
  name: "get_weather",
  description: "Get current weather for a city",
  input: inputSchema,
  async execute({ city }: Input) {
    // Step 1: Geocode city → lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Could not find coordinates for city: ${city}`);
    }
    const { latitude, longitude } = geoData.results[0];

    // Step 2: Fetch current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const { temperature, weathercode } = weatherData.current_weather;

    // Step 3: Map weather code → condition string
    const conditionMap: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      61: "Slight rain",
      71: "Slight snow fall",
      80: "Rain showers",
    };

    return {
      city,
      temperature,
      condition: conditionMap[weathercode] || "Unknown",
    };
  },
};



const provider = new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3.5-flash",
});

// Automatically runs LLM -> executes tools -> feeds results -> returns final answer
const result = await runAgent(
    {
        name: "WeatherAssistant",
        instructions: "You are a helpful assistant. Use tools to answer user questions.",
        model: provider,
        tools: [weatherTool],
    },
    "What is the weather in Delhi?"
);

console.log("Final Answer:", result.output);
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
| `raseo-sdk/gemini` | `GeminiProvider`, `GeminiMapper`, `createGeminiProvider` |
| `raseo-sdk/tool` | `tool()`, `createTool`, `ToolRegistry`, `ToolExecutor`, `zodToJsonSchema`, `toToolSpec` |
| `raseo-sdk/session` | `MemorySessionStorageAdapter`, `createSession`, session interfaces |

---

## License

[MIT](LICENSE) © 2026 Aansh Malhotra
