import test from "node:test";
import assert from "node:assert/strict";
import { OpenAIProvider } from "../src/providers/openai/openai.provider.js";

test("OpenAIProvider has generate and stream functions", () => {
  const provider = new OpenAIProvider({
    apiKey: "test-key",
    model: "gpt-4o",
  });

  assert.equal(typeof provider.generate, "function");
  assert.equal(typeof provider.stream, "function");
  assert.equal(provider.name, "openai");
  assert.equal(provider.model, "gpt-4o");
});

test("OpenAIProvider stream validates request", async () => {
  const provider = new OpenAIProvider({
    apiKey: "test-key",
    model: "gpt-4o",
  });

  await assert.rejects(
    async () => {
      await provider.stream({ messages: [] });
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
