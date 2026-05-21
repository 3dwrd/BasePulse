import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  address?: `0x${string}`;
  chainId?: number;
  issuedAt?: number;
}

const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-32-characters-long!!';

function getSessionOptions(): SessionOptions {
  const password = process.env.SIWE_SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!password || password.length < 32)) {
    throw new Error('SIWE_SESSION_SECRET must be set (>= 32 chars) in production');
  }
  return {
    password: password && password.length >= 32 ? password : DEV_FALLBACK_SECRET,
    cookieName: 'basepulse_session',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}
