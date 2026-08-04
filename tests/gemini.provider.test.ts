import test from "node:test";
import assert from "node:assert/strict";
import { GeminiProvider, createGeminiProvider } from "../src/providers/gemini/gemini.provider.js";
import { GeminiMapper } from "../src/providers/gemini/gemini.mapper.js";

test("GeminiProvider instantiation & interface parity with OpenAIProvider", () => {
  const provider = new GeminiProvider({
    apiKey: "test-gemini-key",
    model: "gemini-2.5-flash",
  });

  assert.equal(provider.name, "gemini");
  assert.equal(provider.model, "gemini-2.5-flash");
  assert.equal(typeof provider.generate, "function");
  assert.equal(typeof provider.stream, "function");

  const created = createGeminiProvider({
    apiKey: "test-gemini-key",
    model: "gemini-2.5-flash",
  });

  assert.equal(created.name, "gemini");
});

test("GeminiProvider request validation", async () => {
  const provider = new GeminiProvider({
    apiKey: "test-key",
    model: "gemini-2.5-flash",
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

test("GeminiMapper maps ModelRequest to Gemini parameters", () => {
  const mapper = new GeminiMapper();

  const geminiReq = mapper.toRequest(
    {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello Gemini" },
      ],
      temperature: 0.8,
      maxTokens: 500,
    },
    "gemini-2.5-flash",
    0.8,
    500
  );

  assert.equal(geminiReq.model, "gemini-2.5-flash");
  assert.equal(geminiReq.config.systemInstruction, "You are a helpful assistant.");
  assert.equal(geminiReq.config.temperature, 0.8);
  assert.equal(geminiReq.config.maxOutputTokens, 500);
  assert.equal(geminiReq.contents.length, 1);
  assert.equal(geminiReq.contents[0].role, "user");
  assert.equal(geminiReq.contents[0].parts[0].text, "Hello Gemini");
});
