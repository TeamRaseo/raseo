import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "tool/index": "src/tool/index.ts",
    "providers/openai": "src/providers/openai/index.ts",
    "providers/anthropic": "src/providers/anthropic/index.ts",
    "providers/gemini": "src/providers/gemini/index.ts",
    "session/index": "src/session/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: "es2022",
  outDir: "dist",
});