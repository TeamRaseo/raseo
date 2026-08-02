import type { RuntimeOptions } from "../options/runtime.options.js";

export interface RuntimeContext {
  agentName: string;
  instructions: string;
  options: RuntimeOptions;
}