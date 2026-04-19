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

const ARCHETYPE_PROFILES = {
  speed_demon: {
    identity: "You live for the feeling of legs turning over fast and ground disappearing beneath you. Speed is your language — you don't just run, you attack distance. Other runners admire your kick; you're the one people don't want to see lining up next to them at a race start.",
    howYouRun: "Your best runs are the fast ones. You gravitate toward shorter, sharper efforts and your splits tell the story of someone who runs with urgency. You probably warm up impatient and feel most alive when the pace drops below what most people consider comfortable.",
    strengths: "Raw velocity across distances. Your WA scores are your calling card — you convert fitness to speed more efficiently than most.",
    watchFor: "Speed without endurance base can plateau. Make sure you're not neglecting the slow miles that build the engine your speed depends on.",
  },
  long_hauler: {
    identity: "Distance is your natural habitat. While others are calculating pace, you're calculating how far you can go. You're the runner who adds 'a few more miles' to every planned run and genuinely enjoys the deep meditative state that comes after the first hour.",
    howYouRun: "You favor longer efforts over short bursts. Your training log shows runs that would intimidate most people by sheer distance alone. You hold pace remarkably well over long efforts — your 10th kilometer often looks like your 2nd.",
    strengths: "Endurance capacity and pace sustainability over distance. Your ability to hold steady effort over long runs is your defining trait.",
    watchFor: "Long slow miles alone won't develop top-end speed. Structured speed work even once a week can unlock a new gear without sacrificing your distance foundation.",
  },
  hill_grinder: {
    identity: "Flat courses bore you. You come alive when the road tilts upward and the field thins out around you. Hills are where you do your best work — where effort translates directly to vertical gain and the summit is the only finish line that matters.",
    howYouRun: "Your route choices tell the story: you seek elevation. Your climbing rate and total ascent numbers stand out because you don't avoid hills, you hunt them.",
    strengths: "Climbing power, elevation gain rate, and comfort on sustained grades. You maintain effort where others slow dramatically.",
    watchFor: "Hill strength without flat-ground speed can limit race performance. Mix in some flat tempo work to translate your climbing power into all-terrain versatility.",
  },
  cardiac_king: {
    identity: "You're the efficiency machine. Where others burn matches, you run on a slow, steady flame. Your heart rate data tells the story of someone whose aerobic engine is finely tuned — you produce speed at surprisingly low cardiac cost, the hallmark of genuine fitness.",
    howYouRun: "Your easy runs are truly easy. Your efficiency factor is notably high, meaning every heartbeat propels you further than most. You've built this through patient base training or natural aerobic gifts.",
    strengths: "Cardiac efficiency, aerobic economy, and the ability to run fast while keeping heart rate controlled.",
    watchFor: "High efficiency without speed work can leave race-day performance untapped. Your engine is strong — now give it some high-octane fuel with interval sessions.",
  },
  metronome: {
    identity: "Precision is your trademark. Your stride is calibrated, your cadence is consistent, and your form holds together when others fall apart. You're the runner whose GPS chart looks like it was drawn with a ruler.",
    howYouRun: "Your cadence data is remarkably consistent across runs. You've dialed in that optimal 175-185 spm sweet spot where biomechanical efficiency peaks.",
    strengths: "Mechanical efficiency, stride consistency, and form that holds together under fatigue.",
    watchFor: "Form without fitness can cap your potential. Your mechanics are dialed — now push the aerobic and speed boundaries.",
  },
  the_grinder: {
    identity: "You are the definition of discipline. While others have on-again-off-again relationships with running, you show up. Every week. Rain or shine. Your training log is a monument to consistency.",
    howYouRun: "Your weekly volume is stable and your frequency is high. You don't skip days easily and your training streaks are long. The habit is deeply embedded.",
    strengths: "Training consistency, frequency, and the compounding fitness gains that only come from months and years of unbroken work.",
    watchFor: "Consistency without variation can lead to staleness. Apply your discipline to periodized training with deliberate hard and easy phases.",
  },
  rubber_band: {
    identity: "Recovery is your secret weapon. You bounce back from hard efforts like nothing happened. While others need two easy days after a tempo run, you're back at it the next morning at full capacity.",
    howYouRun: "Your back-to-back run performance is notably strong. Minimal pace degradation even when you stack hard days together.",
    strengths: "Fatigue resistance, back-to-back performance, and the ability to absorb training load without breaking down.",
    watchFor: "Good recovery can mask overtraining. Strategic rest days can paradoxically make you faster.",
  },
  pathfinder: {
    identity: "Every run is an exploration. You're allergic to the same route twice and your GPS tracks look like a sprawling web across your city and beyond. Running is as much about discovery as fitness.",
    howYouRun: "Your route diversity is exceptional. Different starting points, different distances, different terrain types.",
    strengths: "Route diversity, geographic exploration, and terrain variety that builds well-rounded physical adaptability.",
    watchFor: "Exploration without structure can scatter your training focus. Explore freely, but with purpose.",
  },
  tempo_hound: {
    identity: "You've found the sweet spot where speed meets efficiency. Fast AND your heart rate proves you're not just redlining to get there. The runner's equivalent of a sports car with great fuel economy.",
    howYouRun: "Strong WA scores with excellent efficiency factors. You run fast without your heart rate going through the roof.",
    strengths: "The velocity-stamina combination is the most race-relevant pairing in running.",
    watchFor: "Push into longer tempo efforts to extend how long you can hold your efficient speed.",
  },
  weekend_warrior: {
    identity: "When you show up, you go hard. Your effort-per-session ratio is off the charts. You make every run count with real work across real distances at real pace.",
    howYouRun: "Concentrated bursts of quality. Speed and endurance both score well because your sessions are genuine training, not just logging miles.",
    strengths: "High-quality sessions that develop both speed and endurance simultaneously.",
    watchFor: "Adding even one more run per week — even a short easy one — could dramatically boost your consistency scores.",
  },
  volume_junkie: {
    identity: "Miles are your currency and you're wealthy. High weekly volume with the discipline to maintain it. While others debate whether to run today, you're already deep into your second run.",
    howYouRun: "High mileage, high consistency. You've internalized running as a daily practice.",
    strengths: "The endurance-fortitude combination builds deep aerobic fitness. You have the base that speed can be layered onto.",
    watchFor: "Volume without intensity can leave speed underdeveloped. Your massive base is the perfect foundation for structured speed work.",
  },
  trail_rat: {
    identity: "Pavement is just the road to the trailhead. You seek dirt, elevation, and terrain that demands more than just forward motion. Your runs read like hiking logs with significant climbing and varied terrain.",
    howYouRun: "You actively seek challenging terrain. You collect vertical gain and new routes like souvenirs.",
    strengths: "The ranging-ascent combination builds total-body fitness, ankle stability, and mental toughness.",
    watchFor: "Trail running can underdevelop raw speed. Mix in flat road tempo work.",
  },
  the_commuter: {
    identity: "Running isn't just exercise — it's how you move through the world. High consistency meets high route diversity because every day is a different run for a different reason.",
    howYouRun: "You run often and you run everywhere. Running is a mode of transportation as much as a sport.",
    strengths: "The consistency-exploration combination builds robust all-terrain fitness and an unshakeable habit.",
    watchFor: "Utilitarian running can lack structured intensity. Designate 1-2 runs per week as deliberate workouts.",
  },
  track_rat: {
    identity: "Speed AND form — both dials turned up. You're the runner who looks fast even standing still, with cadence dialed in and pace to back it up.",
    howYouRun: "High velocity paired with optimized cadence. Form and fitness amplify each other.",
    strengths: "The velocity-cadence combination is biomechanically optimal. Less energy wasted, fewer injury risks.",
    watchFor: "Build your long run to extend how far your speed carries.",
  },
  mountain_goat: {
    identity: "You live for long days in the mountains. Combining climbing power with distance capacity, you sign up for the races with the most elevation and wonder why everyone else looks worried.",
    howYouRun: "Big elevation, big distance. You don't just climb — you climb far.",
    strengths: "The ascent-endurance combination is the ultrarunner's calling card.",
    watchFor: "Mountain fitness doesn't always translate to flat speed. Periodic flat road tempo work keeps your overall pace sharp.",
  },
  iron_lung: {
    identity: "Your aerobic engine is massive AND you can run it all day. Cardiac efficiency meets distance capacity in a combination that screams 'built for endurance events.'",
    howYouRun: "Long runs at low heart rates. Remarkable efficiency even deep into long efforts.",
    strengths: "The stamina-endurance combination is the foundation of marathon and ultra performance.",
    watchFor: "Tempo and interval work can sharpen the blade your endurance has forged.",
  },
  clockwork: {
    identity: "Precise, consistent, reliable. Your cadence is dialed in and you show up like clockwork. Same form, same dedication, week after week.",
    howYouRun: "Consistent cadence paired with consistent training. Double consistency compounds into steady progress.",
    strengths: "The cadence-fortitude combination builds injury-resistant fitness.",
    watchFor: "Add one challenging session per week to push your pace ceiling.",
  },
  comeback_kid: {
    identity: "You train through anything. Fatigue, bad weather, tough weeks — none of it stops you. You don't just bounce back from adversity, you never left.",
    howYouRun: "Consistent training with minimal performance degradation between sessions.",
    strengths: "The resilience-fortitude combination is the most durable build.",
    watchFor: "Your ability to handle volume is the perfect base for adding structured intensity.",
  },
  disciplined_racer: {
    identity: "Fast AND reliable. Genuine speed backed by months of disciplined preparation. Not a one-race wonder — your WA scores are earned through consistency.",
    howYouRun: "High velocity paired with high fortitude. Your speed isn't accidental.",
    strengths: "The velocity-fortitude combination is the competitive runner's ideal.",
    watchFor: "Push into race-specific work to translate training speed into racing speed.",
  },
  terrain_mixer: {
    identity: "Variety keeps you fresh. Different routes, quick recovery from whatever terrain throws at you. You thrive on mixing it up.",
    howYouRun: "High route diversity paired with strong fatigue resistance.",
    strengths: "The ranging-resilience combination builds adaptable, well-rounded fitness.",
    watchFor: "Anchor your exploration around a periodized training framework.",
  },
  base_builder: {
    identity: "Playing the long game. Patient aerobic development paired with unwavering consistency. You understand that the runners who peak highest build the deepest foundations first.",
    howYouRun: "Strong cardiac efficiency paired with disciplined consistency.",
    strengths: "The stamina-fortitude combination builds the deepest possible fitness base.",
    watchFor: "Set a target race and start periodizing toward it. Your base is ready.",
  },
  all_rounder: {
    identity: "No weakness. No dominant strength either — and that's the point. Competent everywhere, limited nowhere. The Swiss Army knife of runners.",
    howYouRun: "Your skill radar is remarkably even. You don't have a 'thing' and that IS your thing.",
    strengths: "Balanced development across all 8 skills. You can compete in any format without a glaring weakness.",
    watchFor: "Balance can become a plateau. Pick ONE skill to focus on for 6-8 weeks.",
  },
  the_specialist: {
    identity: "One skill towers above all others — and it's magnificent. Where others spread thin, you've gone deep. That peak is your identity and your competitive advantage.",
    howYouRun: "Your highest skill is dramatically higher than the rest.",
    strengths: "Extreme peak performance in your primary skill.",
    watchFor: "The gap between your peak and your floor creates fragility. Shore up your weakest skill.",
  },
  raw_talent: {
    identity: "High highs and low lows. When you're on, you're ON — but the consistency isn't there yet. Your best runs look like someone a tier above you.",
    howYouRun: "Impressive peaks, wide variance. Genuine talent that hasn't been channeled into consistent training yet.",
    strengths: "Natural ability that produces occasional outstanding performances. Your ceiling is higher than your average suggests.",
    watchFor: "Consistent training — even at moderate intensity — would close the gap between your peaks and your average.",
  },
  workhorse: {
    identity: "You outwork everyone. You might not be the fastest in the room, but you'll be the last one standing. Your training consistency and grit are remarkable — what you lack in raw speed you more than make up for with relentless discipline.",
    howYouRun: "High fortitude, modest velocity. Your training log is thick and your commitment unquestionable. You rarely miss days and you've built deep fitness through accumulated work.",
    strengths: "Grit, consistency, and the compounding fitness that only comes from showing up every day for months and years.",
    watchFor: "Speed is your primary growth lever. Even one tempo or interval session per week would unlock a tier jump. Your base can absolutely handle the intensity — you've earned the right to push harder.",
  },
};

export function computeBuild(skills) {
  const scores = {};
  const SKILL_KEYS = ['velocity', 'endurance', 'ascent', 'stamina', 'cadence', 'fortitude', 'resilience', 'ranging'];
  for (const k of SKILL_KEYS) { scores[k] = skills[k]?.score || 0; }
  const avg = SKILL_KEYS.reduce((s, k) => s + scores[k], 0) / 8;
  const tier = TIERS.find(t => avg >= t.min && avg < t.max) || TIERS[0];

  const sorted = SKILL_KEYS.map(k => ({ k, s: scores[k] })).sort((a, b) => b.s - a.s);
  const top1 = sorted[0], top2 = sorted[1];
  const spread = sorted[0].s - sorted[sorted.length - 1].s;
  const gap12 = top1.s - top2.s;

  let archetype;

  if (spread < 12 && avg > 5) {
    archetype = ARCHETYPES.find(a => a.id === 'all_rounder');
  } else if (gap12 > 20) {
    archetype = ARCHETYPES.find(a => a.id === 'the_specialist');
  } else if (top1.s > avg * 1.6 && sorted[sorted.length - 1].s < avg * 0.5) {
    archetype = ARCHETYPES.find(a => a.id === 'raw_talent');
  } else if (scores.fortitude > avg * 1.2 && scores.velocity < avg * 0.85) {
    archetype = ARCHETYPES.find(a => a.id === 'workhorse');
  }

  if (!archetype && gap12 < 8) {
    const pair = [top1.k, top2.k].sort();
    const dualMatch = ARCHETYPES.filter(a => a.type === 'dual').find(a => {
      const ap = [...a.primary].sort();
      return ap[0] === pair[0] && ap[1] === pair[1];
    });
    if (dualMatch) archetype = dualMatch;
  }

  if (!archetype) {
    archetype = ARCHETYPES.find(a => a.type === 'single' && a.primary[0] === top1.k) || ARCHETYPES[0];
  }

  const nextTier = TIERS.find(t => t.min > avg);
  let levelUpTip = '';
  if (nextTier) {
    const gap = nextTier.min - avg;
    const weakest = sorted[sorted.length - 1];
    const secondWeakest = sorted[sorted.length - 2];
    levelUpTip = `You need ${gap.toFixed(1)} more points on your average to reach ${nextTier.n} tier. Your biggest opportunity is ${weakest.k} at ${Math.round(weakest.s)} — even modest gains there would push your average up fastest.`;
    if (weakest.s < 10 && secondWeakest.s > 30) {
      levelUpTip += ` If ${weakest.k} requires sensor data you don't have, focus on ${secondWeakest.k} at ${Math.round(secondWeakest.s)} instead.`;
    }
  } else {
    levelUpTip = 'You are at the highest tier. Focus on pushing individual skills toward their theoretical ceilings.';
  }

  const profile = ARCHETYPE_PROFILES[archetype.id] || {};

  return {
    archetype: archetype.id,
    archetypeName: archetype.n,
    tier: tier.id,
    tierName: tier.n,
    avg: Math.round(avg * 10) / 10,
    fullName: tier.n + ' ' + archetype.n,
    levelUpTip,
    profile,
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
  const profile = build.profile || {};
  return profile.identity || '';
}

export { ARCHETYPES, TIERS, ARCHETYPE_PROFILES };
