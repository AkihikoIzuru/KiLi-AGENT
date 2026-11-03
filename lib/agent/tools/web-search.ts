import { z } from 'zod';
import { registerTool } from '../registry';
import { env } from '@/lib/env';

const webSearchSchema = z.object({
  query: z.string().describe('Search query'),
  maxResults: z.number().optional().default(5).describe('Maximum number of results'),
});

registerTool({
  name: 'web_search',
  description: 'Search the web for information. Returns relevant search results with titles, snippets, and URLs.',
  input: webSearchSchema,
  risk: 'safe',
  timeoutMs: 10000,
  run: async (input: unknown, ctx) => {
    const { query, maxResults } = webSearchSchema.parse(input);

    // Check if search is configured
    if (env.SEARCH_PROVIDER === 'none' || !env.SEARCH_API_KEY) {
      return {
        query,
        results: [],
        success: false,
        error: 'Web search not configured. Set SEARCH_PROVIDER and SEARCH_API_KEY.',
      };
    }

    try {
      let results: any[] = [];

      if (env.SEARCH_PROVIDER === 'tavily') {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: env.SEARCH_API_KEY,
            query,
            max_results: maxResults,
          }),
          signal: ctx.signal,
        });

        if (!response.ok) {
          throw new Error(`Tavily API error: ${response.status}`);
        }

        const data = await response.json();
        results = data.results || [];
      } else if (env.SEARCH_PROVIDER === 'brave') {
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
          {
            headers: {
              'Accept': 'application/json',
              'X-Subscription-Token': env.SEARCH_API_KEY,
            },
            signal: ctx.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Brave API error: ${response.status}`);
        }

        const data = await response.json();
        results = (data.web?.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.description,
        }));
      }

      return {
        query,
        results: results.slice(0, maxResults),
        count: results.length,
        success: true,
      };
    } catch (error) {
      return {
        query,
        results: [],
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  },
});
