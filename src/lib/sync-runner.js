/**
 * Sync Runner - ES Module
 * Fetches Strava activities, computes metrics, scores skills, determines build.
 * Now also reconstructs full build history timeline.
 */
import fs from 'fs';
import path from 'path';
import { evaluateInclusion, computeActivityMetrics } from './engine/activities.js';
import { computeSkills } from './engine/scoring.js';
import { computeBuild, computeModifier, describeBuild } from './engine/builds.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
function dataPath(file) { return path.join(DATA_DIR, file); }
function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readJSON(f) { ensureDir(); try { return JSON.parse(fs.readFileSync(dataPath(f), 'utf8')); } catch { return null; } }
function writeJSON(f, d) { ensureDir(); fs.writeFileSync(dataPath(f), JSON.stringify(d, null, 2)); }

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API = 'https://www.strava.com/api/v3';

async function refreshToken(user) {
  const now = Math.floor(Date.now() / 1000);
  if (user.token_expires_at > now + 300) return user.access_token;
  
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.refresh_token,
    }),
  });
  if (!res.ok) throw new Error('Token refresh failed: ' + res.status);
  const data = await res.json();
  
  const users = readJSON('users.json') || {};
  const key = String(user.strava_id);
  if (users[key]) {
    users[key].access_token = data.access_token;
    users[key].refresh_token = data.refresh_token;
    users[key].token_expires_at = data.expires_at;
    writeJSON('users.json', users);
  }
  return data.access_token;
}

async function fetchAllActivities(token) {
  let all = [], page = 1, hasMore = true;
  while (hasMore) {
    const url = `${STRAVA_API}/athlete/activities?page=${page}&per_page=100`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 429) throw new Error('RATE_LIMIT: Strava rate limit hit');
      throw new Error(`Strava API error: ${res.status}`);
    }
    const activities = await res.json();
    if (!activities || activities.length === 0) { hasMore = false; break; }
    all = all.concat(activities);
    if (activities.length < 100) hasMore = false;
    else { page++; await new Promise(r => setTimeout(r, 250)); }
  }
  return all;
}

function processActivities(rawActivities) {
  const processed = [];
  const metrics = [];

  for (const act of rawActivities) {
    const hasGPS = act.start_latlng && act.start_latlng.length === 2;
    const activity = {
      strava_id: act.id,
      name: act.name,
      sport_type: act.sport_type || act.type,
      workout_type: act.workout_type || null,
      start_date: act.start_date,
      start_date_local: act.start_date_local,
      elapsed_time_s: act.elapsed_time || 0,
      moving_time_s: act.moving_time || 0,
      distance_m: act.distance || 0,
      total_elevation_gain_m: act.total_elevation_gain || 0,
      average_speed_mps: act.average_speed || null,
      max_speed_mps: act.max_speed || null,
      average_heartrate: act.average_heartrate || null,
      max_heartrate: act.max_heartrate || null,
      average_cadence: act.average_cadence || null,
      has_heartrate: act.has_heartrate ? 1 : 0,
      has_cadence: act.average_cadence ? 1 : 0,
      has_gps: hasGPS ? 1 : 0,
      manual: act.manual ? 1 : 0,
      trainer: act.trainer ? 1 : 0,
      start_lat: hasGPS ? act.start_latlng[0] : null,
      start_lng: hasGPS ? act.start_latlng[1] : null,
    };

    const inclusion = evaluateInclusion(activity);
    activity.included = inclusion.included;
    activity.exclude_reason = inclusion.reason;

    processed.push(activity);

    if (activity.included) {
      const m = computeActivityMetrics(activity);
      m.strava_id = act.id;
      metrics.push(m);
    }
  }
  return { activities: processed, metrics };
}

/**
 * Reconstruct build history by replaying activities chronologically.
 * Computes snapshots at intervals and records when build identity changes.
 */
function computeBuildHistory(activities, metrics) {
  const included = activities.filter(a => a.included);
  if (included.length < 5) return [];

  included.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Compute at checkpoints: every 10 runs, minimum 5 runs before first checkpoint
  const checkpoints = [];
  const step = Math.max(8, Math.floor(included.length / 20));
  for (let i = Math.min(5, included.length - 1); i < included.length; i += step) {
    checkpoints.push(i);
  }
  // Always include the final run
  if (checkpoints[checkpoints.length - 1] !== included.length - 1) {
    checkpoints.push(included.length - 1);
  }

  const history = [];
  let prevBuildKey = null;
  let prevSnapshot = null;

  for (const idx of checkpoints) {
    const asOf = included[idx].start_date;
    const skills = computeSkills(activities, metrics, asOf, prevSnapshot);
    const build = computeBuild(skills);
    const activitiesUpTo = included.slice(0, idx + 1);
    const modifier = computeModifier(activitiesUpTo, skills);

    const buildKey = `${build.archetype}|${build.tier}|${modifier}`;

    if (buildKey !== prevBuildKey) {
      history.push({
        date: asOf,
        archetype: build.archetype,
        archetypeName: build.archetypeName,
        tier: build.tier,
        tierName: build.tierName,
        modifier,
        fullName: build.fullName,
        avg: build.avg,
        profile: build.profile,
        levelUpTip: build.levelUpTip,
        runCount: idx + 1,
      });
      prevBuildKey = buildKey;
    }

    // Store snapshot scores for regression calculation
    prevSnapshot = {};
    for (const k of Object.keys(skills)) {
      prevSnapshot[k] = skills[k].score;
    }
  }

  return history;
}

/**
 * Compute trend data by comparing current skills to ~30 days ago.
 */
function computeTrends(activities, metrics, currentSkills) {
  const included = activities.filter(a => a.included);
  if (included.length < 10) return null;

  included.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);

  // Find the activity closest to 30 days ago
  const cutoffActivity = included.find(a => new Date(a.start_date) <= thirtyDaysAgo);
  if (!cutoffActivity) return null;

  const pastSkills = computeSkills(activities, metrics, cutoffActivity.start_date, null);
  const trends = {};
  for (const k of Object.keys(currentSkills)) {
    const current = currentSkills[k]?.score || currentSkills[k] || 0;
    const past = pastSkills[k]?.score || 0;
    const delta = current - past;
    trends[k] = { current: Math.round(current * 10) / 10, past: Math.round(past * 10) / 10, delta: Math.round(delta * 10) / 10 };
  }
  return trends;
}

export async function runSync(userId) {
  const users = readJSON('users.json') || {};
  const user = Object.values(users).find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  const token = await refreshToken(user);
  const rawActivities = await fetchAllActivities(token);
  const { activities, metrics } = processActivities(rawActivities);

  // Save activities and metrics
  writeJSON(`activities_${user.strava_id}.json`, activities);
  writeJSON(`metrics_${user.strava_id}.json`, metrics);

  // Compute current skills
  const now = new Date().toISOString();
  const skills = computeSkills(activities, metrics, now, null);

  // Compute build
  const build = computeBuild(skills);
  const modifier = computeModifier(activities.filter(a => a.included), skills);
  const description = describeBuild(build, skills);

  // Reconstruct build history
  const buildHistory = computeBuildHistory(activities, metrics);

  // Compute trends
  const trends = computeTrends(activities, metrics, skills);

  const result = {
    skills: Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, { score: Math.round(v.score * 10) / 10, detail: v.detail }])),
    build: { ...build, modifier, description, fullName: build.tierName + ' ' + build.archetypeName },
    buildHistory,
    trends,
    activityCount: activities.filter(a => a.included).length,
    totalActivities: activities.length,
    syncedAt: now,
  };

  writeJSON(`result_${user.strava_id}.json`, result);
  return result;
}

export function getSyncResult(stravaId) {
  return readJSON(`result_${stravaId}.json`);
}

export function getActivityCount(stravaId) {
  const acts = readJSON(`activities_${stravaId}.json`);
  if (!acts) return { total: 0, included: 0 };
  return { total: acts.length, included: acts.filter(a => a.included).length };
}
