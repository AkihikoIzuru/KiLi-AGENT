import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { fetchModels } from '@/lib/ai/models';

export async function GET() {
  try {
    await requireAuth();

    const models = await fetchModels();

    return NextResponse.json({ models });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Failed to fetch models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
