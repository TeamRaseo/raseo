import type { ToolDefinition } from "../core/types/tool.types.js";
import type { RegisterToolOptions } from "./types.js";

/**
 * Manages tool registration, lookup, and removal.
 * Does NOT execute tools.
 */
export class ToolRegistry {
  private tools = new Map<string, ToolDefinition<any, any>>();

  constructor(initialTools: ToolDefinition<any, any>[] = []) {
    for (const toolDef of initialTools) {
      this.register(toolDef);
    }
  }

  register(toolDef: ToolDefinition<any, any>, options: RegisterToolOptions = {}): void {
    if (this.tools.has(toolDef.name) && !options.override) {
      throw new Error(`Tool '${toolDef.name}' is already registered in ToolRegistry.`);
    }
    this.tools.set(toolDef.name, toolDef);
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  get(name: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getAll(): ToolDefinition<any, any>[] {
    return Array.from(this.tools.values());
  }

  clear(): void {
    this.tools.clear();
  }
}

export function createToolRegistry(initialTools?: ToolDefinition<any, any>[]): ToolRegistry {
  return new ToolRegistry(initialTools);
}
