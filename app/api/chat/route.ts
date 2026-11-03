import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getModel } from '@/lib/ai/provider';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { streamText } from 'ai';
import { z } from 'zod';
import { convertToolsForAISDK } from '@/lib/agent/adapter';
import '@/lib/agent'; // Import to register all tools

export const maxDuration = 60;

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  agentMode: z.boolean().optional(),
  language: z.enum(['id', 'en']).optional(),
  customInstructions: z.string().optional(),
  projectInstructions: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const parsed = chatRequestSchema.parse(body);

    const {
      messages,
      model: modelId,
      temperature = 0.7,
      maxTokens = 4096,
      agentMode = false,
      language = 'id',
      customInstructions,
      projectInstructions,
    } = parsed;

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      language,
      customInstructions,
      projectInstructions,
      agentMode,
    });

    // Prepend system message
    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ];

    const model = getModel(modelId);

    // If agent mode is enabled, include tools
    const streamConfig: any = {
      model,
      messages: messagesWithSystem,
      temperature,
      maxTokens,
      onFinish: async ({ text, finishReason }: any) => {
        console.log('Stream finished:', { finishReason, length: text.length });
      },
    };

    // Add tools if agent mode is enabled
    if (agentMode) {
      const tools = convertToolsForAISDK();
      streamConfig.tools = tools;
      streamConfig.maxSteps = parseInt(process.env.AGENT_MAX_STEPS || '10');
    }

    // Stream response
    const result = await streamText(streamConfig);

    return result.toDataStreamResponse();
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chat error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('unauthorized') || message.includes('401')) {
        return NextResponse.json(
          { error: 'API key incorrect or denied. Check AI_API_KEY.' },
          { status: 401 }
        );
      }

      if (message.includes('not found') || message.includes('404')) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      if (message.includes('rate limit') || message.includes('429')) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait and try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
