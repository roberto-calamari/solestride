/**
 * Activity Processing - ES Module
 */

export function evaluateInclusion(activity) {
  const validTypes = ['Run', 'TrailRun'];
  if (!validTypes.includes(activity.sport_type)) return { included: false, reason: `sport_type: ${activity.sport_type}` };
  if (activity.trainer) return { included: false, reason: 'trainer/treadmill' };
  if (activity.manual) return { included: false, reason: 'manual entry' };
  const hasGPS = activity.has_gps || (activity.start_lat != null && activity.start_lat !== 0);
  if (!hasGPS) return { included: false, reason: 'no GPS data' };
  if (activity.distance_m < 500) return { included: false, reason: 'too short: < 500m' };
  if (activity.moving_time_s < 120) return { included: false, reason: 'too brief: < 2 min' };
  return { included: true, reason: null };
}

/**
 * Speed Index lookup table - calibrated performance scoring.
 * Maps equivalent 5K time (seconds) to a 0-1400 index.
 * Higher = faster. Scale is internal to Solestride.
 */
const SPEED_INDEX_TABLE = [
  [720, 1400],  // 12:00 - world record territory
  [780, 1300],  // 13:00
  [840, 1190],  // 14:00
  [900, 1085],  // 15:00
  [960, 985],   // 16:00
  [1020, 890],  // 17:00
  [1080, 800],  // 18:00
  [1140, 715],  // 19:00
  [1200, 635],  // 20:00
  [1260, 560],  // 21:00
  [1320, 490],  // 22:00
  [1380, 425],  // 23:00
  [1440, 365],  // 24:00
  [1500, 310],  // 25:00
  [1560, 260],  // 26:00
  [1620, 215],  // 27:00
  [1680, 175],  // 28:00
  [1800, 110],  // 30:00
  [1920, 65],   // 32:00
  [2100, 30],   // 35:00
  [2400, 10],   // 40:00
  [3000, 2],    // 50:00
  [3600, 0],    // 60:00
];

function lookupSpeedIndex(eq5kSeconds) {
  if (eq5kSeconds <= SPEED_INDEX_TABLE[0][0]) return SPEED_INDEX_TABLE[0][1];
  if (eq5kSeconds >= SPEED_INDEX_TABLE[SPEED_INDEX_TABLE.length - 1][0]) return 0;
  for (let i = 0; i < SPEED_INDEX_TABLE.length - 1; i++) {
    if (eq5kSeconds >= SPEED_INDEX_TABLE[i][0] && eq5kSeconds < SPEED_INDEX_TABLE[i + 1][0]) {
      const t = (eq5kSeconds - SPEED_INDEX_TABLE[i][0]) / (SPEED_INDEX_TABLE[i + 1][0] - SPEED_INDEX_TABLE[i][0]);
      return Math.round(SPEED_INDEX_TABLE[i][1] * (1 - t) + SPEED_INDEX_TABLE[i + 1][1] * t);
    }
  }
  return 0;
}

export function computeActivityMetrics(activity) {
  const distKm = activity.distance_m / 1000;
  const pacePerKm = activity.moving_time_s / distKm;
  const metrics = {
    pace_per_km_s: pacePerKm, distance_km: distKm,
    elevation_per_km: distKm > 0 ? (activity.total_elevation_gain_m || 0) / distKm : 0,
    equivalent_5k_time_s: null, wa_score: null, pace_decay_pct: null,
    efficiency_factor: null, pace_hr_ratio: null,
    cadence_avg: null, start_location_coarse: null, route_hash: null,
  };
  // Riegel 5K equivalent
  if (distKm >= 1.0) {
    metrics.equivalent_5k_time_s = activity.moving_time_s * Math.pow(5.0 / distKm, 1.06);
  }
  // Speed Index (replaces old WA approximation with calibrated lookup)
  if (metrics.equivalent_5k_time_s) {
    metrics.wa_score = lookupSpeedIndex(metrics.equivalent_5k_time_s);
  }
  // HR metrics
  if (activity.has_heartrate && activity.average_heartrate) {
    const speedMps = activity.distance_m / activity.moving_time_s;
    metrics.efficiency_factor = (speedMps * 60) / activity.average_heartrate;
    metrics.pace_hr_ratio = activity.distance_m / (activity.average_heartrate * (activity.moving_time_s / 60));
  }
  // Cadence (Strava gives half-cadence for running)
  if (activity.average_cadence) {
    metrics.cadence_avg = activity.average_cadence * 2;
  }
  // Location coarsening (~1km grid for privacy)
  if (activity.start_lat && activity.start_lng) {
    const lat = Math.round(activity.start_lat * 100) / 100;
    const lng = Math.round(activity.start_lng * 100) / 100;
    metrics.start_location_coarse = `${lat},${lng}`;
    // Route hash - combine lat, lng, distance, and elevation for better uniqueness
    let h = 0;
    const s = `${lat}:${lng}:${Math.round(distKm * 10)}:${Math.round((activity.total_elevation_gain_m || 0) / 10)}`;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h &= h; }
    metrics.route_hash = Math.abs(h).toString(36);
  }
  return metrics;
}
