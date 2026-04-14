/**
 * Activity Processing - ES Module version
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
  // WA score
  if (metrics.equivalent_5k_time_s) {
    const A = 0.0001732, B = 3600, C = 2.0;
    if (metrics.equivalent_5k_time_s < B) {
      metrics.wa_score = Math.min(Math.max(A * Math.pow(B - metrics.equivalent_5k_time_s, C), 0), 1400);
    } else { metrics.wa_score = 0; }
  }
  // HR metrics
  if (activity.has_heartrate && activity.average_heartrate) {
    const speedMps = activity.distance_m / activity.moving_time_s;
    metrics.efficiency_factor = (speedMps * 60) / activity.average_heartrate;
    metrics.pace_hr_ratio = activity.distance_m / (activity.average_heartrate * (activity.moving_time_s / 60));
  }
  // Cadence
  if (activity.average_cadence) {
    metrics.cadence_avg = activity.average_cadence * 2;
  }
  // Location coarsening
  if (activity.start_lat && activity.start_lng) {
    const lat = Math.round(activity.start_lat * 100) / 100;
    const lng = Math.round(activity.start_lng * 100) / 100;
    metrics.start_location_coarse = `${lat},${lng}`;
    let h = 0; const s = `${lat}:${lng}:${Math.round(distKm)}`;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h &= h; }
    metrics.route_hash = Math.abs(h).toString(36);
  }
  return metrics;
}
