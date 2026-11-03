import { NextRequest, NextResponse } from 'next/server';
import { createSession, deleteSession, verifySession } from '@/lib/auth/session';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, action } = body;

    // Logout action
    if (action === 'logout') {
      await deleteSession();
      return NextResponse.json({ success: true });
    }

    // Login action
    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    const expectedPassword = env.ACCESS_PASSWORD || 'development';

    if (password === expectedPassword) {
      await createSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isAuthenticated = await verifySession();
  return NextResponse.json({ authenticated: isAuthenticated });
}
