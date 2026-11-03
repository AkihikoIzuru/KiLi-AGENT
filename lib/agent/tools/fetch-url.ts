import { z } from 'zod';
import { registerTool } from '../registry';

const FetchUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to fetch'),
});

type FetchUrlInput = z.infer<typeof FetchUrlInputSchema>;

// SSRF protection: block private IP ranges
const BLOCKED_HOSTS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^localhost$/i,
  /^0\.0\.0\.0$/,
];

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOSTS.some((pattern) => pattern.test(hostname));
}

async function fetchUrl(input: unknown, ctx: { signal: AbortSignal }): Promise<string> {
  const parsed = FetchUrlInputSchema.parse(input);
  const { url } = parsed;

  // Parse URL and check for SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Block private/local addresses
  if (isBlockedHost(parsedUrl.hostname)) {
    throw new Error(
      `Access to private/local addresses is not allowed for security reasons: ${parsedUrl.hostname}`
    );
  }

  // Only allow HTTP/HTTPS
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`Only HTTP and HTTPS protocols are allowed, got: ${parsedUrl.protocol}`);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'KiLi-AGENT/1.0 (AI Assistant)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';

    // Only handle text content
    if (!contentType.includes('text/') &&
        !contentType.includes('application/json') &&
        !contentType.includes('application/xml')) {
      throw new Error(`Content type not supported: ${contentType}. Only text-based content is allowed.`);
    }

    const text = await response.text();

    // Limit response size to 50KB
    if (text.length > 50000) {
      return text.slice(0, 50000) + '\n\n[Content truncated - exceeded 50KB limit]';
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw new Error('Failed to fetch URL: Unknown error');
  }
}

// Register the tool
registerTool({
  name: 'fetch_url',
  description: 'Fetch content from a web URL. Only HTTP/HTTPS URLs are allowed. Private/local addresses are blocked for security.',
  input: FetchUrlInputSchema,
  risk: 'confirm',
  timeoutMs: 15000,
  run: fetchUrl,
});
