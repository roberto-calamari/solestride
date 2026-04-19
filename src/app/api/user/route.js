import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../lib/session.js';
import { getUserById, updateUser, deleteUser } from '../../../lib/store.js';
import { getSyncResult, getActivityCount, getActivities } from '../../../lib/sync-runner.js';

export async function GET(request) {
  const session = await getIronSession(cookies(), SESSION_OPTIONS);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const user = getUserById(session.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  // Activities endpoint for Runs tab
  if (section === 'activities') {
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 50;
    const activities = getActivities(user.strava_id);
    const included = activities.filter(a => a.included);
    included.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const total = included.length;
    const paged = included.slice((page - 1) * perPage, page * perPage);
    return NextResponse.json({
      activities: paged.map(a => ({
        strava_id: a.strava_id,
        name: a.name,
        start_date: a.start_date,
        start_date_local: a.start_date_local,
        distance_m: a.distance_m,
        moving_time_s: a.moving_time_s,
        total_elevation_gain_m: a.total_elevation_gain_m,
        average_heartrate: a.average_heartrate,
        sport_type: a.sport_type,
      })),
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    });
  }

  const result = getSyncResult(user.strava_id);
  const counts = getActivityCount(user.strava_id);

  return NextResponse.json({
    user: { id: user.id, strava_firstname: user.strava_firstname, strava_lastname: user.strava_lastname, unit_preference: user.unit_preference, sensitive_mode: user.sensitive_mode },
    activityCount: counts.included,
    totalActivities: counts.total,
    currentBuild: result?.build || null,
    currentSkills: result?.skills || null,
    buildHistory: result?.buildHistory || [],
    trends: result?.trends || null,
    prs: result?.prs || null,
    weeklyStats: result?.weeklyStats || null,
    priorities: result?.priorities || [],
    syncedAt: result?.syncedAt || null,
    syncStatus: result ? { status: 'completed' } : { status: 'none' },
  });
}

export async function POST(request) {
  const session = await getIronSession(cookies(), SESSION_OPTIONS);
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await request.json();
  if (body.action === 'disconnect') {
    const user = getUserById(session.userId);
    if (user?.access_token) {
      try { await fetch('https://www.strava.com/oauth/deauthorize', { method: 'POST', headers: { 'Authorization': 'Bearer ' + user.access_token } }); } catch (e) { }
    }
    session.destroy();
    return NextResponse.json({ ok: true });
  } else if (body.action === 'delete-all') {
    const user = getUserById(session.userId);
    if (user) deleteUser(user.strava_id);
    session.destroy();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
