import { z } from 'zod';

export interface AgentTool {
  name: string;
  description: string;
  input: z.ZodTypeAny;
  risk: 'safe' | 'confirm';
  timeoutMs?: number;
  run: (input: unknown, ctx: { signal: AbortSignal }) => Promise<unknown>;
}

export interface ToolRegistry {
  [key: string]: AgentTool;
}

// Global registry
const tools: ToolRegistry = {};

export function registerTool(tool: AgentTool) {
  tools[tool.name] = tool;
}

export function getTool(name: string): AgentTool | undefined {
  return tools[name];
}

export function getAllTools(): AgentTool[] {
  return Object.values(tools);
}

export function getToolNames(): string[] {
  return Object.keys(tools);
}
