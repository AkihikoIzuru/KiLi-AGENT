import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { env } from '@/lib/env';

export const aiProvider = createOpenAICompatible({
  name: 'kili-endpoint',
  baseURL: env.AI_BASE_URL,
  apiKey: env.AI_API_KEY,
  headers: env.AI_EXTRA_HEADERS,
});

export function getModel(modelId: string) {
  return aiProvider(modelId) as any;
}
