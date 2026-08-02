import type { ToolDefinition } from "../core/types/tool.types.js";
import type { RegisterToolOptions } from "./types.js";
import { ToolRegistryError } from "../core/errors/tool.error.js";



export class ToolRegistry {
    private readonly tools = new Map<string, ToolDefinition>();

    constructor(initialTools: readonly ToolDefinition[] = []) {
        this.registerMany(initialTools);
    }

    register(
        tool: ToolDefinition,
        options: RegisterToolOptions = {}
    ): void {
        if (this.tools.has(tool.name) && !options.override) {
            throw new ToolRegistryError(
                tool.name,
                `Tool "${tool.name}" is already registered.`
            );
        }

        this.tools.set(tool.name, tool);
    }

    registerMany(
        tools: readonly ToolDefinition[],
        options: RegisterToolOptions = {}
    ): void {
        for (const tool of tools) {
            this.register(tool, options);
        }
    }

    unregister(name: string): boolean {
        return this.tools.delete(name);
    }

    has(name: string): boolean {
        return this.tools.has(name);
    }

    get(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
    }

    list(): readonly ToolDefinition[] {
        return [...this.tools.values()];
    }
    get size(): number {
        return this.tools.size;
    }

    clear(): void {
        this.tools.clear();
    }
}


export function createToolRegistry(
    initialTools: readonly ToolDefinition[] = []
): ToolRegistry {
    return new ToolRegistry(initialTools);
}