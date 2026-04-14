import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';

const SO = { password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only', cookieName: 'solestride_session', cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 2592000 } };

export async function POST() {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ status: 'completed', imported: 0, total: 0, message: 'Sync engine initializing' });
}

export async function GET() {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ status: 'none' });
}
