import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../lib/session.js';
import { getUserById } from '../../../lib/store.js';

export async function GET() {
  const session = await getIronSession(cookies(), SESSION_OPTIONS);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const user = getUserById(session.userId);
  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), user }, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="solestride-export.json"' },
  });
}
