// Import and register all tools
import './tools/calculator';
import './tools/get-datetime';
import './tools/update-plan';
import './tools/fetch-url';
import './tools/create-artifact';
import './tools/web-search';

// Re-export registry functions
export { registerTool, getTool, getAllTools, getToolNames } from './registry';
export type { AgentTool, ToolRegistry } from './registry';
