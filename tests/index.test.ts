import test from "node:test";
import assert from "node:assert";
import { VERSION, AgentConfigSchema } from "../src/index.js";
import { createOpenaiProvider } from "../src/providers/openai.js";
import { createAnthropicProvider } from "../src/providers/anthropic.js";
import { createGeminiProvider } from "../src/providers/gemini.js";
import { createSession } from "../src/session/index.js";

test("VERSION is exported cleanly", () => {
  assert.strictEqual(VERSION, "0.0.1");
});

test("AgentConfigSchema validates valid configuration", () => {
  const result = AgentConfigSchema.safeParse({ name: "test-agent" });
  assert.strictEqual(result.success, true);
});

test("Subpath provider and session factory helpers initialize properly", () => {
  assert.strictEqual(createOpenaiProvider().name, "openai");
  assert.strictEqual(createAnthropicProvider().name, "anthropic");
  assert.strictEqual(createGeminiProvider().name, "gemini");
  assert.strictEqual(createSession().id, "default-session");
});
