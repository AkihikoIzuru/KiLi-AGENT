import { env } from '@/lib/env';

export interface ModelInfo {
  id: string;
  label: string;
  vision: boolean;
  reasoning: boolean;
  tools: boolean;
}

let cachedModels: ModelInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchModels(): Promise<ModelInfo[]> {
  // Return cached models if still valid
  if (cachedModels && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedModels;
  }

  try {
    // Try fetching from endpoint
    const response = await fetch(`${env.AI_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${env.AI_API_KEY}`,
        ...env.AI_EXTRA_HEADERS,
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        const models: ModelInfo[] = data.data.map((model: any) => ({
          id: model.id,
          label: model.id,
          vision: false, // Default to false, can be overridden by AI_MODELS
          reasoning: false,
          tools: true,
        }));

        // Override with AI_MODELS if provided
        if (env.AI_MODELS) {
          cachedModels = env.AI_MODELS;
        } else {
          cachedModels = models;
        }

        cacheTimestamp = Date.now();
        return cachedModels;
      }
    }
  } catch (error) {
    console.error('Failed to fetch models from endpoint:', error);
  }

  // Fallback to AI_MODELS
  if (env.AI_MODELS) {
    cachedModels = env.AI_MODELS;
    cacheTimestamp = Date.now();
    return cachedModels;
  }

  // Last resort: return default model only
  cachedModels = [{
    id: env.AI_DEFAULT_MODEL,
    label: env.AI_DEFAULT_MODEL,
    vision: false,
    reasoning: false,
    tools: true,
  }];

  cacheTimestamp = Date.now();
  return cachedModels;
}

export function getDefaultModel(): string {
  return env.AI_DEFAULT_MODEL;
}
