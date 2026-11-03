import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getModel } from '@/lib/ai/provider';
import { generateText } from 'ai';
import { z } from 'zod';

const titleRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  model: z.string(),
  language: z.enum(['id', 'en']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const parsed = titleRequestSchema.parse(body);

    const { messages, model: modelId, language = 'id' } = parsed;

    const isIndonesian = language === 'id';

    const systemPrompt = isIndonesian
      ? 'Buatlah judul singkat (maksimal 6 kata) untuk percakapan ini. Jawab hanya dengan judulnya saja, tanpa tanda kutip atau penjelasan tambahan.'
      : 'Create a short title (maximum 6 words) for this conversation. Reply with only the title, without quotes or additional explanation.';

    const model = getModel(modelId);

    const result = await generateText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(0, 4), // Only use first few messages for context
      ],
      temperature: 0.7,
      maxTokens: 50,
    });

    const title = result.text.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ title });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Title generation error:', error);

    // Return a fallback title - default to Indonesian
    const fallbackTitle = 'Percakapan Baru';

    return NextResponse.json({ title: fallbackTitle });
  }
}
