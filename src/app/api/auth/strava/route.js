import { NextResponse } from 'next/server';

export async function GET(request) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  if (!clientId || !redirectUri) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', approval_prompt: 'auto', scope: 'read,activity:read_all', state: 'solestride' });
  return NextResponse.redirect('https://www.strava.com/oauth/authorize?' + params);
}
