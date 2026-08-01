import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "providers/openai": "src/providers/openai.provider.ts",
    "providers/anthropic": "src/providers/anthropic.provider.ts",
    "providers/gemini": "src/providers/gemini.provider.ts",
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