/**
 * Solestride Scoring Engine - ES Module
 * Computes 8 skills (0-100) from activity history.
 * Deterministic: same data => same scores always.
 */

const WINDOW_DAYS_SHORT = 42;
const WINDOW_DAYS_MEDIUM = 90;
const WINDOW_DAYS_LONG = 180;
const MIN_RUNS_SHORT = 8;
export const INACTIVITY_MILD = 14;
const INACTIVITY_MODERATE = 28;
const INACTIVITY_SEVERE = 56;

const REGRESSION_RATE = {
  velocity:  { mild: 0.002, moderate: 0.004, severe: 0.008 },
  endurance: { mild: 0.003, moderate: 0.006, severe: 0.012 },
  ascent:    { mild: 0.001, moderate: 0.003, severe: 0.006 },
  stamina:   { mild: 0.003, moderate: 0.005, severe: 0.010 },
  cadence:   { mild: 0.001, moderate: 0.002, severe: 0.004 },
  fortitude: { mild: 0.005, moderate: 0.010, severe: 0.015 },
  resilience:{ mild: 0.004, moderate: 0.008, severe: 0.012 },
  ranging:   { mild: 0.001, moderate: 0.002, severe: 0.003 },
};

function nlMap(raw, power = 0.55) {
  return Math.pow(Math.max(0, Math.min(1, raw)), power) * 100;
}

function selectWindow(runs, asOf) {
  const inWin = (days) => runs.filter(a => (asOf - new Date(a.start_date)) / 86400000 <= days);
  if (inWin(WINDOW_DAYS_SHORT).length >= MIN_RUNS_SHORT) return { days: WINDOW_DAYS_SHORT, runs: inWin(WINDOW_DAYS_SHORT) };
  if (inWin(WINDOW_DAYS_MEDIUM).length >= MIN_RUNS_SHORT) return { days: WINDOW_DAYS_MEDIUM, runs: inWin(WINDOW_DAYS_MEDIUM) };
  return { days: WINDOW_DAYS_LONG, runs: inWin(WINDOW_DAYS_LONG) };
}

function recencyWeight(daysDiff, halfLife = 30) {
  return Math.exp(-0.693 * daysDiff / halfLife);
}

export function computeSkills(activities, metricsArr, asOfDate, previousSnapshot) {
  const asOf = new Date(asOfDate);
  const included = activities.filter(a => a.included && new Date(a.start_date) <= asOf);
  included.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const win = selectWindow(included, asOf);
  const windowRuns = win.runs;
  const daysSinceLast = included.length > 0 ? (asOf - new Date(included[0].start_date)) / 86400000 : 999;
  const mLookup = {};
  for (const m of metricsArr) { mLookup[m.strava_id] = m; }
  const enriched = windowRuns.map(a => ({ ...a, m: mLookup[a.strava_id] || {} }));

  const skills = {
    velocity: computeVelocity(enriched, asOf),
    endurance: computeEndurance(enriched, asOf),
    ascent: computeAscent(enriched),
    stamina: computeStamina(enriched),
    cadence: computeCadence(enriched),
    fortitude: computeFortitude(included, asOf),
    resilience: computeResilience(enriched),
    ranging: computeRanging(enriched),
  };

  if (previousSnapshot && daysSinceLast > INACTIVITY_MILD) {
    for (const skill of Object.keys(skills)) {
      const rate = REGRESSION_RATE[skill];
      let dailyRate = 0;
      if (daysSinceLast > INACTIVITY_SEVERE) dailyRate = rate.severe;
      else if (daysSinceLast > INACTIVITY_MODERATE) dailyRate = rate.moderate;
      else dailyRate = rate.mild;
      const daysOver = daysSinceLast - INACTIVITY_MILD;
      const prev = previousSnapshot[skill] || 0;
      const regressed = prev * (1 - dailyRate * daysOver);
      skills[skill].score = Math.max(skills[skill].score, Math.max(regressed, 0));
    }
  }
  return skills;
}

function computeVelocity(runs, asOf) {
  const withWA = runs.filter(r => r.m && r.m.wa_score > 0).slice(0, 10);
  if (withWA.length === 0) return { score: 0, detail: { reason: 'No scored runs', runs_used: 0 } };
  withWA.sort((a, b) => (b.m.wa_score || 0) - (a.m.wa_score || 0));
  const top = withWA.slice(0, 5);
  let wSum = 0, wTotal = 0;
  top.forEach((r, i) => { const days = (asOf - new Date(r.start_date)) / 86400000; const w = recencyWeight(days) * (1 - i * 0.12); wSum += (r.m.wa_score || 0) * w; wTotal += w; });
  const avgWA = wTotal > 0 ? wSum / wTotal : 0;
  const raw = Math.min(avgWA / 1400, 1);
  const dists = top.map(r => r.m.distance_km || 0);
  const dRange = dists.length > 1 ? Math.max(...dists) - Math.min(...dists) : 0;
  return { score: nlMap(raw * 0.85 + Math.min(dRange / 15, 1) * 0.15 * raw), detail: { wa_avg: Math.round(avgWA), runs_used: top.length, top_wa: Math.round(top[0]?.m?.wa_score || 0) } };
}

function computeEndurance(runs, asOf) {
  if (runs.length === 0) return { score: 0, detail: { reason: 'No runs' } };
  const dists = runs.map(r => r.m?.distance_km || r.distance_m / 1000).sort((a, b) => b - a);
  const longest = dists[0] || 0;
  const avgTop3 = dists.slice(0, 3).reduce((s, d) => s + d, 0) / Math.min(dists.length, 3);
  const vol = dists.reduce((s, d) => s + d, 0);
  const span = runs.length > 0 ? (asOf - new Date(runs[runs.length - 1].start_date)) / 86400000 / 30 : 1;
  const mVol = vol / Math.max(span, 1);
  const combined = Math.min(longest / 50, 1) * 0.35 + Math.min(avgTop3 / 35, 1) * 0.35 + Math.min(mVol / 400, 1) * 0.30;
  return { score: nlMap(combined), detail: { longest_km: Math.round(longest * 10) / 10, avg_top3: Math.round(avgTop3 * 10) / 10, monthly_vol: Math.round(mVol) } };
}

function computeAscent(runs) {
  const withElev = runs.filter(r => (r.total_elevation_gain_m || 0) > 10);
  if (withElev.length === 0) return { score: 0, detail: { reason: 'No elevation data' } };
  const rates = withElev.map(r => (r.total_elevation_gain_m || 0) / (r.distance_m / 1000)).sort((a, b) => b - a);
  const topRate = rates.slice(0, 3).reduce((s, v) => s + v, 0) / Math.min(rates.length, 3);
  const totalClimb = withElev.reduce((s, r) => s + (r.total_elevation_gain_m || 0), 0);
  const hillFreq = withElev.filter(r => (r.total_elevation_gain_m || 0) / (r.distance_m / 1000) > 8).length / Math.max(runs.length, 1);
  const combined = Math.min(topRate / 80, 1) * 0.4 + Math.min(totalClimb / 5000, 1) * 0.3 + Math.min(hillFreq / 0.7, 1) * 0.3;
  return { score: nlMap(combined), detail: { top_rate: Math.round(topRate * 10) / 10, total_climb: Math.round(totalClimb), hill_pct: Math.round(hillFreq * 100) } };
}

function computeStamina(runs) {
  const withHR = runs.filter(r => r.has_heartrate && r.average_heartrate && r.m?.efficiency_factor);
  if (withHR.length === 0) return { score: 0, detail: { reason: 'No HR data', requires_hr: true } };
  const efs = withHR.map(r => r.m.efficiency_factor).sort((a, b) => b - a);
  const topEF = efs.slice(0, 5).reduce((s, v) => s + v, 0) / Math.min(efs.length, 5);
  const lowHR = withHR.filter(r => r.average_heartrate < 150).sort((a, b) => a.average_heartrate - b.average_heartrate);
  const easyHR = lowHR.length > 0 ? lowHR[0].average_heartrate : withHR.reduce((s, r) => s + r.average_heartrate, 0) / withHR.length;
  const combined = Math.min(topEF / 2.2, 1) * 0.65 + Math.max(0, 1 - (easyHR - 100) / 70) * 0.35;
  return { score: nlMap(combined), detail: { top_ef: Math.round(topEF * 100) / 100, easy_hr: Math.round(easyHR), hr_runs: withHR.length } };
}

function computeCadence(runs) {
  const withCad = runs.filter(r => r.m?.cadence_avg > 0);
  if (withCad.length === 0) return { score: 0, detail: { reason: 'No cadence data', requires_sensor: true } };
  const cads = withCad.map(r => r.m.cadence_avg);
  const avgCad = cads.reduce((s, v) => s + v, 0) / cads.length;
  const optRaw = Math.max(0, 1 - Math.abs(avgCad - 182) / 30);
  const cv = cads.length > 1 ? Math.sqrt(cads.reduce((s, v) => s + Math.pow(v - avgCad, 2), 0) / cads.length) / avgCad : 0;
  const combined = optRaw * 0.6 + Math.max(0, 1 - cv / 0.1) * 0.4;
  return { score: nlMap(combined), detail: { avg_cadence: Math.round(avgCad), cadence_runs: withCad.length } };
}

function computeFortitude(allRuns, asOf) {
  const cutoff = new Date(asOf - 90 * 86400000);
  const recent = allRuns.filter(a => new Date(a.start_date) >= cutoff && new Date(a.start_date) <= asOf);
  if (recent.length === 0) return { score: 0, detail: { reason: 'No recent runs' } };
  const weeks = {};
  recent.forEach(r => { const wk = Math.floor((asOf - new Date(r.start_date)) / (7 * 86400000)); weeks[wk] = (weeks[wk] || 0) + 1; });
  const totalWeeks = Math.max(Math.ceil(90 / 7), 1);
  const activeWeeks = Object.keys(weeks).length;
  const rpw = recent.length / totalWeeks;
  const weekDists = {};
  recent.forEach(r => { const wk = Math.floor((asOf - new Date(r.start_date)) / (7 * 86400000)); weekDists[wk] = (weekDists[wk] || 0) + r.distance_m / 1000; });
  const dv = Object.values(weekDists);
  const avg = dv.reduce((s, v) => s + v, 0) / Math.max(dv.length, 1);
  const cv = avg > 0 && dv.length > 1 ? Math.sqrt(dv.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / dv.length) / avg : 0;
  const combined = Math.min(rpw / 7, 1) * 0.3 + (activeWeeks / totalWeeks) * 0.35 + Math.max(0, 1 - cv) * 0.35;
  return { score: nlMap(combined), detail: { runs_per_week: Math.round(rpw * 10) / 10, active_weeks_pct: Math.round(activeWeeks / totalWeeks * 100), volume_cv: Math.round(cv * 100) / 100 } };
}

function computeResilience(runs) {
  if (runs.length < 3) return { score: 0, detail: { reason: 'Need 3+ runs' } };
  const sorted = [...runs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  let b2b = [], paces = [];
  for (let i = 0; i < sorted.length; i++) {
    const pace = sorted[i].moving_time_s / (sorted[i].distance_m / 1000); paces.push(pace);
    if (i > 0) { const gap = (new Date(sorted[i].start_date) - new Date(sorted[i - 1].start_date)) / 86400000; if (gap <= 2 && gap > 0) { const prev = sorted[i - 1].moving_time_s / (sorted[i - 1].distance_m / 1000); b2b.push((pace - prev) / prev); } }
  }
  const avgB2B = b2b.length > 0 ? b2b.reduce((s, v) => s + v, 0) / b2b.length : 0;
  const avgP = paces.reduce((s, v) => s + v, 0) / paces.length;
  const pCV = avgP > 0 ? Math.sqrt(paces.reduce((s, v) => s + Math.pow(v - avgP, 2), 0) / paces.length) / avgP : 0;
  const combined = Math.max(0, 1 - Math.max(avgB2B, 0) / 0.2) * 0.5 + Math.max(0, 1 - pCV / 0.15) * 0.5;
  return { score: nlMap(combined), detail: { b2b_drop: Math.round(avgB2B * 100) / 100, pace_cv: Math.round(pCV * 1000) / 1000, b2b_pairs: b2b.length } };
}

function computeRanging(runs) {
  if (runs.length === 0) return { score: 0, detail: { reason: 'No runs' } };
  const locs = new Set(), routes = new Set(), distB = new Set(), terr = new Set();
  runs.forEach(r => {
    if (r.m?.start_location_coarse) locs.add(r.m.start_location_coarse);
    if (r.m?.route_hash) routes.add(r.m.route_hash);
    distB.add(Math.round((r.distance_m / 1000) / 3) * 3);
    const epr = r.total_elevation_gain_m ? r.total_elevation_gain_m / (r.distance_m / 1000) : 0;
    terr.add(epr < 3 ? 'flat' : epr < 10 ? 'rolling' : epr < 25 ? 'hilly' : 'mountain');
  });
  const combined = Math.min(locs.size / 15, 1) * 0.3 + (runs.length > 0 ? Math.min(routes.size / (runs.length * 0.7), 1) : 0) * 0.3 + Math.min(distB.size / 6, 1) * 0.2 + Math.min(terr.size / 3, 1) * 0.2;
  return { score: nlMap(combined), detail: { locations: locs.size, unique_routes: routes.size, dist_buckets: distB.size, terrain_types: terr.size } };
}
