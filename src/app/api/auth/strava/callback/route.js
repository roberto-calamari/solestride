import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { saveUser } from '../../../../../lib/store.js';

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only',
  cookieName: 'solestride_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 60*60*24*30 },
};

function getBaseUrl(req) {
  const h = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const p = req.headers.get('x-forwarded-proto') || 'https';
  return p + '://' + h;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const base = getBaseUrl(request);

  if (error || !code) return NextResponse.redirect(base + '/?error=auth_denied');

  try {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      console.error('Token exchange failed:', res.status, await res.text());
      return NextResponse.redirect(base + '/?error=token_failed');
    }

    const data = await res.json();
    const user = saveUser(data.athlete, data);

    const session = await getIronSession(cookies(), SESSION_OPTIONS);
    session.userId = user.id;
    session.stravaId = data.athlete.id;
    session.firstName = data.athlete.firstname;
    await session.save();

    return NextResponse.redirect(base + '/dashboard');
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(base + '/?error=server_error');
  }
}
