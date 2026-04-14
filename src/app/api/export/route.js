import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { getUserById } from '../../../lib/store.js';

const SO = { password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only', cookieName: 'solestride_session', cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 2592000 } };

export async function GET() {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const user = getUserById(session.userId);
  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), user }, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="solestride-export.json"' },
  });
}
