import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { getUserById, updateUser, deleteUser } from '../../../lib/store.js';

const SO = { password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_only', cookieName: 'solestride_session', cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 2592000 } };

export async function GET(request) {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const user = getUserById(session.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    user: { id: user.id, strava_firstname: user.strava_firstname, strava_lastname: user.strava_lastname, unit_preference: user.unit_preference, sensitive_mode: user.sensitive_mode },
    activityCount: 0,
    currentBuild: null,
    currentSkills: null,
    syncStatus: { status: 'none' },
  });
}

export async function POST(request) {
  const session = await getIronSession(cookies(), SO);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await request.json();

  if (body.action === 'update-settings') {
    updateUser(session.stravaId, { unit_preference: body.unit_preference, sensitive_mode: body.sensitive_mode });
    return NextResponse.json({ ok: true });
  } else if (body.action === 'disconnect') {
    const user = getUserById(session.userId);
    if (user?.access_token) { try { await fetch('https://www.strava.com/oauth/deauthorize', { method:'POST', headers:{'Authorization':'Bearer '+user.access_token} }); } catch(e){} }
    session.destroy();
    return NextResponse.json({ ok: true });
  } else if (body.action === 'delete-all') {
    deleteUser(session.stravaId);
    session.destroy();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
