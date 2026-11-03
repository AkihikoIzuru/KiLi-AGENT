import { z } from 'zod';
import { registerTool } from '../registry';

const getDatetimeSchema = z.object({
  timezone: z.string().optional().describe('Timezone (e.g., "Asia/Jakarta", defaults to UTC)'),
  format: z.enum(['iso', 'locale', 'timestamp']).optional().describe('Output format'),
});

registerTool({
  name: 'get_datetime',
  description: 'Get current date and time in specified timezone and format',
  input: getDatetimeSchema,
  risk: 'safe',
  timeoutMs: 1000,
  run: async (input: unknown) => {
    const { timezone = 'UTC', format = 'iso' } = getDatetimeSchema.parse(input);

    const now = new Date();

    let formatted: string;
    switch (format) {
      case 'iso':
        formatted = now.toISOString();
        break;
      case 'locale':
        formatted = now.toLocaleString('id-ID', { timeZone: timezone });
        break;
      case 'timestamp':
        formatted = now.getTime().toString();
        break;
      default:
        formatted = now.toISOString();
    }

    return {
      datetime: formatted,
      timezone,
      timestamp: now.getTime(),
      iso: now.toISOString(),
    };
  },
});
