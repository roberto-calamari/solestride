import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { runSync } from '../../../lib/sync-runner.js';

const SO = { password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only', cookieName: 'solestride_session', cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 2592000 } };

export async function POST() {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const result = await runSync(session.userId);
    return NextResponse.json({ status: 'completed', ...result });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message, status: 'failed' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ status: 'ready' });
}
