import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../lib/session.js';
import { runSync } from '../../../lib/sync-runner.js';

export async function POST() {
  const session = await getIronSession(cookies(), SESSION_OPTIONS);
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
  const session = await getIronSession(cookies(), SESSION_OPTIONS);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ status: 'ready' });
}
