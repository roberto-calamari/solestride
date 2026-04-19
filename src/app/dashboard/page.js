'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

// ===== SKILL META WITH LANDMARKS + INTERPRETATION =====
const SKILL_META = {
  velocity:{n:'Velocity',i:'⚡',c:'#f0c868',s:'Raw speed vs world standards',
    method:'Each run is converted to an equivalent 5K time using the Riegel formula, then scored on Solestride\'s 0-1400 Speed Index. Your best 5 runs in the scoring window are selected, weighted by recency, and averaged against the theoretical ceiling of 1400.',
    tips:'Add one tempo session per week (20-30 min at comfortably hard pace). Parkruns and local 5Ks are also great catalysts for moving this number.',
    landmarks:[{at:15,label:'30min 5K'},{at:30,label:'25min 5K'},{at:50,label:'20min 5K'},{at:60,label:'Sub-18'},{at:75,label:'Club racer'},{at:90,label:'National'}],
    interpret:(s)=>s<10?'Very early. Your speed data is still building — keep logging runs.':s<25?'Equivalent to roughly a 27-28 minute 5K. Solid recreational pace with lots of room to grow.':s<40?'Roughly a 22-24 minute 5K equivalent. Faster than most recreational runners.':s<55?'Around a 19-21 minute 5K equivalent — comfortably in competitive recreational territory.':s<70?'Sub-19 minute 5K territory. You\'re faster than the large majority of runners.':s<85?'Club and regional competitive level. Genuinely fast.':'National-class speed. Elite territory.',
    metrics:{
      wa_avg:{label:'Speed Index (Average)',ex:'Your weighted average across your top recent runs on a 0-1400 scale. A 25:00 5K equivalent scores ~310. A competitive 18:00 5K scores ~800. Higher = faster.'},
      runs_used:{label:'Runs Contributing',ex:'How many of your runs contributed. Only your top 5 most recent are used, weighted so recent performances count more.'},
      top_wa:{label:'Best Single Speed Index',ex:'Your highest score from any single run — your peak speed performance.'},
    }},
  endurance:{n:'Endurance',i:'🛤',c:'#68a878',s:'Distance capacity & pace holding',
    method:'Combines your longest single run (35%), average of top 3 longest (35%), and monthly volume (30%). Each compared against high human ceilings.',
    tips:'Extend your weekly long run by 10% every 2-3 weeks. Adding one extra easy run per week also builds monthly volume.',
    landmarks:[{at:15,label:'5K runs'},{at:30,label:'10K runs'},{at:45,label:'Half marathon'},{at:60,label:'Marathon'},{at:75,label:'50km+'},{at:90,label:'Ultra'}],
    interpret:(s)=>s<10?'Early days. Your distance capacity is still developing.':s<25?'You\'re running regularly but mostly shorter distances. Your longest runs are in the 5-8km range.':s<40?'Solid recreational distance runner. Long runs around 10-15km with decent monthly volume.':s<55?'Strong distance capacity — half-marathon-length long runs with consistent weekly mileage.':s<70?'Serious endurance. Your long runs, volume, and pace sustainability are all well-developed.':s<85?'Marathon-plus endurance. Deep aerobic base built through months of high-volume training.':'Ultra-level endurance. Exceptional distance capacity across all measures.',
    metrics:{
      longest_km:{label:'Longest Run (km)',ex:'Your longest single run. Compared against 50km ceiling.'},
      avg_top3:{label:'Avg Top 3 Runs (km)',ex:'Average distance of your 3 longest — more reliable than a single outlier.'},
      monthly_vol:{label:'Monthly Volume (km)',ex:'Total distance ÷ months. Compared against 400km/month.'},
    }},
  ascent:{n:'Ascent',i:'⛰',c:'#a08060',s:'Climbing power',
    method:'Top climbing rate in m/km (40%), total elevation gain (30%), and hilly run frequency (30%).',
    tips:'Seek hillier routes or add hill repeats. Even one hilly route per week makes a big difference.',
    landmarks:[{at:15,label:'Flat roads'},{at:30,label:'Some hills'},{at:50,label:'Regular hills'},{at:65,label:'Hilly runner'},{at:80,label:'Mountain'},{at:92,label:'Alpine'}],
    interpret:(s)=>s<10?'Mostly flat running. Very little elevation in your data.':s<25?'Occasional hills but mostly flat terrain. Your routes don\'t have much vertical challenge.':s<40?'You encounter hills regularly. Moderate climbing rate with decent total elevation.':s<55?'Genuinely hilly runner. You seek out elevation and your climbing numbers reflect it.':s<70?'Strong climber. Your elevation gain rate and total climbing are well above average.':s<85?'Mountain-level climbing. Steep grades and big vertical days are your norm.':'Alpine territory. Exceptional climbing power and volume.',
    metrics:{
      top_rate:{label:'Top Climbing Rate (m/km)',ex:'Avg elevation per km on your 3 hilliest runs. Flat=0-3, rolling=5-10, hilly=10-25, mountain=25+.'},
      total_climb:{label:'Total Elevation (m)',ex:'Sum of all elevation gain. Compared against 5,000m.'},
      hill_pct:{label:'Hilly Run Frequency (%)',ex:'Percentage of runs with 8+ m/km elevation rate.'},
    }},
  stamina:{n:'Stamina',i:'♥',c:'#d06050',s:'Cardiac efficiency (needs HR)',
    method:'Efficiency Factor — pace relative to heart rate (65%) and lowest easy-run HR (35%). Requires HR monitor.',
    tips:'Run truly easy (conversational pace) 80% of the time. Cardiac efficiency takes months — patience is key.',
    landmarks:[{at:20,label:'Beginner EF'},{at:40,label:'Recreational'},{at:55,label:'Trained'},{at:70,label:'Well-trained'},{at:85,label:'Elite aerobic'}],
    interpret:(s)=>s===0?'No heart rate data available. Wear an HR monitor to unlock this skill.':s<20?'Your cardiac efficiency is still developing. Pace-to-HR ratio suggests early aerobic base.':s<40?'Typical recreational runner efficiency. Your heart is working hard for the pace you produce.':s<55?'Good aerobic development. You produce meaningful speed at controlled heart rates.':s<70?'Strong cardiac efficiency. Your heart rate stays low relative to your pace — a sign of genuine fitness.':s<85?'Excellent aerobic engine. Your efficiency factor rivals serious competitive runners.':'Elite cardiac efficiency. Exceptional pace-to-HR ratio.',
    metrics:{
      top_ef:{label:'Efficiency Factor (Top 5)',ex:'Pace÷HR averaged across best 5. Higher=more speed per heartbeat. 1.0-1.2 beginner, 1.5-1.8 serious, 1.8+ elite.'},
      easy_hr:{label:'Easiest Run HR (bpm)',ex:'Lowest average HR from an easy run. Lower=more aerobic fitness.'},
      hr_runs:{label:'Runs With HR Data',ex:'Runs with heart rate data. More=more reliable score.'},
    }},
  cadence:{n:'Cadence',i:'👟',c:'#9878b0',s:'Stride mechanics (needs sensor)',
    method:'Closeness to optimal ~182 spm (60%) and consistency across runs (40%). Requires cadence device.',
    tips:'Run to a metronome app at 5 spm above your current average. Shorter, quicker strides reduce impact.',
    landmarks:[{at:20,label:'~160 spm'},{at:40,label:'~168 spm'},{at:55,label:'~174 spm'},{at:70,label:'~178 spm'},{at:85,label:'~182 spm'},{at:95,label:'Optimal'}],
    interpret:(s)=>s===0?'No cadence data available. Use a cadence-capable watch or footpod to unlock this skill.':s<20?'Your cadence is on the lower end, suggesting longer, slower strides. Room to improve efficiency.':s<40?'Below optimal cadence range. You\'re likely overstriding slightly, which costs energy.':s<55?'Approaching good cadence territory. Your stride rate is getting closer to the efficient zone.':s<70?'Solid cadence near the optimal range. Your stride mechanics are reasonably efficient.':s<85?'Very good cadence and consistency. You\'re running with near-optimal stride efficiency.':'Textbook cadence. Biomechanically efficient with exceptional consistency.',
    metrics:{
      avg_cadence:{label:'Average Cadence (spm)',ex:'Mean cadence across runs with data. Sweet spot is 180-185. Score penalizes distance from 182.'},
      cadence_runs:{label:'Runs With Cadence Data',ex:'Runs with cadence recorded. Ensure your device records consistently.'},
    }},
  fortitude:{n:'Fortitude',i:'📅',c:'#7090a8',s:'Consistency & discipline',
    method:'Over the last 90 days: runs per week (30%), active weeks percentage (35%), weekly distance stability (35%).',
    tips:'Frequency matters most. Adding even a short 20-minute easy run on an off day boosts your numbers significantly.',
    landmarks:[{at:15,label:'1-2x/wk'},{at:30,label:'2-3x/wk'},{at:45,label:'3-4x/wk'},{at:60,label:'4-5x/wk'},{at:75,label:'5-6x/wk'},{at:90,label:'Daily'}],
    interpret:(s)=>s<10?'Very inconsistent recently. Lots of missed weeks in the last 90 days.':s<25?'Running 1-2 times per week with some gaps. Building a regular habit would move this fast.':s<40?'Running 2-3 times per week with reasonable regularity. A solid foundation forming.':s<55?'Consistent 3-4 times per week with good weekly volume stability. Genuine discipline.':s<70?'Running 4-5 times per week with stable volume. You rarely miss and your weeks look consistent.':s<85?'Near-daily runner with very stable weekly patterns. Training is deeply embedded in your life.':'Daily running with machine-like consistency. Exceptional discipline.',
    metrics:{
      runs_per_week:{label:'Runs Per Week',ex:'Average runs/week over 90 days. Compared against 7/week.'},
      active_weeks_pct:{label:'Active Weeks (%)',ex:'Weeks with at least one run. Missing a full week drops this fast.'},
      volume_cv:{label:'Weekly Consistency',ex:'How much weekly km fluctuates. Lower=more consistent. Under 0.2 very consistent; over 0.5 erratic.'},
    }},
  resilience:{n:'Resilience',i:'🔁',c:'#c09050',s:'Recovery & fatigue resistance',
    method:'Pace degradation on consecutive-day runs (50%) and overall pace variance (50%).',
    tips:'Build back-to-back tolerance gradually. Sleep, nutrition, and hydration matter as much as training.',
    landmarks:[{at:20,label:'Some drop-off'},{at:40,label:'Moderate'},{at:55,label:'Good bounce'},{at:70,label:'Strong'},{at:85,label:'Rubber band'},{at:95,label:'Iron'}],
    interpret:(s)=>s<10?'Limited back-to-back data. You may not run on consecutive days often enough to measure.':s<25?'Noticeable pace drop on back-to-back days. Your body needs more recovery time between efforts.':s<40?'Some pace degradation when stacking days, but within normal range for most runners.':s<55?'Good recovery capacity. You handle consecutive-day running with moderate pace stability.':s<70?'Strong resilience. Minimal pace degradation even on back-to-back hard efforts.':s<85?'Excellent fatigue resistance. You bounce back from hard sessions remarkably fast.':'Elite recovery. Your body absorbs training load like a sponge.',
    metrics:{
      b2b_drop:{label:'Back-to-Back Pace Change',ex:'Pace degradation on consecutive days. 0.05 = 5% slower. Negative = faster (strong recovery).'},
      pace_cv:{label:'Pace Variance',ex:'How much pace varies across runs. Under 0.05 very consistent.'},
      b2b_pairs:{label:'Back-to-Back Pairs',ex:'Times you ran consecutive days. Low count = unreliable score.'},
    }},
  ranging:{n:'Ranging',i:'🧭',c:'#58a0a8',s:'Route diversity & exploration',
    method:'Unique start locations (30%), route novelty vs total runs (30%), distance variety (20%), terrain diversity (20%).',
    tips:'Run from a different start once a week. Vary distances. Seek one new route per week.',
    landmarks:[{at:15,label:'Same loop'},{at:30,label:'A few routes'},{at:50,label:'Regular variety'},{at:65,label:'Explorer'},{at:80,label:'Adventurer'},{at:92,label:'Nomad'}],
    interpret:(s)=>s<10?'Very low route variety. You\'re running the same route(s) almost exclusively.':s<25?'A handful of familiar routes. You have your go-to loops but don\'t branch out much.':s<40?'Moderate variety. You mix up routes and distances occasionally but have clear favorites.':s<55?'Good exploration. You run from multiple locations, vary distances, and seek new terrain.':s<70?'Strong route diversity. Your GPS map shows a wide web of explored territory.':s<85?'Exceptional exploration across locations, distances, and terrain types.':'Near-maximum diversity. You run everywhere, every distance, every terrain.',
    metrics:{
      locations:{label:'Unique Starting Locations',ex:'Distinct start areas (~1km grid). Different parks/neighborhoods increase this. Compared against 15.'},
      unique_routes:{label:'Unique Routes',ex:'Distinct routes by GPS path. Compared as ratio vs total runs.'},
      dist_buckets:{label:'Distance Variety',ex:'Distinct distance brackets (3km increments). Mix 3/5/10/15km = 4 buckets. Compared against 6.'},
      terrain_types:{label:'Terrain Types',ex:'Categories: flat, rolling, hilly, mountain. Compared against 3.'},
    }},
};
const SK = Object.keys(SKILL_META);

// ===== ARCHETYPES =====
const AE={speed_demon:'⚡',long_hauler:'🛤',hill_grinder:'⛰',cardiac_king:'♥',metronome:'⏱',the_grinder:'🔨',rubber_band:'🔄',pathfinder:'🧭',tempo_hound:'🎯',weekend_warrior:'⚔',volume_junkie:'📈',trail_rat:'🌲',the_commuter:'🚏',track_rat:'🏁',mountain_goat:'🐐',iron_lung:'💨',clockwork:'⚙',comeback_kid:'💪',disciplined_racer:'🏅',terrain_mixer:'🎲',base_builder:'🧱',all_rounder:'⊕',the_specialist:'💎',raw_talent:'✨',workhorse:'🐴'};
const ARCHETYPES=[
{id:'speed_demon',n:'Speed Demon',pr:'Velocity',d:'Pure speed above all else.',cat:'Single'},
{id:'long_hauler',n:'Long Hauler',pr:'Endurance',d:'Eats miles for breakfast.',cat:'Single'},
{id:'hill_grinder',n:'Hill Grinder',pr:'Ascent',d:'The steeper the better.',cat:'Single'},
{id:'cardiac_king',n:'Cardiac King',pr:'Stamina',d:'Supreme aerobic engine.',cat:'Single'},
{id:'metronome',n:'Metronome',pr:'Cadence',d:'Every step calibrated.',cat:'Single'},
{id:'the_grinder',n:'The Grinder',pr:'Fortitude',d:'Never misses a day.',cat:'Single'},
{id:'rubber_band',n:'Rubber Band',pr:'Resilience',d:'Rebounds fast.',cat:'Single'},
{id:'pathfinder',n:'Pathfinder',pr:'Ranging',d:'Always a new route.',cat:'Single'},
{id:'tempo_hound',n:'Tempo Hound',pr:'Velocity+Stamina',d:'Fast AND efficient.',cat:'Dual'},
{id:'weekend_warrior',n:'Weekend Warrior',pr:'Velocity+Endurance',d:'Shows up and goes hard.',cat:'Dual'},
{id:'volume_junkie',n:'Volume Junkie',pr:'Endurance+Fortitude',d:'High mileage, high consistency.',cat:'Dual'},
{id:'trail_rat',n:'Trail Rat',pr:'Ranging+Ascent',d:'Off-road explorer.',cat:'Dual'},
{id:'the_commuter',n:'The Commuter',pr:'Fortitude+Ranging',d:'Runs everywhere, every day.',cat:'Dual'},
{id:'track_rat',n:'Track Rat',pr:'Velocity+Cadence',d:'Fast with sharp form.',cat:'Dual'},
{id:'mountain_goat',n:'Mountain Goat',pr:'Ascent+Endurance',d:'Long mountain runs.',cat:'Dual'},
{id:'iron_lung',n:'Iron Lung',pr:'Stamina+Endurance',d:'Low HR, big distance.',cat:'Dual'},
{id:'clockwork',n:'Clockwork',pr:'Cadence+Fortitude',d:'Precise AND consistent.',cat:'Dual'},
{id:'comeback_kid',n:'Comeback Kid',pr:'Resilience+Fortitude',d:'Trains through anything.',cat:'Dual'},
{id:'disciplined_racer',n:'Disciplined Racer',pr:'Velocity+Fortitude',d:'Fast AND disciplined.',cat:'Dual'},
{id:'terrain_mixer',n:'Terrain Mixer',pr:'Ranging+Resilience',d:'Variety stays fresh.',cat:'Dual'},
{id:'base_builder',n:'Base Builder',pr:'Stamina+Fortitude',d:'Patient aerobic development.',cat:'Dual'},
{id:'all_rounder',n:'All-Rounder',pr:'Balanced',d:'No weakness anywhere.',cat:'Shape'},
{id:'the_specialist',n:'The Specialist',pr:'One extreme skill',d:'One skill towers above.',cat:'Shape'},
{id:'raw_talent',n:'Raw Talent',pr:'High peak, low floor',d:'Fast but inconsistent.',cat:'Shape'},
{id:'workhorse',n:'Workhorse',pr:'High grit, modest speed',d:'Always there.',cat:'Shape'},
];
const TIERS=[{n:'Beginner',r:'0–10',d:'Just starting.',how:'Average of all 8 skills between 0–10. Skills at 0 (no sensor) still count.'},{n:'Developing',r:'10–22',d:'Building habits.',how:'Average 10–22. A few skills developing.'},{n:'Solid',r:'22–36',d:'Consistent history.',how:'Average 22–36. Running regularly for months.'},{n:'Strong',r:'36–50',d:'Serious training.',how:'Average 36–50. Multiple skills in 40-60 range.'},{n:'Competitive',r:'50–65',d:'Club level.',how:'Average 50–65. Stronger than most runners.'},{n:'Elite',r:'65–82',d:'Exceptional.',how:'Average 65–82. Years of structured training.'},{n:'World-Class',r:'82+',d:'Near human limits.',how:'Average 82+. Every skill near ceiling.'}];
const MODS=[{n:'Consistent',d:'Steady week after week.',how:'Fortitude > 55 AND weekly volume CV < 0.4.'},{n:'Streaky',d:'Peaks then gaps.',how:'Weekly volume CV > 0.6.'},{n:'Improving',d:'Trending up.',how:'Recent scores show upward movement.'},{n:"Plateau'd",d:'Stable. Needs a shift.',how:'Scores in narrow band for extended period.'},{n:'Comeback',d:'Reversing regression.',how:'Scores rising after decline.'},{n:'Fresh',d:'Under 20 scored runs.',how:'< 20 runs scored. Limited data.'},{n:'Veteran',d:'Hundreds of runs.',how:'200+ runs AND fortitude > 55.'}];

// ===== PROFILES =====
const CP={
speed_demon:{identity:"You live for the feeling of legs turning over fast. Speed is your language — you don't just run, you attack distance.",howYouRun:"You gravitate toward shorter, sharper efforts. You feel most alive when the pace drops below comfortable.",strengths:"Raw velocity. Your Speed Index scores are your calling card.",watchFor:"Speed without endurance base can plateau. Don't neglect slow miles."},
long_hauler:{identity:"Distance is your habitat. While others calculate pace, you calculate how far you can go.",howYouRun:"You favor longer efforts. You hold pace remarkably well — your 10th km looks like your 2nd.",strengths:"Endurance capacity and pace sustainability over distance.",watchFor:"Long slow miles alone won't develop top-end speed. Add speed work once a week."},
hill_grinder:{identity:"Flat courses bore you. You come alive when the road tilts up and the field thins.",howYouRun:"You seek elevation. Your climbing rate stands out because you hunt hills.",strengths:"Climbing power, elevation gain rate, comfort on sustained grades.",watchFor:"Hill strength without flat speed limits race performance. Mix in flat tempo."},
cardiac_king:{identity:"The efficiency machine. Your heart rate data shows a finely tuned aerobic engine.",howYouRun:"Your easy runs are truly easy. Every heartbeat propels you further than most.",strengths:"Cardiac efficiency, aerobic economy, speed at controlled HR.",watchFor:"High efficiency without speed work leaves race-day performance untapped."},
metronome:{identity:"Precision is your trademark. Your cadence is consistent and your form holds under fatigue.",howYouRun:"Remarkably consistent cadence. You've dialed in the 175-185 spm sweet spot.",strengths:"Mechanical efficiency, stride consistency, injury resistance.",watchFor:"Form without fitness can cap potential. Push aerobic and speed boundaries."},
the_grinder:{identity:"You are discipline. While others have on-again-off-again running, you show up. Every week.",howYouRun:"Weekly volume is stable, frequency is high. The habit is deeply embedded.",strengths:"Training consistency and compounding fitness from unbroken months of work.",watchFor:"Consistency without variation can stale. Add hard and easy phases."},
rubber_band:{identity:"Recovery is your secret weapon. You bounce back from hard efforts like nothing happened.",howYouRun:"Strong back-to-back performance. Minimal pace degradation stacking hard days.",strengths:"Fatigue resistance and training load absorption.",watchFor:"Good recovery can mask overtraining. Strategic rest days make you faster."},
pathfinder:{identity:"Every run is exploration. You're allergic to the same route twice.",howYouRun:"Exceptional route diversity. Different starts, distances, terrain types.",strengths:"Route diversity building well-rounded adaptability.",watchFor:"Exploration without structure scatters focus. Explore with purpose."},
tempo_hound:{identity:"Speed meets efficiency. Fast AND your heart rate proves you're not redlining.",howYouRun:"Strong Speed Index with excellent efficiency factors.",strengths:"The velocity-stamina combination — most race-relevant pairing.",watchFor:"Push into longer tempo efforts to extend sustainable speed."},
weekend_warrior:{identity:"When you show up, you go hard. Effort-per-session ratio is off the charts.",howYouRun:"Concentrated quality. Speed and endurance both score well per session.",strengths:"High-quality sessions developing speed and endurance simultaneously.",watchFor:"One more easy run per week could dramatically boost consistency."},
volume_junkie:{identity:"Miles are your currency and you're wealthy. High volume with discipline to maintain it.",howYouRun:"High mileage, high consistency. Running as daily practice.",strengths:"Endurance-fortitude builds deep aerobic fitness — the base speed layers onto.",watchFor:"Volume without intensity leaves speed underdeveloped."},
trail_rat:{identity:"Pavement is the road to the trailhead. You seek dirt, elevation, demanding terrain.",howYouRun:"You collect vertical gain and new routes like souvenirs.",strengths:"Ranging-ascent builds total-body fitness, stability, mental toughness.",watchFor:"Trail running can underdevelop raw speed. Mix in flat tempo."},
the_commuter:{identity:"Running isn't just exercise — it's how you move through the world.",howYouRun:"You run often and everywhere. Transportation as much as sport.",strengths:"Consistency-exploration builds robust fitness and unshakeable habit.",watchFor:"Utilitarian running lacks intensity. Designate 1-2 deliberate workouts."},
track_rat:{identity:"Speed AND form — both dials up. Cadence dialed in, pace to back it up.",howYouRun:"High velocity paired with optimized cadence. Form amplifies fitness.",strengths:"Velocity-cadence is biomechanically optimal. Less waste, fewer injuries.",watchFor:"Build your long run to extend how far your speed carries."},
mountain_goat:{identity:"Long days in the mountains. Climbing power meets distance capacity.",howYouRun:"Big elevation, big distance. You climb far.",strengths:"Ascent-endurance is the ultrarunner's calling card.",watchFor:"Mountain fitness doesn't always translate to flat speed."},
iron_lung:{identity:"Massive aerobic engine AND you can run it all day.",howYouRun:"Long runs at low heart rates. Remarkable efficiency deep into efforts.",strengths:"Stamina-endurance is marathon and ultra foundation.",watchFor:"Tempo and interval work sharpens the blade endurance forged."},
clockwork:{identity:"Precise, consistent, reliable. Same form, same dedication, week after week.",howYouRun:"Consistent cadence paired with consistent training. Double consistency compounds.",strengths:"Cadence-fortitude builds injury-resistant fitness.",watchFor:"Add one challenging session per week for pace ceiling."},
comeback_kid:{identity:"You train through anything. Fatigue, weather, tough weeks — you never left.",howYouRun:"Consistent training with minimal degradation between sessions.",strengths:"Resilience-fortitude is the most durable build.",watchFor:"Durability is the perfect base for adding structured intensity."},
disciplined_racer:{identity:"Fast AND reliable. Speed backed by disciplined preparation.",howYouRun:"High velocity paired with high fortitude. Speed earned through consistency.",strengths:"Velocity-fortitude is the competitive runner's ideal.",watchFor:"Push into race-specific work for racing speed."},
terrain_mixer:{identity:"Variety keeps you fresh. Different routes, quick recovery from anything.",howYouRun:"High route diversity paired with strong fatigue resistance.",strengths:"Ranging-resilience builds adaptable fitness.",watchFor:"Anchor exploration around a periodized framework."},
base_builder:{identity:"Playing the long game. Patient aerobic development, unwavering consistency.",howYouRun:"Strong cardiac efficiency paired with disciplined consistency.",strengths:"Stamina-fortitude builds the deepest possible base.",watchFor:"Set a target race. Your base is ready to periodize."},
all_rounder:{identity:"No weakness. Competent everywhere, limited nowhere. The Swiss Army knife.",howYouRun:"Remarkably even radar. You don't have a 'thing' and that IS your thing.",strengths:"Balanced across all 8 skills. Compete in any format.",watchFor:"Balance can plateau. Pick ONE skill for 6-8 weeks."},
the_specialist:{identity:"One skill towers above — magnificent. That peak is your identity.",howYouRun:"Highest skill dramatically higher than the rest.",strengths:"Extreme peak in your primary skill.",watchFor:"Gap between peak and floor creates fragility. Shore up weakest."},
raw_talent:{identity:"High highs, low lows. When on, you're ON — but consistency isn't there yet.",howYouRun:"Impressive peaks, wide variance. Talent not yet channeled.",strengths:"Natural ability. Ceiling higher than average suggests.",watchFor:"Consistent training would close the gap between peaks and average."},
workhorse:{identity:"You outwork everyone. Might not be fastest, but you'll be last standing. Grit is remarkable.",howYouRun:"High fortitude, modest velocity. Thick log, unquestionable commitment.",strengths:"Grit and compounding fitness from showing up every day.",watchFor:"Speed is your primary lever. One tempo session per week unlocks a tier jump."},
};

// ===== SVG NAV ICONS =====
const NavIcons = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8c050' : '#5e5448'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V13h6v8"/>
    </svg>
  ),
  skills: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8c050' : '#5e5448'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/>
    </svg>
  ),
  history: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8c050' : '#5e5448'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12,7 12,12 16,14"/>
    </svg>
  ),
  runs: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8c050' : '#5e5448'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"/>
      <path d="M7 21l3-4 2.5 1L16 13l-3-3-4 1-3 4"/>
      <path d="M16 13l4 4"/>
    </svg>
  ),
  codex: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8c050' : '#5e5448'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/>
      <line x1="8" y1="7" x2="16" y2="7"/>
      <line x1="8" y1="11" x2="13" y2="11"/>
    </svg>
  ),
};

// ===== CONSTELLATION VISUALIZATION =====
function Constellation({ skills, size = 280, onTapSkill }) {
  const cx = size / 2, cy = size / 2, baseR = size * 0.34;
  const angleStep = (2 * Math.PI) / 8;
  const positions = SK.map((k, i) => {
    const score = skills?.[k]?.score || skills?.[k] || 0;
    const angle = angleStep * i - Math.PI / 2;
    const dist = baseR * (0.3 + 0.7 * (score / 100));
    return {
      key: k,
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
      score,
      r: 3 + (score / 100) * 5,
      opacity: 0.3 + (score / 100) * 0.7,
      color: SKILL_META[k].c,
      labelX: cx + (baseR + 22) * Math.cos(angle),
      labelY: cy + (baseR + 22) * Math.sin(angle),
    };
  });

  const lines = [];
  for (let i = 0; i < positions.length; i++) {
    const next = (i + 1) % positions.length;
    lines.push({ x1: positions[i].x, y1: positions[i].y, x2: positions[next].x, y2: positions[next].y, delay: i * 80 });
    // cross-connections for selected diagonals
    if (i < 4) {
      lines.push({ x1: positions[i].x, y1: positions[i].y, x2: positions[i + 4].x, y2: positions[i + 4].y, delay: 600 + i * 100 });
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Connection lines */}
      {lines.map((l, i) => (
        <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          className="constellation-line"
          stroke="rgba(232,192,80,.12)" strokeWidth="0.8"
          style={{ animationDelay: `${l.delay}ms` }} />
      ))}
      {/* Stars */}
      {positions.map((p, i) => (
        <g key={p.key} onClick={() => onTapSkill?.(p.key)} style={{ cursor: onTapSkill ? 'pointer' : 'default' }}>
          {/* Glow halo */}
          <circle cx={p.x} cy={p.y} r={p.r * 2.5}
            fill={p.color} opacity={p.opacity * 0.08}
            className="constellation-star-glow"
            style={{ animationDelay: `${1000 + i * 120}ms` }} />
          {/* Star */}
          <circle cx={p.x} cy={p.y} r={p.r}
            fill={p.color} opacity={p.opacity}
            className="constellation-star"
            style={{ animationDelay: `${800 + i * 100}ms` }} />
          {/* Label */}
          <text x={p.labelX} y={p.labelY + 1}
            textAnchor="middle" dominantBaseline="middle"
            className="constellation-star"
            style={{
              font: "500 8px 'Cinzel', serif",
              fill: p.score > 0 ? 'rgba(160,144,128,.5)' : 'rgba(100,90,80,.25)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              animationDelay: `${900 + i * 100}ms`,
            }}>
            {SKILL_META[p.key].n.slice(0, 3)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ===== LANDMARK BAR =====
function LandmarkBar({ score, landmarks, color }) {
  return (
    <div style={{ margin: '18px 0 22px' }}>
      <div style={{ position: 'relative', height: 28, background: 'rgba(40,36,32,.5)', borderRadius: 4, overflow: 'visible' }}>
        <div className="bar-animate" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(score, 100) + '%', background: `linear-gradient(90deg, ${color}22, ${color}66)`, borderRadius: '4px 0 0 4px' }} />
        {landmarks.map((lm, i) => (
          <div key={i} style={{ position: 'absolute', left: lm.at + '%', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
            <div style={{ width: 1, height: '100%', background: 'rgba(160,144,128,.1)' }} />
            <span style={{ fontSize: 7, fontFamily: "'Cinzel',serif", color: score >= lm.at ? '#a09080' : '#3a3430', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, whiteSpace: 'nowrap' }}>{lm.label}</span>
          </div>
        ))}
        <div style={{ position: 'absolute', left: `calc(${Math.min(score, 100)}% - 5px)`, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid #0c0a08', boxShadow: `0 0 10px ${color}50`, zIndex: 2 }} />
      </div>
    </div>
  );
}

// ===== WEEKLY SPARKLINE =====
function WeeklySparkline({ activities }) {
  const weeks = useMemo(() => {
    if (!activities?.length) return [];
    const now = new Date();
    const buckets = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { start: weekStart, end: weekEnd, km: 0, runs: 0 };
    }).reverse();
    activities.forEach(a => {
      const d = new Date(a.start_date_local || a.start_date);
      for (const b of buckets) {
        if (d >= b.start && d < b.end) { b.km += (a.distance_m || 0) / 1000; b.runs++; break; }
      }
    });
    return buckets;
  }, [activities]);

  if (weeks.length === 0) return null;
  const maxKm = Math.max(...weeks.map(w => w.km), 1);
  const barH = 48;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: barH + 16, padding: '0 2px' }}>
      {weeks.map((w, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: barH, display: 'flex', alignItems: 'flex-end' }}>
            <div className="spark-bar" style={{
              width: '100%',
              height: `${Math.max((w.km / maxKm) * 100, 4)}%`,
              background: i === weeks.length - 1 ? 'rgba(232,192,80,.5)' : 'rgba(160,144,128,.15)',
              borderRadius: '3px 3px 0 0',
              animationDelay: `${i * 60}ms`,
            }} />
          </div>
          <span style={{ fontSize: 7, fontFamily: "'DM Sans',sans-serif", color: '#5e5448' }}>
            {i === weeks.length - 1 ? 'Now' : `${8 - i}w`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ===== CARD COMPONENTS (3-tier hierarchy) =====
function HeroCard({ children, style, onClick, delay }) {
  return (
    <div className={onClick ? 'touch-target' : ''} onClick={onClick} style={{
      background: 'linear-gradient(135deg, rgba(30,26,20,.95), rgba(18,15,12,.98))',
      borderRadius: 8,
      padding: 24,
      marginBottom: 12,
      animation: delay !== undefined ? `cardEnter 0.3s ease-out ${delay}ms both` : undefined,
      ...style,
    }}>{children}</div>
  );
}

function Card({ children, style, onClick, delay, glow, accent }) {
  return (
    <div className={onClick ? 'touch-target' : ''} onClick={onClick} style={{
      background: 'rgba(22,20,17,.85)',
      border: `1px solid ${glow ? 'rgba(232,192,80,.12)' : accent ? 'rgba(232,192,80,.1)' : 'rgba(170,140,80,.06)'}`,
      borderRadius: 6,
      padding: 18,
      marginBottom: 12,
      ...(glow ? { boxShadow: '0 0 24px rgba(200,160,80,.03)' } : {}),
      ...(accent ? { borderLeft: '2px solid rgba(232,192,80,.15)' } : {}),
      animation: delay !== undefined ? `cardEnter 0.3s ease-out ${delay}ms both` : undefined,
      ...style,
    }}>{children}</div>
  );
}

function Compact({ children, style, delay }) {
  return (
    <div style={{
      padding: '8px 0',
      animation: delay !== undefined ? `cardEnter 0.3s ease-out ${delay}ms both` : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ===== TYPOGRAPHY STYLES =====
const T = {
  sectionLabel: { fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 600, color: '#5e5448', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 6 },
  heading: { fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.2 },
  headingSm: { fontSize: 17, fontWeight: 500, fontFamily: "'Cormorant Garamond',serif" },
  body: { fontSize: 13.5, lineHeight: 1.7, color: '#a09080', fontFamily: "'DM Sans',sans-serif" },
  mono: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#e8c050' },
  monoLg: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 24, fontWeight: 300, color: '#e8c050' },
  muted: { fontSize: 11, lineHeight: 1.4, color: '#5e5448', fontFamily: "'DM Sans',sans-serif" },
  label: { fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 600, color: '#5e5448', textTransform: 'uppercase', letterSpacing: 1.5 },
  skillLabel: { fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, color: '#a09080', textTransform: 'uppercase', letterSpacing: 2 },
  tag: { fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 600, color: '#e8c050', background: 'rgba(232,192,80,.08)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 2 },
  tagMuted: { fontFamily: "'Cinzel',serif", fontSize: 7, fontWeight: 500, color: '#5e5448', background: 'rgba(100,90,80,.08)', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: 1.5 },
  note: { fontSize: 11, lineHeight: 1.6, color: '#5e5448', marginTop: 3, paddingLeft: 12, borderLeft: '2px solid rgba(232,192,80,.06)', fontFamily: "'DM Sans',sans-serif" },
};

// ===== MAIN =====
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null);
  const [cxTab, setCxTab] = useState('a');
  const [cxSel, setCxSel] = useState(null);
  const [histSel, setHistSel] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [runs, setRuns] = useState(null);
  const [runsPage, setRunsPage] = useState(1);
  const [showMethod, setShowMethod] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    fetch('/api/user').then(r => { if (r.status === 401) { window.location.href = '/'; return null } return r.json() }).then(d => { if (d) setData(d) }).catch(() => {});
  }, []);

  const doSync = useCallback(async () => {
    setSyncing(true); setSyncMsg('Importing...');
    try {
      const r = await fetch('/api/sync', { method: 'POST' });
      const d = await r.json();
      if (d.status === 'completed') {
        setSyncMsg('Done! ' + d.activityCount + ' runs scored.');
        setTimeout(() => { setSyncing(false); setShowSettings(false); fetch('/api/user').then(r => r.json()).then(setData); setRuns(null) }, 1500);
      } else { setSyncMsg('Error: ' + (d.error || 'Unknown')); setTimeout(() => setSyncing(false), 3000); }
    } catch (e) { setSyncMsg('Error: ' + e.message); setTimeout(() => setSyncing(false), 3000); }
  }, []);

  const loadRuns = useCallback((pg) => { fetch(`/api/user?section=activities&page=${pg}`).then(r => r.json()).then(d => { setRuns(d); setRunsPage(pg) }).catch(() => {}); }, []);
  useEffect(() => { if (tab === 'runs' && !runs) loadRuns(1) }, [tab]);

  const switchTab = (t) => { if (t === 'history') setHistSel(null); setShowMethod(false); setTab(t); setAnimKey(k => k + 1); setExpandedWeeks({}); };
  const doAction = async (a) => { await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: a }) }); window.location.href = '/'; };

  // Loading
  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0c0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: 6, color: 'rgba(232,192,80,.3)', textTransform: 'uppercase' }}>Solestride</div>
        <div style={{ marginTop: 16 }}><span className="spinner" /></div>
      </div>
    </div>
  );

  const sk = data.currentSkills || {};
  const bld = data.currentBuild;
  const hasBuild = bld && Object.keys(sk).length > 0;
  const trends = data.trends;
  const history = (data.buildHistory || []).slice().reverse();
  const prs = data.prs;
  const ws = data.weeklyStats;
  const priorities = data.priorities || [];

  // Helpers
  const fmtPace = (s) => { if (!s || s <= 0) return '--:--'; const m = Math.floor(s / 60); const sc = Math.floor(s % 60); return `${m}:${sc.toString().padStart(2, '0')}`; };
  const fmtDist = (m) => (m / 1000).toFixed(1) + ' km';
  const fmtDur = (s) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmt5k = (s) => { if (!s) return '--:--'; const m = Math.floor(s / 60); const sc = Math.floor(s % 60); return `${m}:${sc.toString().padStart(2, '0')}`; };

  const SectionGap = () => <div style={{ height: 24 }} />;

  const SBar = ({ k, score, onClick, showVsAvg, delay }) => {
    const avg = bld?.avg || 0;
    const diff = score - avg;
    const t = trends?.[k];
    return (
      <div className={onClick ? 'touch-target' : ''} style={{ marginBottom: 16, animation: delay ? `cardEnter 0.3s ease-out ${delay}ms both` : undefined }} onClick={onClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
          <span style={T.skillLabel}>{SKILL_META[k].n}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {showVsAvg && Math.abs(diff) > 3 && <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: diff > 0 ? '#50a060' : '#c04040' }}>{diff > 0 ? '▲ above' : '▼ below'} avg</span>}
            {!showVsAvg && t && Math.abs(t.delta) > 0.5 && <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: t.delta > 0 ? '#50a060' : '#c04040' }}>{t.delta > 0 ? '▲' : '▼'} {Math.abs(t.delta).toFixed(1)}</span>}
            <span style={T.mono}>{Math.round(score * 10) / 10}</span>
          </div>
        </div>
        <div style={{ height: 4, background: 'rgba(40,36,32,.6)', borderRadius: 2, overflow: 'hidden' }}>
          <div className="bar-animate" style={{ height: '100%', width: score + '%', background: `linear-gradient(90deg, ${SKILL_META[k].c}33, ${SKILL_META[k].c})`, borderRadius: 2 }} />
        </div>
      </div>
    );
  };

  const Prof = ({ profile, tip }) => {
    const p = profile || {};
    const portrait = [p.identity, p.howYouRun, p.strengths].filter(Boolean).join(' ');
    const growth = [p.watchFor, tip].filter(Boolean).join(' ');
    return (
      <>
        {portrait && <HeroCard><p style={T.body}>{portrait}</p></HeroCard>}
        {growth && <Card accent><div style={{ ...T.label, color: '#e8c050', marginBottom: 8 }}>What's Next</div><p style={T.body}>{growth}</p></Card>}
      </>
    );
  };

  // ===== HOME =====
  const Home = () => !hasBuild ? (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: '#e8c050', letterSpacing: 6, textTransform: 'uppercase' }}>Solestride</h1>
      <p style={{ color: '#5e5448', margin: '10px 0 28px', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Welcome, {data.user?.strava_firstname}.</p>
      <HeroCard style={{ textAlign: 'center', padding: '28px 20px' }}>
        <p style={{ ...T.body, marginBottom: 20 }}>Import your full Strava run history to generate your build.</p>
        {syncing ? <p style={T.muted}><span className="spinner" />Importing...</p> : (
          <button className="touch-target" style={{ padding: '14px 28px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fc4c02,#e84400)', color: '#fff', fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, width: '100%' }} onClick={doSync}>
            Sync with Strava
          </button>
        )}
      </HeroCard>
    </div>
  ) : (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={T.sectionLabel}>Active Build</div>
        <button className="touch-target" onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5e5448" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      {/* Build name */}
      <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
        <h1 style={T.heading}>{bld.fullName}</h1>
        <span style={T.tag}>{bld.modifier}</span>
      </div>
      <p style={{ fontSize: 13, color: '#5e5448', fontStyle: 'italic', marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>{bld.tierName} tier · {bld.archetypeName} archetype</p>

      {/* Constellation */}
      <HeroCard style={{ padding: '20px 8px', marginBottom: 12 }}>
        <Constellation skills={sk} size={280} onTapSkill={(k) => { setDetail(k); switchTab('detail'); }} />
      </HeroCard>

      {/* Portrait + What's Next */}
      <Prof profile={bld.profile || CP[bld.archetype]} tip={bld.levelUpTip} />

      <SectionGap />

      {/* Horizontal snap-scroll carousel */}
      <div className="snap-carousel" style={{ marginBottom: 8 }}>
        {/* Panel 1: This Week */}
        {ws && (
          <Card className="snap-panel" style={{ flex: '0 0 calc(100% - 32px)', marginBottom: 0 }}>
            <div style={{ ...T.label, marginBottom: 12 }}>This Week</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ ...T.monoLg, fontSize: 22 }}>{ws.thisWeek.runs}</div>
                <div style={T.muted}>runs</div>
                {ws.lastWeek.runs > 0 && <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: ws.thisWeek.runs >= ws.lastWeek.runs ? '#50a060' : '#c04040', marginTop: 3 }}>{ws.thisWeek.runs >= ws.lastWeek.runs ? '▲' : '▼'} vs {ws.lastWeek.runs}</div>}
              </div>
              <div>
                <div style={{ ...T.monoLg, fontSize: 22 }}>{ws.thisWeek.km}</div>
                <div style={T.muted}>km</div>
                {ws.lastWeek.km > 0 && <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: ws.thisWeek.km >= ws.lastWeek.km ? '#50a060' : '#c04040', marginTop: 3 }}>{ws.thisWeek.km >= ws.lastWeek.km ? '▲' : '▼'} vs {ws.lastWeek.km}</div>}
              </div>
              <div>
                <div style={{ ...T.monoLg, fontSize: 22 }}>{ws.thisWeek.avgPace ? fmtPace(ws.thisWeek.avgPace) : '—'}</div>
                <div style={T.muted}>avg pace</div>
              </div>
            </div>
          </Card>
        )}

        {/* Panel 2: Personal Records */}
        {prs && (
          <Card className="snap-panel" style={{ flex: '0 0 calc(100% - 32px)', marginBottom: 0 }}>
            <div style={{ ...T.label, marginBottom: 12 }}>Personal Records</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {prs.fastest5k && <div><div style={{ ...T.mono, fontSize: 16 }}>{fmt5k(prs.fastest5k.time_s)}</div><div style={T.muted}>Fastest 5K equiv</div></div>}
              {prs.longestRun && <div><div style={{ ...T.mono, fontSize: 16 }}>{prs.longestRun.km} km</div><div style={T.muted}>Longest run</div></div>}
              {prs.biggestClimb && <div><div style={{ ...T.mono, fontSize: 16 }}>{prs.biggestClimb.elev_m}m</div><div style={T.muted}>Biggest climb</div></div>}
              <div><div style={{ ...T.mono, fontSize: 16 }}>{prs?.longestStreak || 0} days</div><div style={T.muted}>Longest streak</div></div>
            </div>
          </Card>
        )}

        {/* Panel 3: Priority Focus */}
        {priorities.length > 0 && (
          <Card className="snap-panel" style={{ flex: '0 0 calc(100% - 32px)', marginBottom: 0 }}>
            <div style={{ ...T.label, marginBottom: 12 }}>Priority Focus</div>
            <div style={{ ...T.muted, marginBottom: 10 }}>Skills that would move your tier fastest</div>
            {priorities.map((p, i) => (
              <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < priorities.length - 1 ? '1px solid rgba(100,90,80,.06)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "'Cinzel',serif", color: '#e8c050', fontWeight: 700, width: 14 }}>{i + 1}</span>
                  <span style={T.body}>{SKILL_META[p.key]?.n}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={T.mono}>{p.score}</span>
                  <span style={T.muted}>{p.gapFromAvg} below</span>
                  {p.hasSensorIssue && <span style={{ ...T.muted, color: '#c04040' }}>· sensor</span>}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <SectionGap />

      {/* Skill bars */}
      <div style={{ ...T.sectionLabel, marginBottom: 16 }}>Skills</div>
      {SK.map((k, i) => <SBar key={k} k={k} score={sk[k]?.score || 0} showVsAvg delay={50 + i * 30} onClick={() => { setDetail(k); switchTab('detail'); }} />)}

      {/* Compact stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <Compact><div style={{ textAlign: 'center' }}><div style={T.mono}>{data.activityCount}</div><div style={T.muted}>Runs scored</div></div></Compact>
        <Compact><div style={{ textAlign: 'center' }}><div style={T.mono}>{bld.avg}</div><div style={T.muted}>Avg score</div></div></Compact>
      </div>
    </div>
  );

  // ===== SKILLS TAB =====
  const Skills = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={T.sectionLabel}>Character Sheet</div>
          <h1 style={{ fontSize: 23, fontWeight: 500, marginBottom: 16 }}>Skill Profile</h1>
        </div>
        <button className="touch-target" onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5e5448" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
      <Card style={{ marginBottom: 20 }}>
        <p style={{ ...T.body, color: '#5e5448', fontSize: 12 }}>Scored 0–100 against universal human ceilings. {trends ? 'Arrows show 30-day trend.' : 'Re-sync to see trends.'} Tap any skill for breakdown.</p>
      </Card>

      <Constellation skills={sk} size={260} onTapSkill={(k) => { setDetail(k); switchTab('detail'); }} />

      <SectionGap />
      <div style={{ ...T.sectionLabel, marginBottom: 16 }}>All Skills</div>

      {SK.map((k, i) => {
        const s = sk[k]?.score || 0;
        const t = trends?.[k];
        return (
          <Card key={k} className="touch-target" delay={i * 40} onClick={() => { setDetail(k); switchTab('detail'); }} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <span style={T.skillLabel}>{SKILL_META[k].n}</span>
                <p style={{ fontSize: 11, color: '#5e5448', marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{SKILL_META[k].s}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={T.monoLg}>{Math.round(s)}</span>
                {t && Math.abs(t.delta) > 0.5 && <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: t.delta > 0 ? '#50a060' : '#c04040', marginTop: 2 }}>{t.delta > 0 ? '▲' : '▼'} {Math.abs(t.delta).toFixed(1)} in 30d</div>}
              </div>
            </div>
            <div style={{ height: 4, background: 'rgba(40,36,32,.6)', borderRadius: 2, overflow: 'hidden' }}>
              <div className="bar-animate" style={{ height: '100%', width: s + '%', background: `linear-gradient(90deg, ${SKILL_META[k].c}33, ${SKILL_META[k].c})`, borderRadius: 2 }} />
            </div>
          </Card>
        );
      })}
    </div>
  );

  // ===== DETAIL =====
  const Detail = () => {
    const k = detail, m = SKILL_META[k], s = sk[k]?.score || 0, d = sk[k]?.detail || {}, t = trends?.[k], contrib = sk[k]?.contributing || [];
    const mkeys = Object.keys(d).filter(x => x !== 'reason' && x !== 'requires_hr' && x !== 'requires_sensor');
    const interpretation = typeof m.interpret === 'function' ? m.interpret(s) : '';
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="touch-target" style={{ background: 'none', border: 'none', color: '#5e5448', fontSize: 22, cursor: 'pointer', padding: '4px 8px', fontFamily: "'Cormorant Garamond',serif" }} onClick={() => switchTab('skills')}>←</button>
          <span style={{ fontSize: 22, fontWeight: 500 }}>{m.n}</span>
        </div>

        <HeroCard>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 44, fontWeight: 300, color: '#e8c050' }}>{s.toFixed ? s.toFixed(1) : s}<span style={{ fontSize: 16, color: '#5e5448' }}> / 100</span></div>
            {t && Math.abs(t.delta) > 0.5 && <span style={{ fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: t.delta > 0 ? '#50a060' : '#c04040' }}>{t.delta > 0 ? '▲' : '▼'} {Math.abs(t.delta).toFixed(1)}</span>}
          </div>
          {interpretation && <p style={{ ...T.body, marginTop: 12 }}>{interpretation}</p>}
          {m.landmarks && <LandmarkBar score={s} landmarks={m.landmarks} color={m.c} />}
        </HeroCard>

        {mkeys.length > 0 && (
          <>
            <SectionGap />
            <div style={{ ...T.sectionLabel, marginBottom: 16 }}>Your Numbers</div>
            {mkeys.map((key, i) => {
              const meta = m.metrics?.[key];
              const val = d[key];
              return (
                <Card key={key} delay={i * 40}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: meta?.ex ? 8 : 0 }}>
                    <span style={{ ...T.body, flex: 1 }}>{meta?.label || key.replace(/_/g, ' ')}</span>
                    <span style={{ ...T.mono, fontSize: 14 }}>{typeof val === 'number' ? Math.round(val * 100) / 100 : val}</span>
                  </div>
                  {meta?.ex && <p style={T.note}>{meta.ex}</p>}
                </Card>
              );
            })}
          </>
        )}

        {contrib.length > 0 && (
          <>
            <SectionGap />
            <div style={{ ...T.sectionLabel, marginBottom: 16 }}>Runs That Drove This Score</div>
            {contrib.map((r, i) => (
              <Card key={i} delay={i * 30} style={{ padding: '12px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                    {r.date && <p style={T.muted}>{fmtDate(r.date)}{r.km > 0 ? ` · ${r.km} km` : ''}</p>}
                  </div>
                  <span style={{ ...T.mono, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{r.value}</span>
                </div>
              </Card>
            ))}
          </>
        )}

        <SectionGap />
        <Card accent>
          <div style={{ ...T.label, color: '#e8c050', marginBottom: 8 }}>How to Improve</div>
          <p style={T.body}>{m.tips}</p>
        </Card>

        <button className="touch-target" onClick={() => setShowMethod(!showMethod)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', color: '#5e5448', fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>
          <span style={{ transform: showMethod ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s', display: 'inline-block' }}>▸</span> How this skill is calculated
        </button>
        {showMethod && <Card><p style={T.body}>{m.method}</p></Card>}
      </div>
    );
  };

  // ===== HISTORY =====
  const History = () => {
    if (histSel !== null) {
      const e = history[histSel];
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button className="touch-target" style={{ background: 'none', border: 'none', color: '#5e5448', fontSize: 22, cursor: 'pointer', padding: '4px 8px', fontFamily: "'Cormorant Garamond',serif" }} onClick={() => setHistSel(null)}>←</button>
            <span style={{ fontSize: 22, fontWeight: 500 }}>{e.fullName}</span>
          </div>
          <HeroCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={T.tagMuted}>{e.modifier}</span>
              <span style={T.muted}>{fmtDate(e.date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={T.headingSm}>{e.tierName} · {e.archetypeName}</span>
              <span style={T.mono}>{e.avg} avg</span>
            </div>
            <div style={{ ...T.muted, marginTop: 6 }}>After {e.runCount} runs</div>
          </HeroCard>
          <Prof profile={e.profile || CP[e.archetype]} tip={e.levelUpTip} />
        </div>
      );
    }
    return (
      <div>
        <div style={T.sectionLabel}>Chronicle</div>
        <h1 style={{ fontSize: 23, fontWeight: 500, marginBottom: 16 }}>Build History</h1>
        <Card style={{ marginBottom: 20 }}>
          <p style={{ ...T.body, color: '#5e5448', fontSize: 12 }}>Every archetype, tier, or modifier change is recorded. Tap any entry to explore that build.</p>
        </Card>
        {history.length === 0 && <Card><p style={T.body}>No history yet. Sync with Strava to reconstruct your timeline.</p></Card>}

        {/* Vertical timeline */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div className="timeline-line" />
          {history.map((b, i) => (
            <div key={i} className="touch-target" onClick={() => setHistSel(i)} style={{ display: 'flex', gap: 0, marginBottom: 8, position: 'relative', animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
              <div style={{ position: 'absolute', left: -32, top: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24 }}>
                <div className={`timeline-dot ${i === 0 ? 'timeline-dot-active' : ''}`} />
              </div>
              <Card style={{ flex: 1, cursor: 'pointer', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {i === 0 && <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, fontWeight: 600, color: '#e8c050', background: 'rgba(232,192,80,.08)', padding: '2px 8px', borderRadius: 3, letterSpacing: 2 }}>NOW</span>}
                  <span style={T.muted}>{fmtDate(b.date)}</span>
                  <span style={T.tagMuted}>{b.modifier}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{AE[b.archetype] || '◇'}</span>
                  <div>
                    <h3 style={T.headingSm}>{b.fullName}</h3>
                    <span style={T.muted}>{b.avg} avg · {b.runCount} runs</span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== RUNS =====
  const Runs = () => {
    const rs = runs;
    const summary = rs ? { total: rs.total, km: rs.activities?.reduce((s, a) => s + a.distance_m / 1000, 0) || 0, avgPace: rs.activities?.length > 0 ? rs.activities.reduce((s, a) => s + a.moving_time_s / (a.distance_m / 1000), 0) / rs.activities.length : 0 } : null;

    // Group runs by week
    const weekGroups = useMemo(() => {
      if (!rs?.activities) return [];
      const groups = {};
      rs.activities.forEach(a => {
        const d = new Date(a.start_date_local || a.start_date);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const key = weekStart.toISOString();
        if (!groups[key]) groups[key] = { date: weekStart, runs: [], km: 0 };
        groups[key].runs.push(a);
        groups[key].km += (a.distance_m || 0) / 1000;
      });
      return Object.values(groups).sort((a, b) => b.date - a.date);
    }, [rs]);

    const toggleWeek = (key) => setExpandedWeeks(p => ({ ...p, [key]: !p[key] }));

    return (
      <div>
        <div style={T.sectionLabel}>Activity Log</div>
        <h1 style={{ fontSize: 23, fontWeight: 500, marginBottom: 16 }}>Runs</h1>

        {/* Summary stats */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <Card style={{ textAlign: 'center', padding: '12px 8px' }}><div style={T.mono}>{summary.total}</div><div style={T.muted}>total runs</div></Card>
            <Card style={{ textAlign: 'center', padding: '12px 8px' }}><div style={T.mono}>{Math.round(summary.km)}</div><div style={T.muted}>total km</div></Card>
            <Card style={{ textAlign: 'center', padding: '12px 8px' }}><div style={T.mono}>{fmtPace(summary.avgPace)}</div><div style={T.muted}>avg pace</div></Card>
          </div>
        )}

        {/* Weekly volume sparkline */}
        {rs?.activities && (
          <Card style={{ marginBottom: 20, padding: '14px 16px' }}>
            <div style={{ ...T.label, marginBottom: 10 }}>Weekly Volume</div>
            <WeeklySparkline activities={rs.activities} />
          </Card>
        )}

        {!rs ? <p style={T.muted}><span className="spinner" />Loading runs...</p> : (
          <>
            {/* Week-grouped runs */}
            {weekGroups.map((wg, wi) => {
              const wKey = wg.date.toISOString();
              const isOpen = expandedWeeks[wKey] !== false; // default open
              const weekLabel = `Week of ${wg.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              return (
                <div key={wKey} style={{ marginBottom: 16, animation: `cardEnter 0.3s ease-out ${wi * 40}ms both` }}>
                  <button className="touch-target" onClick={() => toggleWeek(wKey)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`week-toggle-arrow ${isOpen ? 'open' : ''}`} style={{ color: '#5e5448', fontSize: 10 }}>▸</span>
                      <span style={{ ...T.skillLabel, fontSize: 9 }}>{weekLabel}</span>
                    </div>
                    <span style={T.muted}>{wg.runs.length} runs · {wg.km.toFixed(1)} km</span>
                  </button>
                  {isOpen && wg.runs.map((a, i) => (
                    <Card key={a.strava_id || i} delay={i * 20} style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                          <p style={T.muted}>{fmtDate(a.start_date_local || a.start_date)}</p>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 12 }}>
                          <div style={T.mono}>{fmtDist(a.distance_m)}</div>
                          <div style={{ ...T.muted, marginTop: 2 }}>{fmtPace(a.moving_time_s / (a.distance_m / 1000))}/km · {fmtDur(a.moving_time_s)}</div>
                        </div>
                      </div>
                      {(a.average_heartrate || a.total_elevation_gain_m > 10) && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                          {a.average_heartrate > 0 && <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: '#d06050' }}>♥ {Math.round(a.average_heartrate)}</span>}
                          {a.total_elevation_gain_m > 10 && <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: '#a08060' }}>↑ {Math.round(a.total_elevation_gain_m)}m</span>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              );
            })}
            {rs.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 16, alignItems: 'center' }}>
                <button className="touch-target" onClick={() => loadRuns(runsPage - 1)} disabled={runsPage <= 1} style={{ background: 'rgba(232,192,80,.06)', border: '1px solid rgba(170,140,80,.08)', borderRadius: 6, padding: '10px 18px', color: '#e8c050', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', opacity: runsPage <= 1 ? .3 : 1 }}>← Prev</button>
                <span style={T.muted}>{runsPage} / {rs.totalPages}</span>
                <button className="touch-target" onClick={() => loadRuns(runsPage + 1)} disabled={runsPage >= rs.totalPages} style={{ background: 'rgba(232,192,80,.06)', border: '1px solid rgba(170,140,80,.08)', borderRadius: 6, padding: '10px 18px', color: '#e8c050', fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', opacity: runsPage >= rs.totalPages ? .3 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ===== CODEX =====
  const Codex = () => {
    const tabs = [['a', 'Archetypes'], ['t', 'Tiers'], ['m', 'Modifiers']];
    return (
      <div>
        <div style={T.sectionLabel}>Codex</div>
        <h1 style={{ fontSize: 23, fontWeight: 500, marginBottom: 16 }}>Build Encyclopedia</h1>
        <Card style={{ marginBottom: 20 }}>
          <p style={{ ...T.body, color: '#5e5448', fontSize: 12 }}>25 archetypes × 7 tiers × 7 modifiers = <strong style={{ color: '#e8c050' }}>1,225 unique builds</strong>.</p>
        </Card>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {tabs.map(([id, label]) => (
            <button key={id} className="touch-target" onClick={() => { setCxTab(id); setCxSel(null); }} style={{
              fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600,
              color: cxTab === id ? '#e8c050' : '#5e5448',
              background: cxTab === id ? 'rgba(232,192,80,.08)' : 'rgba(40,36,32,.3)',
              border: '1px solid ' + (cxTab === id ? 'rgba(232,192,80,.1)' : 'rgba(100,80,50,.06)'),
              borderRadius: 6, padding: '10px 14px', cursor: 'pointer', flex: 1, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2,
            }}>{label}</button>
          ))}
        </div>

        {/* Archetypes grid */}
        {cxTab === 'a' && !cxSel && (
          <div>
            {['Single', 'Dual', 'Shape'].map(cat => (
              <div key={cat} style={{ marginBottom: 28 }}>
                <div style={{ ...T.label, marginBottom: 14, color: '#a09080' }}>{cat}-{cat === 'Shape' ? 'Based' : 'Dominant'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {ARCHETYPES.filter(a => a.cat === cat).map(a => (
                    <div key={a.id} className="touch-target" onClick={() => setCxSel(a.id)} style={{
                      cursor: 'pointer', textAlign: 'center', borderRadius: 8,
                      background: 'rgba(22,20,17,.9)', border: '1px solid rgba(170,140,80,.06)',
                      padding: '16px 8px 12px',
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{AE[a.id]}</div>
                      <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 600, color: '#a09080', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.3 }}>{a.n}</p>
                      <p style={{ fontSize: 10, color: '#5e5448', fontFamily: "'DM Sans',sans-serif", marginTop: 4, lineHeight: 1.3 }}>{a.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archetype detail */}
        {cxTab === 'a' && cxSel && (() => {
          const a = ARCHETYPES.find(x => x.id === cxSel);
          const p = CP[cxSel] || {};
          return (
            <div>
              <button className="touch-target" style={{ background: 'none', border: 'none', color: '#5e5448', fontSize: 22, cursor: 'pointer', padding: '4px 8px', fontFamily: "'Cormorant Garamond',serif", marginBottom: 16 }} onClick={() => setCxSel(null)}>← Back</button>

              {/* Full-bleed header */}
              <HeroCard style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 16 }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>{AE[cxSel]}</div>
                <h2 style={{ ...T.heading, marginBottom: 6 }}>{a.n}</h2>
                <p style={{ fontSize: 13, color: '#5e5448', fontStyle: 'italic' }}>{a.cat}-{a.cat === 'Shape' ? 'Based' : 'Dominant'} · Primary: {a.pr}</p>
              </HeroCard>

              <Prof profile={p} />

              <Card>
                <div style={{ ...T.label, marginBottom: 10 }}>At Each Tier</div>
                {TIERS.map(t => (
                  <div key={t.n} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(100,90,80,.04)' }}>
                    <span style={T.body}>{t.n} {a.n}</span>
                    <span style={T.mono}>{t.r} avg</span>
                  </div>
                ))}
              </Card>
            </div>
          );
        })()}

        {/* Tiers */}
        {cxTab === 't' && (
          <div>
            {TIERS.map((t, i) => (
              <Card key={t.n} delay={i * 40} style={{ borderLeft: `2px solid rgba(232,192,80,${(.04 + i * .06).toFixed(2)})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={T.headingSm}>{t.n}</h3>
                  <span style={T.mono}>{t.r} avg</span>
                </div>
                <p style={T.body}>{t.d}</p>
                <p style={{ ...T.note, marginTop: 10 }}>{t.how}</p>
              </Card>
            ))}
            <Card>
              <p style={T.body}>Tier = simple average of all 8 skills. Skills at 0 still count. Raise weakest or strongest — math doesn't care.</p>
            </Card>
          </div>
        )}

        {/* Modifiers */}
        {cxTab === 'm' && (
          <div>
            {MODS.map((m, i) => (
              <Card key={m.n} delay={i * 40} style={{ borderLeft: '2px solid rgba(160,144,128,.08)' }}>
                <h3 style={{ ...T.headingSm, marginBottom: 6 }}>{m.n}</h3>
                <p style={T.body}>{m.d}</p>
                <p style={{ ...T.note, marginTop: 10 }}>{m.how}</p>
              </Card>
            ))}
            <Card>
              <p style={T.body}>Modifiers describe training behavior, not ability. Evaluated independently of archetype and tier.</p>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const screens = { home: Home, skills: Skills, detail: Detail, history: History, runs: Runs, codex: Codex };
  const Scr = screens[tab] || Home;
  const navItems = [['home', 'Home'], ['skills', 'Skills'], ['history', 'History'], ['runs', 'Runs'], ['codex', 'Codex']];

  return (
    <div style={{ minHeight: '100vh', background: '#0c0a08', color: '#e8dcc8', fontFamily: "'Cormorant Garamond',serif", maxWidth: 430, margin: '0 auto', paddingBottom: 100 }}>
      <div key={animKey} className="tab-enter" style={{ padding: '28px 20px 20px' }}>
        <Scr />
      </div>

      {/* Bottom nav — frosted glass + SVG icons */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(12,10,8,.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(100,90,80,.06)',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(12px, env(safe-area-inset-bottom))',
        maxWidth: 430, margin: '0 auto',
      }}>
        {navItems.map(([id, label]) => {
          const isActive = tab === id || (tab === 'detail' && id === 'skills');
          return (
            <button key={id} className="touch-target" onClick={() => switchTab(id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 16px', border: 'none', background: 'none', cursor: 'pointer',
              position: 'relative', minWidth: 48, minHeight: 48,
              justifyContent: 'center',
            }}>
              {isActive && <div className="nav-indicator" />}
              {NavIcons[id](isActive)}
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
                fontFamily: "'Cinzel',serif",
                color: isActive ? '#e8c050' : '#5e5448',
              }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => { setShowSettings(false); setConfirmAction(null); }}>
          <div style={{ background: '#161412', borderTop: '1px solid rgba(100,90,80,.08)', borderRadius: '16px 16px 0 0', padding: '24px 20px max(24px, env(safe-area-inset-bottom))', width: '100%', maxWidth: 430 }} onClick={e => e.stopPropagation()}>
            <div style={{ ...T.label, marginBottom: 20, color: '#a09080' }}>Settings</div>

            <Card>
              <div style={T.label}>Account</div>
              <p style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>{data.user?.strava_firstname} {data.user?.strava_lastname}</p>
              <p style={{ ...T.muted, marginTop: 4 }}>{data.activityCount} runs scored · {data.totalActivities} total activities</p>
            </Card>

            <button className="touch-target" style={{
              display: 'block', width: '100%', padding: '14px 24px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'rgba(232,192,80,.06)', color: '#e8c050',
              fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginTop: 12,
            }} onClick={doSync} disabled={syncing}>{syncing ? <><span className="spinner" />{syncMsg}</> : 'Re-sync with Strava'}</button>

            {confirmAction === 'disconnect' ? (
              <div style={{ marginTop: 14 }}>
                <p style={{ color: '#c04040', fontSize: 12, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Disconnect from Strava?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="touch-target" style={{ flex: 1, background: 'rgba(192,64,64,.12)', border: '1px solid rgba(192,64,64,.15)', borderRadius: 6, padding: '12px', color: '#c04040', fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', textAlign: 'center' }} onClick={() => doAction('disconnect')}>Confirm</button>
                  <button className="touch-target" style={{ flex: 1, background: 'rgba(232,192,80,.06)', border: '1px solid rgba(170,140,80,.08)', borderRadius: 6, padding: '12px', color: '#e8c050', fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1, cursor: 'pointer', textAlign: 'center' }} onClick={() => setConfirmAction(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="touch-target" style={{ background: 'rgba(192,64,64,.08)', border: '1px solid rgba(192,64,64,.1)', borderRadius: 6, padding: '12px 16px', color: '#c04040', fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', textAlign: 'left', width: '100%', marginTop: 8 }} onClick={() => setConfirmAction('disconnect')}>Disconnect Strava</button>
            )}

            {confirmAction === 'delete' ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: '#c04040', fontSize: 12, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Permanently delete ALL your data?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="touch-target" style={{ flex: 1, background: 'rgba(192,64,64,.2)', border: '1px solid rgba(192,64,64,.2)', borderRadius: 6, padding: '12px', color: '#c04040', fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', textAlign: 'center' }} onClick={() => doAction('delete-all')}>Delete Everything</button>
                  <button className="touch-target" style={{ flex: 1, background: 'rgba(232,192,80,.06)', border: '1px solid rgba(170,140,80,.08)', borderRadius: 6, padding: '12px', color: '#e8c050', fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1, cursor: 'pointer', textAlign: 'center' }} onClick={() => setConfirmAction(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="touch-target" style={{ background: 'rgba(192,64,64,.08)', border: '1px solid rgba(192,64,64,.1)', borderRadius: 6, padding: '12px 16px', color: '#c04040', fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', textAlign: 'left', width: '100%', marginTop: 6 }} onClick={() => setConfirmAction('delete')}>Delete All My Data</button>
            )}

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(100,90,80,.3)' }}>Solestride v2.0</p>
              <p style={{ color: 'rgba(100,90,80,.2)', fontSize: 10, marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>No maps · No social · No tracking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
