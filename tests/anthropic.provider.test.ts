import test from "node:test";
import assert from "node:assert/strict";
import { AnthropicProvider, createAnthropicProvider } from "../src/providers/anthropic/anthropic.provider.js";
import { AnthropicMapper } from "../src/providers/anthropic/anthropic.mapper.js";

test("AnthropicProvider instantiation & interface parity with OpenAI/Gemini", () => {
  const provider = new AnthropicProvider({
    apiKey: "test-anthropic-key",
    model: "claude-3-5-sonnet-20241022",
  });

  assert.equal(provider.name, "anthropic");
  assert.equal(provider.model, "claude-3-5-sonnet-20241022");
  assert.equal(typeof provider.generate, "function");
  assert.equal(typeof provider.stream, "function");

  const created = createAnthropicProvider({
    apiKey: "test-anthropic-key",
    model: "claude-3-5-sonnet-20241022",
  });

  assert.equal(created.name, "anthropic");
});

test("AnthropicProvider request validation", async () => {
  const provider = new AnthropicProvider({
    apiKey: "test-key",
    model: "claude-3-5-sonnet-20241022",
  });

  await assert.rejects(
    async () => {
      await provider.generate({ messages: [] });
    },
    {
      name: "Error",
      message: "ModelRequest must contain at least one message.",
    }
  );

  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    async () => {
      await provider.stream({
        messages: [{ role: "user", content: "Hello" }],
        signal: controller.signal,
      });
    },
    {
      name: "AbortError",
    }
  );
});

test("AnthropicMapper maps ModelRequest to Anthropic parameters", () => {
  const mapper = new AnthropicMapper();

  const anthropicReq = mapper.toRequest(
    {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello Claude" },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    },
    "claude-3-5-sonnet-20241022",
    0.7,
    1000
  );

  assert.equal(anthropicReq.model, "claude-3-5-sonnet-20241022");
  assert.equal(anthropicReq.system, "You are a helpful assistant.");
  assert.equal(anthropicReq.temperature, 0.7);
  assert.equal(anthropicReq.max_tokens, 1000);
  assert.equal(anthropicReq.messages.length, 1);
  assert.equal(anthropicReq.messages[0].role, "user");
  assert.equal(anthropicReq.messages[0].content, "Hello Claude");
});

test("AnthropicMapper response mapping", () => {
  const mapper = new AnthropicMapper();

  const mockResponse: any = {
    id: "msg_123",
    type: "message",
    role: "assistant",
    model: "claude-3-5-sonnet-20241022",
    content: [
      { type: "text", text: "Hello! How can I help you?" }
    ],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 15,
      output_tokens: 10,
    },
  };

  const modelResponse = mapper.toModelResponse(mockResponse);

  assert.equal(modelResponse.message.role, "assistant");
  assert.equal(modelResponse.message.content, "Hello! How can I help you?");
  assert.equal(modelResponse.finishReason, "stop");
  assert.deepEqual(modelResponse.usage, {
    promptTokens: 15,
    completionTokens: 10,
    totalTokens: 25,
  });
});
