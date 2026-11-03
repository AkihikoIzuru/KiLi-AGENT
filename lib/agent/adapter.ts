import { getAllTools, type AgentTool } from './index';
import { z } from 'zod';

/**
 * Convert our tool registry format to AI SDK tool format
 */
export function convertToolsForAISDK() {
  const tools = getAllTools();
  const converted: Record<string, any> = {};

  for (const tool of tools) {
    converted[tool.name] = {
      description: tool.description,
      parameters: tool.input,
      execute: async (args: any, context?: any) => {
        const signal = context?.abortSignal || new AbortController().signal;

        try {
          const result = await Promise.race([
            tool.run(args, { signal }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Tool timeout')), tool.timeoutMs || 15000)
            ),
          ]);

          return result;
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Tool execution failed',
          };
        }
      },
    };
  }

  return converted;
}

/**
 * Check if a tool requires approval
 */
export function requiresApproval(toolName: string): boolean {
  const tools = getAllTools();
  const tool = tools.find(t => t.name === toolName);
  return tool?.risk === 'confirm';
}

/**
 * Get tool description for display
 */
export function getToolDescription(toolName: string): string {
  const tools = getAllTools();
  const tool = tools.find(t => t.name === toolName);
  return tool?.description || '';
}
