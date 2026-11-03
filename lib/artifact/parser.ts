/**
 * Parse artifacts from streaming text
 * Returns text without artifact tags and extracted artifacts
 */
export interface ParsedArtifact {
  id: string;
  type: 'html' | 'svg' | 'markdown' | 'mermaid' | 'code';
  title: string;
  content: string;
  language?: string;
}

export interface ParseResult {
  text: string;
  artifacts: ParsedArtifact[];
}

export function parseArtifacts(text: string): ParseResult {
  const artifacts: ParsedArtifact[] = [];
  let cleanText = text;

  // Regex to match artifact tags (handles incomplete tags during streaming)
  const artifactRegex = /<artifact\s+type=["']([^"']+)["']\s+title=["']([^"']+)["'](?:\s+language=["']([^"']+)["'])?\s*>([\s\S]*?)(?:<\/artifact>|$)/g;

  let match;
  while ((match = artifactRegex.exec(text)) !== null) {
    const [fullMatch, type, title, language, content] = match;

    // Only process if we have closing tag (complete artifact)
    if (fullMatch.includes('</artifact>')) {
      artifacts.push({
        id: `artifact-${Date.now()}-${artifacts.length}`,
        type: type as any,
        title,
        content: content.trim(),
        language,
      });

      // Remove artifact from text
      cleanText = cleanText.replace(fullMatch, `\n[Artifact: ${title}]\n`);
    }
  }

  return {
    text: cleanText,
    artifacts,
  };
}

/**
 * Extract thinking blocks from text
 */
export function extractThinking(text: string): { text: string; thinking: string | null } {
  const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
  let thinking: string | null = null;
  let cleanText = text;

  const match = thinkingRegex.exec(text);
  if (match && match[1]) {
    thinking = match[1].trim();
    cleanText = text.replace(thinkingRegex, '').trim();
  }

  return { text: cleanText, thinking };
}

/**
 * Check if text contains incomplete artifact tags (still streaming)
 */
export function hasIncompleteArtifact(text: string): boolean {
  const openTag = text.lastIndexOf('<artifact');
  const closeTag = text.lastIndexOf('</artifact>');

  return openTag > closeTag;
}
