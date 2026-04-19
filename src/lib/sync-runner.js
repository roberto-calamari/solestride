/**
 * Sync Runner - ES Module
 * Now also computes: PRs, weekly stats, contributing runs, priority ranking.
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: user.refresh_token }),
  });
  if (!res.ok) throw new Error('Token refresh failed: ' + res.status);
  const data = await res.json();
  const users = readJSON('users.json') || {};
  const key = String(user.strava_id);
  if (users[key]) { users[key].access_token = data.access_token; users[key].refresh_token = data.refresh_token; users[key].token_expires_at = data.expires_at; writeJSON('users.json', users); }
  return data.access_token;
}

async function fetchAllActivities(token) {
  let all = [], page = 1;
  while (true) {
    const res = await fetch(`${STRAVA_API}/athlete/activities?page=${page}&per_page=100`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) { if (res.status === 429) throw new Error('RATE_LIMIT'); throw new Error(`Strava API ${res.status}`); }
    const acts = await res.json();
    if (!acts || acts.length === 0) break;
    all = all.concat(acts);
    if (acts.length < 100) break;
    page++; await new Promise(r => setTimeout(r, 250));
  }
  return all;
}

function processActivities(rawActivities) {
  const processed = [], metrics = [];
  for (const act of rawActivities) {
    const hasGPS = act.start_latlng && act.start_latlng.length === 2;
    const activity = {
      strava_id: act.id, name: act.name, sport_type: act.sport_type || act.type,
      start_date: act.start_date, start_date_local: act.start_date_local,
      elapsed_time_s: act.elapsed_time || 0, moving_time_s: act.moving_time || 0,
      distance_m: act.distance || 0, total_elevation_gain_m: act.total_elevation_gain || 0,
      average_speed_mps: act.average_speed || null, max_speed_mps: act.max_speed || null,
      average_heartrate: act.average_heartrate || null, max_heartrate: act.max_heartrate || null,
      average_cadence: act.average_cadence || null,
      has_heartrate: act.has_heartrate ? 1 : 0, has_cadence: act.average_cadence ? 1 : 0,
      has_gps: hasGPS ? 1 : 0, manual: act.manual ? 1 : 0, trainer: act.trainer ? 1 : 0,
      start_lat: hasGPS ? act.start_latlng[0] : null, start_lng: hasGPS ? act.start_latlng[1] : null,
    };
    const inclusion = evaluateInclusion(activity);
    activity.included = inclusion.included; activity.exclude_reason = inclusion.reason;
    processed.push(activity);
    if (activity.included) { const m = computeActivityMetrics(activity); m.strava_id = act.id; metrics.push(m); }
  }
  return { activities: processed, metrics };
}

function computePRs(activities, metrics) {
  const included = activities.filter(a => a.included);
  const mLookup = {}; for (const m of metrics) mLookup[m.strava_id] = m;

  let fastestEq5k = null, longestRun = null, biggestClimb = null;
  for (const a of included) {
    const m = mLookup[a.strava_id];
    if (m?.equivalent_5k_time_s && (!fastestEq5k || m.equivalent_5k_time_s < fastestEq5k.time)) {
      fastestEq5k = { time: m.equivalent_5k_time_s, name: a.name, date: a.start_date, km: Math.round(a.distance_m / 100) / 10 };
    }
    if (!longestRun || a.distance_m > longestRun.distance) {
      longestRun = { distance: a.distance_m, name: a.name, date: a.start_date, km: Math.round(a.distance_m / 100) / 10 };
    }
    if (a.total_elevation_gain_m > 10 && (!biggestClimb || a.total_elevation_gain_m > biggestClimb.elev)) {
      biggestClimb = { elev: a.total_elevation_gain_m, name: a.name, date: a.start_date, km: Math.round(a.distance_m / 100) / 10 };
    }
  }

  // Longest consecutive-day streak
  const dates = included.map(a => new Date(a.start_date).toISOString().slice(0, 10)).sort();
  const uniqueDates = [...new Set(dates)];
  let maxStreak = 1, curStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]), cur = new Date(uniqueDates[i]);
    if ((cur - prev) / 86400000 === 1) { curStreak++; if (curStreak > maxStreak) maxStreak = curStreak; }
    else curStreak = 1;
  }

  return {
    fastest5k: fastestEq5k ? { time_s: Math.round(fastestEq5k.time), name: fastestEq5k.name, date: fastestEq5k.date, km: fastestEq5k.km } : null,
    longestRun: longestRun ? { km: longestRun.km, name: longestRun.name, date: longestRun.date } : null,
    biggestClimb: biggestClimb ? { elev_m: Math.round(biggestClimb.elev), name: biggestClimb.name, date: biggestClimb.date, km: biggestClimb.km } : null,
    longestStreak: maxStreak,
  };
}

function computeWeeklyStats(activities) {
  const included = activities.filter(a => a.included);
  const now = new Date();
  const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek); startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeek = included.filter(a => new Date(a.start_date) >= startOfThisWeek);
  const lastWeek = included.filter(a => new Date(a.start_date) >= startOfLastWeek && new Date(a.start_date) < startOfThisWeek);

  const weekStats = (runs) => {
    if (runs.length === 0) return { runs: 0, km: 0, avgPace: 0 };
    const totalKm = runs.reduce((s, r) => s + r.distance_m / 1000, 0);
    const totalTime = runs.reduce((s, r) => s + r.moving_time_s, 0);
    return { runs: runs.length, km: Math.round(totalKm * 10) / 10, avgPace: totalKm > 0 ? Math.round(totalTime / totalKm) : 0 };
  };

  return { thisWeek: weekStats(thisWeek), lastWeek: weekStats(lastWeek) };
}

function computePriorityRanking(skills) {
  const SKILL_KEYS = ['velocity', 'endurance', 'ascent', 'stamina', 'cadence', 'fortitude', 'resilience', 'ranging'];
  const avg = SKILL_KEYS.reduce((s, k) => s + (skills[k]?.score || 0), 0) / 8;
  const ranked = SKILL_KEYS.map(k => ({
    key: k,
    score: skills[k]?.score || 0,
    gapFromAvg: avg - (skills[k]?.score || 0),
    hasSensorIssue: !!(skills[k]?.detail?.requires_hr || skills[k]?.detail?.requires_sensor),
  })).sort((a, b) => b.gapFromAvg - a.gapFromAvg);

  // Top 3 skills below average that would move the needle most
  return ranked.filter(s => s.gapFromAvg > 2).slice(0, 3).map(s => ({
    key: s.key,
    score: Math.round(s.score * 10) / 10,
    gapFromAvg: Math.round(s.gapFromAvg * 10) / 10,
    hasSensorIssue: s.hasSensorIssue,
  }));
}

function computeBuildHistory(activities, metrics) {
  const included = activities.filter(a => a.included);
  if (included.length < 5) return [];
  included.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const step = Math.max(8, Math.floor(included.length / 20));
  const checkpoints = [];
  for (let i = Math.min(5, included.length - 1); i < included.length; i += step) checkpoints.push(i);
  if (checkpoints[checkpoints.length - 1] !== included.length - 1) checkpoints.push(included.length - 1);

  const history = [];
  let prevKey = null, prevSnap = null;
  for (const idx of checkpoints) {
    const asOf = included[idx].start_date;
    const skills = computeSkills(activities, metrics, asOf, prevSnap);
    const build = computeBuild(skills);
    const modifier = computeModifier(included.slice(0, idx + 1), skills, prevSnap);
    const key = `${build.archetype}|${build.tier}|${modifier}`;
    if (key !== prevKey) {
      history.push({ date: asOf, archetype: build.archetype, archetypeName: build.archetypeName, tier: build.tier, tierName: build.tierName, modifier, fullName: build.fullName, avg: build.avg, profile: build.profile, levelUpTip: build.levelUpTip, runCount: idx + 1 });
      prevKey = key;
    }
    prevSnap = {}; for (const k of Object.keys(skills)) prevSnap[k] = skills[k].score;
  }
  return history;
}

function computeTrends(activities, metrics, currentSkills) {
  const included = activities.filter(a => a.included);
  if (included.length < 10) return { trends: null, previousScores: null };
  included.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const cutoff = included.find(a => new Date(a.start_date) <= thirtyDaysAgo);
  if (!cutoff) return { trends: null, previousScores: null };
  const pastSkills = computeSkills(activities, metrics, cutoff.start_date, null);
  const trends = {}, previousScores = {};
  for (const k of Object.keys(currentSkills)) {
    const cur = currentSkills[k]?.score || 0, past = pastSkills[k]?.score || 0;
    trends[k] = { current: Math.round(cur * 10) / 10, past: Math.round(past * 10) / 10, delta: Math.round((cur - past) * 10) / 10 };
    previousScores[k] = past;
  }
  return { trends, previousScores };
}

export async function runSync(userId) {
  const users = readJSON('users.json') || {};
  const user = Object.values(users).find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  const token = await refreshToken(user);
  const rawActivities = await fetchAllActivities(token);
  const { activities, metrics } = processActivities(rawActivities);
  writeJSON(`activities_${user.strava_id}.json`, activities);
  writeJSON(`metrics_${user.strava_id}.json`, metrics);

  const now = new Date().toISOString();
  const skills = computeSkills(activities, metrics, now, null);
  const build = computeBuild(skills);
  const { trends, previousScores } = computeTrends(activities, metrics, skills);
  const modifier = computeModifier(activities.filter(a => a.included), skills, previousScores);
  const description = describeBuild(build, skills);
  const buildHistory = computeBuildHistory(activities, metrics);
  const prs = computePRs(activities, metrics);
  const weeklyStats = computeWeeklyStats(activities);
  const priorities = computePriorityRanking(skills);

  const result = {
    skills: Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, {
      score: Math.round(v.score * 10) / 10,
      detail: v.detail,
      contributing: (v.contributing || []).slice(0, 5),
    }])),
    build: { ...build, modifier, description, fullName: build.tierName + ' ' + build.archetypeName },
    buildHistory, trends, prs, weeklyStats, priorities,
    activityCount: activities.filter(a => a.included).length,
    totalActivities: activities.length,
    syncedAt: now,
  };
  writeJSON(`result_${user.strava_id}.json`, result);
  return result;
}

export function getSyncResult(stravaId) { return readJSON(`result_${stravaId}.json`); }

export function getActivityCount(stravaId) {
  const acts = readJSON(`activities_${stravaId}.json`);
  if (!acts) return { total: 0, included: 0 };
  return { total: acts.length, included: acts.filter(a => a.included).length };
}

export function getActivities(stravaId) { return readJSON(`activities_${stravaId}.json`) || []; }
