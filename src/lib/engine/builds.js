/**
 * Solestride Build Taxonomy - ES Module
 * 25 archetypes x 7 tiers x 7 modifiers = 1,225 builds
 */

const ARCHETYPES = [
  { id: 'speed_demon', n: 'Speed Demon', type: 'single', primary: ['velocity'] },
  { id: 'long_hauler', n: 'Long Hauler', type: 'single', primary: ['endurance'] },
  { id: 'hill_grinder', n: 'Hill Grinder', type: 'single', primary: ['ascent'] },
  { id: 'cardiac_king', n: 'Cardiac King', type: 'single', primary: ['stamina'] },
  { id: 'metronome', n: 'Metronome', type: 'single', primary: ['cadence'] },
  { id: 'the_grinder', n: 'The Grinder', type: 'single', primary: ['fortitude'] },
  { id: 'rubber_band', n: 'Rubber Band', type: 'single', primary: ['resilience'] },
  { id: 'pathfinder', n: 'Pathfinder', type: 'single', primary: ['ranging'] },
  { id: 'tempo_hound', n: 'Tempo Hound', type: 'dual', primary: ['velocity', 'stamina'] },
  { id: 'weekend_warrior', n: 'Weekend Warrior', type: 'dual', primary: ['velocity', 'endurance'] },
  { id: 'volume_junkie', n: 'Volume Junkie', type: 'dual', primary: ['endurance', 'fortitude'] },
  { id: 'trail_rat', n: 'Trail Rat', type: 'dual', primary: ['ranging', 'ascent'] },
  { id: 'the_commuter', n: 'The Commuter', type: 'dual', primary: ['fortitude', 'ranging'] },
  { id: 'track_rat', n: 'Track Rat', type: 'dual', primary: ['velocity', 'cadence'] },
  { id: 'mountain_goat', n: 'Mountain Goat', type: 'dual', primary: ['ascent', 'endurance'] },
  { id: 'iron_lung', n: 'Iron Lung', type: 'dual', primary: ['stamina', 'endurance'] },
  { id: 'clockwork', n: 'Clockwork', type: 'dual', primary: ['cadence', 'fortitude'] },
  { id: 'comeback_kid', n: 'Comeback Kid', type: 'dual', primary: ['resilience', 'fortitude'] },
  { id: 'disciplined_racer', n: 'Disciplined Racer', type: 'dual', primary: ['velocity', 'fortitude'] },
  { id: 'terrain_mixer', n: 'Terrain Mixer', type: 'dual', primary: ['ranging', 'resilience'] },
  { id: 'base_builder', n: 'Base Builder', type: 'dual', primary: ['stamina', 'fortitude'] },
  { id: 'all_rounder', n: 'All-Rounder', type: 'shape', primary: [] },
  { id: 'the_specialist', n: 'The Specialist', type: 'shape', primary: [] },
  { id: 'raw_talent', n: 'Raw Talent', type: 'shape', primary: [] },
  { id: 'workhorse', n: 'Workhorse', type: 'shape', primary: [] },
];

const TIERS = [
  { id: 'beginner', n: 'Beginner', min: 0, max: 10 },
  { id: 'developing', n: 'Developing', min: 10, max: 22 },
  { id: 'solid', n: 'Solid', min: 22, max: 36 },
  { id: 'strong', n: 'Strong', min: 36, max: 50 },
  { id: 'competitive', n: 'Competitive', min: 50, max: 65 },
  { id: 'elite', n: 'Elite', min: 65, max: 82 },
  { id: 'world_class', n: 'World-Class', min: 82, max: 101 },
];

export function computeBuild(skills) {
  const scores = {};
  const SKILL_KEYS = ['velocity', 'endurance', 'ascent', 'stamina', 'cadence', 'fortitude', 'resilience', 'ranging'];
  for (const k of SKILL_KEYS) { scores[k] = skills[k]?.score || 0; }
  const avg = SKILL_KEYS.reduce((s, k) => s + scores[k], 0) / 8;
  const tier = TIERS.find(t => avg >= t.min && avg < t.max) || TIERS[0];

  // Sort skills descending
  const sorted = SKILL_KEYS.map(k => ({ k, s: scores[k] })).sort((a, b) => b.s - a.s);
  const top1 = sorted[0], top2 = sorted[1];
  const spread = sorted[0].s - sorted[sorted.length - 1].s;
  const gap12 = top1.s - top2.s;

  let archetype;

  // Shape-based checks first
  if (spread < 12 && avg > 5) {
    archetype = ARCHETYPES.find(a => a.id === 'all_rounder');
  } else if (gap12 > 20) {
    archetype = ARCHETYPES.find(a => a.id === 'the_specialist');
  } else if (top1.s > avg * 1.6 && sorted[sorted.length - 1].s < avg * 0.5) {
    archetype = ARCHETYPES.find(a => a.id === 'raw_talent');
  } else if (scores.fortitude > avg * 1.2 && scores.velocity < avg * 0.85) {
    archetype = ARCHETYPES.find(a => a.id === 'workhorse');
  }

  // Dual-dominant check
  if (!archetype && gap12 < 8) {
    const pair = [top1.k, top2.k].sort();
    const dualMatch = ARCHETYPES.filter(a => a.type === 'dual').find(a => {
      const ap = [...a.primary].sort();
      return ap[0] === pair[0] && ap[1] === pair[1];
    });
    if (dualMatch) archetype = dualMatch;
  }

  // Single-dominant fallback
  if (!archetype) {
    archetype = ARCHETYPES.find(a => a.type === 'single' && a.primary[0] === top1.k) || ARCHETYPES[0];
  }

  return {
    archetype: archetype.id,
    archetypeName: archetype.n,
    tier: tier.id,
    tierName: tier.n,
    avg: Math.round(avg * 10) / 10,
    fullName: tier.n + ' ' + archetype.n,
  };
}

export function computeModifier(activities, skills) {
  if (activities.length < 20) return 'Fresh';
  if (activities.length > 200) {
    const fort = skills.fortitude?.score || 0;
    if (fort > 55) return 'Veteran';
  }
  const fort = skills.fortitude?.score || 0;
  const fortDetail = skills.fortitude?.detail || {};
  if (fort > 55 && (fortDetail.volume_cv || 0) < 0.4) return 'Consistent';
  if ((fortDetail.volume_cv || 0) > 0.6) return 'Streaky';
  return 'Consistent';
}

export function describeBuild(build, skills) {
  const sk = Object.entries(skills).sort((a, b) => (b[1]?.score || 0) - (a[1]?.score || 0));
  const top = sk[0], bot = sk[sk.length - 1];
  return `Your strongest skill is ${top[0]} at ${Math.round(top[1]?.score || 0)}. ` +
    `Your build averages ${build.avg} across all skills, placing you in ${build.tierName} tier. ` +
    `${bot[0]} at ${Math.round(bot[1]?.score || 0)} is your biggest growth opportunity.`;
}
