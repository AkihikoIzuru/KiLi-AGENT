import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

const SESSION_COOKIE_NAME = 'kili_session';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

type SessionPayload = {
  authenticated: boolean;
  createdAt: number;
};

function getSecretKey(): Uint8Array {
  const secret = env.SESSION_SECRET || 'development-secret-key-min-32-chars-long';
  return new TextEncoder().encode(secret);
}

export async function createSession(): Promise<void> {
  const payload: SessionPayload = {
    authenticated: true,
    createdAt: Date.now(),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const verified = await jwtVerify(token, getSecretKey());
    const payload = verified.payload as unknown as SessionPayload;
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
}
