import { z } from 'zod';
import { registerTool } from '../registry';

const createArtifactSchema = z.object({
  type: z.enum(['html', 'svg', 'markdown', 'mermaid', 'code']),
  title: z.string(),
  content: z.string(),
  language: z.string().optional(),
});

registerTool({
  name: 'create_artifact',
  description: 'Create an artifact (HTML, SVG, Markdown, Mermaid diagram, or code) to display in the side panel',
  input: createArtifactSchema,
  risk: 'safe',
  timeoutMs: 5000,
  run: async (input: unknown) => {
    const artifact = createArtifactSchema.parse(input);

    return {
      artifact: {
        id: `artifact-${Date.now()}`,
        ...artifact,
        createdAt: new Date().toISOString(),
      },
      success: true,
    };
  },
});
