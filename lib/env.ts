import { z } from 'zod';

const envSchema = z.object({
  // AI Configuration
  AI_BASE_URL: z.string().url('AI_BASE_URL must be a valid URL'),
  AI_API_KEY: z.string().min(1, 'AI_API_KEY is required'),
  AI_DEFAULT_MODEL: z.string().min(1, 'AI_DEFAULT_MODEL is required'),
  AI_MODELS: z.string().optional().transform((val) => {
    if (!val) return undefined;
    try {
      const parsed = JSON.parse(val);
      return z.array(z.object({
        id: z.string(),
        label: z.string(),
        vision: z.boolean().default(false),
        reasoning: z.boolean().default(false),
        tools: z.boolean().default(true),
      })).parse(parsed);
    } catch {
      throw new Error('AI_MODELS must be valid JSON array');
    }
  }),
  AI_EXTRA_HEADERS: z.string().optional().transform((val) => {
    if (!val) return undefined;
    try {
      return JSON.parse(val) as Record<string, string>;
    } catch {
      throw new Error('AI_EXTRA_HEADERS must be valid JSON object');
    }
  }),

  // Authentication
  ACCESS_PASSWORD: z.string().min(1, 'ACCESS_PASSWORD is required in production').optional(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),

  // Agent Configuration
  AGENT_MAX_STEPS: z.string().optional().transform((val) => {
    if (!val) return 10;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) return 10;
    return num;
  }),

  // Search Configuration
  SEARCH_PROVIDER: z.enum(['tavily', 'brave', 'none']).optional().default('none'),
  SEARCH_API_KEY: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Environment validation failed');
  }

  // Additional validation for production
  if (parsed.data.NODE_ENV === 'production') {
    if (!parsed.data.ACCESS_PASSWORD) {
      throw new Error('ACCESS_PASSWORD is required in production');
    }
    if (!parsed.data.SESSION_SECRET) {
      throw new Error('SESSION_SECRET is required in production');
    }
  }

  // Warn if search is configured but no API key
  if (parsed.data.SEARCH_PROVIDER !== 'none' && !parsed.data.SEARCH_API_KEY) {
    console.warn(`⚠️  SEARCH_PROVIDER is set to ${parsed.data.SEARCH_PROVIDER} but SEARCH_API_KEY is not provided`);
  }

  return parsed.data;
}

export const env = validateEnv();
