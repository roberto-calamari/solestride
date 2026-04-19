'use client';
import { useState, useEffect, useCallback } from 'react';

// ===== SKILL META =====
const SKILL_META = {
  velocity:{n:'Velocity',i:'⚡',c:'#f0c868',s:'Raw speed vs world standards',
    method:'Each run is converted to an equivalent 5K time using the Riegel formula, then scored on Solestride\'s 0-1400 Speed Index. Your best 5 runs in the scoring window are selected, weighted by recency, and averaged against the theoretical ceiling of 1400.',
    ceiling:'100 requires world-record-equivalent speed. A 25:00 5K scores roughly 30. A competitive 18:00 5K scores around 55. Sub-elite 15:30 approaches 70. Scores above 80 require national-class speed.',
    tips:'Add one tempo session per week (20-30 min at comfortably hard pace). Parkruns and local 5Ks are also great catalysts for moving this number.',
    metrics:{
      wa_avg:{label:'Speed Index (Average)',ex:'Your weighted average across your top recent runs on a 0-1400 scale. A 25:00 5K equivalent scores ~310. A competitive 18:00 5K scores ~800. Higher = faster.'},
      runs_used:{label:'Runs Contributing',ex:'How many of your runs contributed. Only your top 5 most recent are used, weighted so recent performances count more.'},
      top_wa:{label:'Best Single Speed Index',ex:'Your highest score from any single run — your peak speed performance.'},
    }},
  endurance:{n:'Endurance',i:'🛤',c:'#68a878',s:'Distance capacity & pace holding',
    method:'Combines your longest single run (35%), average of top 3 longest (35%), and monthly volume (30%). Each compared against high human ceilings.',
    ceiling:'100 requires 50km+ longest, 35km+ avg top 3, and 400km+ monthly volume. A 21km long run with 140km/month scores roughly 50-60.',
    tips:'Extend your weekly long run by 10% every 2-3 weeks. Adding one extra easy run per week also builds monthly volume.',
    metrics:{
      longest_km:{label:'Longest Run (km)',ex:'Your longest single run. Compared against 50km ceiling.'},
      avg_top3:{label:'Avg Top 3 Runs (km)',ex:'Average distance of your 3 longest — more reliable than a single outlier.'},
      monthly_vol:{label:'Monthly Volume (km)',ex:'Total distance ÷ months. Compared against 400km/month.'},
    }},
  ascent:{n:'Ascent',i:'⛰',c:'#a08060',s:'Climbing power',
    method:'Top climbing rate in m/km (40%), total elevation gain (30%), and hilly run frequency (30%).',
    ceiling:'100 requires 80m/km on hilliest runs, 5000m+ total climbing, 70%+ hilly runs.',
    tips:'Seek hillier routes or add hill repeats. Even one hilly route per week makes a big difference.',
    metrics:{
      top_rate:{label:'Top Climbing Rate (m/km)',ex:'Avg elevation per km on your 3 hilliest runs. Flat=0-3, rolling=5-10, hilly=10-25, mountain=25+.'},
      total_climb:{label:'Total Elevation (m)',ex:'Sum of all elevation gain. Compared against 5,000m.'},
      hill_pct:{label:'Hilly Run Frequency (%)',ex:'Percentage of runs with 8+ m/km elevation rate.'},
    }},
  stamina:{n:'Stamina',i:'♥',c:'#d06050',s:'Cardiac efficiency (needs HR)',
    method:'Efficiency Factor — pace relative to heart rate (65%) and lowest easy-run HR (35%). Requires HR monitor.',
    ceiling:'100 requires EF above 2.2 and easy HR ~100bpm. EF 1.4-1.6 with easy HR ~140 is typical (score ~40-55).',
    tips:'Run truly easy (conversational pace) 80% of the time. Cardiac efficiency takes months — patience is key.',
    metrics:{
      top_ef:{label:'Efficiency Factor (Top 5)',ex:'Pace÷HR averaged across best 5. Higher=more speed per heartbeat. 1.0-1.2 beginner, 1.5-1.8 serious, 1.8+ elite.'},
      easy_hr:{label:'Easiest Run HR (bpm)',ex:'Lowest average HR from an easy run. Lower=more aerobic fitness.'},
      hr_runs:{label:'Runs With HR Data',ex:'Runs with heart rate data. More=more reliable score.'},
    }},
  cadence:{n:'Cadence',i:'👟',c:'#9878b0',s:'Stride mechanics (needs sensor)',
    method:'Closeness to optimal ~182 spm (60%) and consistency across runs (40%). Requires cadence device.',
    ceiling:'100 requires 180-184 spm with extremely low variance. Most recreational runners average 160-170, scoring 30-50.',
    tips:'Run to a metronome app at 5 spm above your current average. Shorter, quicker strides reduce impact.',
    metrics:{
      avg_cadence:{label:'Average Cadence (spm)',ex:'Mean cadence across runs with data. Sweet spot is 180-185. Score penalizes distance from 182.'},
      cadence_runs:{label:'Runs With Cadence Data',ex:'Runs with cadence recorded. Ensure your device records consistently.'},
    }},
  fortitude:{n:'Fortitude',i:'📅',c:'#7090a8',s:'Consistency & discipline',
    method:'Over the last 90 days: runs per week (30%), active weeks percentage (35%), weekly distance stability (35%).',
    ceiling:'100 requires 7 runs/week, 100% active weeks, near-zero weekly variance. 4x/week with consistency scores ~55-65.',
    tips:'Frequency matters most. Adding even a short 20-minute easy run on an off day boosts your numbers significantly.',
    metrics:{
      runs_per_week:{label:'Runs Per Week',ex:'Average runs/week over 90 days. Compared against 7/week.'},
      active_weeks_pct:{label:'Active Weeks (%)',ex:'Weeks with at least one run. Missing a full week drops this fast.'},
      volume_cv:{label:'Weekly Consistency',ex:'How much weekly km fluctuates. Lower=more consistent. Under 0.2 very consistent; over 0.5 erratic.'},
    }},
  resilience:{n:'Resilience',i:'🔁',c:'#c09050',s:'Recovery & fatigue resistance',
    method:'Pace degradation on consecutive-day runs (50%) and overall pace variance (50%).',
    ceiling:'100 requires zero pace drop back-to-back and extremely low variance. Most see 3-8% drop, scoring 40-60.',
    tips:'Build back-to-back tolerance gradually. Sleep, nutrition, and hydration matter as much as training.',
    metrics:{
      b2b_drop:{label:'Back-to-Back Pace Change',ex:'Pace degradation on consecutive days. 0.05 = 5% slower. Negative = faster (strong recovery).'},
      pace_cv:{label:'Pace Variance',ex:'How much pace varies across runs. Under 0.05 very consistent.'},
      b2b_pairs:{label:'Back-to-Back Pairs',ex:'Times you ran consecutive days. Low count = unreliable score.'},
    }},
  ranging:{n:'Ranging',i:'🧭',c:'#58a0a8',s:'Route diversity & exploration',
    method:'Unique start locations (30%), route novelty vs total runs (30%), distance variety (20%), terrain diversity (20%).',
    ceiling:'100 requires 15+ locations, 70%+ unique routes, 6+ distance brackets, all terrain types.',
    tips:'Run from a different start once a week. Vary distances. Seek one new route per week.',
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

// ===== PROFILES (horoscope-style per archetype) =====
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

// ===== RADAR =====
function Radar({skills,size}){const S=size,cx=S/2,cy=S/2,r=S*.36,st=(2*Math.PI)/8;const pt=(i,v)=>({x:cx+(v/100)*r*Math.cos(st*i-Math.PI/2),y:cy+(v/100)*r*Math.sin(st*i-Math.PI/2)});return(<svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{display:'block',margin:'0 auto'}}>{[25,50,75,100].map(v=><polygon key={v} points={SK.map((_,i)=>{const p=pt(i,v);return p.x+','+p.y}).join(' ')} fill="none" stroke="rgba(170,140,80,.06)" strokeWidth=".5"/>)}{SK.map((_,i)=>{const p=pt(i,100);return<line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(170,140,80,.04)" strokeWidth=".5"/>})}<polygon points={SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return p.x+','+p.y}).join(' ')} fill="rgba(232,192,80,.08)" stroke="rgba(232,192,80,.35)" strokeWidth="1.5"/>{SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return<circle key={k} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={SKILL_META[k].c} stroke="rgba(14,11,8,.8)" strokeWidth=".8"/>})}{SK.map((k,i)=>{const p=pt(i,120);return<text key={k} x={p.x.toFixed(1)} y={(p.y+1).toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{font:"600 7px 'Cinzel',serif",fill:'rgba(170,140,80,.35)',textTransform:'uppercase',letterSpacing:2}}>{SKILL_META[k].n.slice(0,3)}</text>})}</svg>);}

// ===== STYLES =====
const Y={page:{minHeight:'100vh',background:'#110e0a',color:'#ddd0b8',fontFamily:"'Cormorant Garamond',serif",maxWidth:430,margin:'0 auto',paddingBottom:90},scr:{padding:'24px 16px 20px'},card:{background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',borderRadius:3,padding:'14px 16px',marginBottom:10,position:'relative'},ci:{position:'absolute',inset:2,border:'1px solid rgba(232,192,80,.04)',borderRadius:2,pointerEvents:'none'},glow:{borderColor:'rgba(170,140,80,.18)',boxShadow:'0 0 30px rgba(200,160,80,.025)'},accent:{borderLeft:'2px solid rgba(232,192,80,.2)'},active:{borderLeft:'2px solid rgba(232,192,80,.3)'},sl:{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:4,marginBottom:5},bn:{fontSize:26,fontWeight:600,fontFamily:"'Cormorant Garamond',serif"},bns:{fontSize:16,fontWeight:500,fontFamily:"'Cormorant Garamond',serif"},tg:{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#e8c050',background:'rgba(232,192,80,.1)',padding:'3px 10px',borderRadius:2,textTransform:'uppercase',letterSpacing:2,border:'1px solid rgba(232,192,80,.12)',marginLeft:8},tgs:{fontFamily:"'Cinzel',serif",fontSize:7,fontWeight:500,color:'#685e4e',background:'rgba(170,140,80,.05)',padding:'2px 7px',borderRadius:2,textTransform:'uppercase',letterSpacing:1.5},tl:{fontSize:14,color:'#685e4e',fontStyle:'italic',marginTop:5},bd:{fontSize:13.5,lineHeight:1.7,color:'#b0a088',fontFamily:"'DM Sans',sans-serif"},xl:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:1.5},dv:{display:'flex',alignItems:'center',gap:14,margin:'28px 0 16px'},dvl:{flex:1,height:1,background:'linear-gradient(to right,transparent,rgba(170,140,80,.1),transparent)'},dvt:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:5},sml:{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:2},mg:{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'#e8c050'},mxl:{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:300,color:'#e8c050'},bt:{height:5,background:'rgba(60,48,30,.6)',borderRadius:1,marginTop:4,border:'1px solid rgba(100,80,50,.12)',overflow:'hidden'},mt:{fontSize:10,lineHeight:1.3,color:'#685e4e',fontFamily:"'DM Sans',sans-serif"},nw:{fontFamily:"'Cinzel',serif",fontSize:7,fontWeight:600,color:'#e8c050',background:'rgba(232,192,80,.1)',padding:'2px 7px',borderRadius:2,letterSpacing:2},se:{fontSize:11,lineHeight:1.6,color:'#685e4e',marginTop:3,paddingLeft:4,borderLeft:'2px solid rgba(232,192,80,.06)',fontFamily:"'DM Sans',sans-serif"},nav:{position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:'rgba(14,11,8,.96)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(170,140,80,.05)',display:'flex',justifyContent:'space-around',padding:'7px 0 max(10px,env(safe-area-inset-bottom))',maxWidth:430,margin:'0 auto'},nb:{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 14px',border:'none',background:'none',cursor:'pointer',color:'#685e4e',transition:'color .2s',fontFamily:"'Cinzel',serif"},nba:{color:'#e8c050'},nl:{fontSize:7,fontWeight:600,letterSpacing:2.5,textTransform:'uppercase'},syncBtn:{display:'block',width:'100%',padding:'14px 24px',borderRadius:3,border:'none',cursor:'pointer',background:'rgba(232,192,80,.1)',color:'#e8c050',fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,letterSpacing:2,textTransform:'uppercase',marginTop:12},bb:{background:'none',border:'none',color:'#685e4e',fontSize:20,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif",padding:'4px 8px'},gear:{background:'none',border:'none',color:'#685e4e',fontSize:18,cursor:'pointer',padding:'4px 8px'},overlay:{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,.7)',display:'flex',alignItems:'flex-end',justifyContent:'center'},panel:{background:'#1a1614',borderTop:'1px solid rgba(170,140,80,.1)',borderRadius:'16px 16px 0 0',padding:'20px 16px max(20px,env(safe-area-inset-bottom))',width:'100%',maxWidth:430},danger:{background:'rgba(192,64,64,.1)',border:'1px solid rgba(192,64,64,.15)',borderRadius:3,padding:'10px 16px',color:'#c04040',fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',textAlign:'left',width:'100%',marginTop:6}};

// ===== MAIN =====
export default function Dashboard(){
  const[data,setData]=useState(null);
  const[tab,setTab]=useState('home');
  const[detail,setDetail]=useState(null);
  const[cxTab,setCxTab]=useState('a');
  const[cxSel,setCxSel]=useState(null);
  const[histSel,setHistSel]=useState(null);
  const[syncing,setSyncing]=useState(false);
  const[syncMsg,setSyncMsg]=useState('');
  const[showSettings,setShowSettings]=useState(false);
  const[confirmAction,setConfirmAction]=useState(null);
  const[runs,setRuns]=useState(null);
  const[runsPage,setRunsPage]=useState(1);

  useEffect(()=>{fetch('/api/user').then(r=>{if(r.status===401){window.location.href='/';return null}return r.json()}).then(d=>{if(d)setData(d)}).catch(()=>{})},[]);

  const doSync=useCallback(async()=>{
    setSyncing(true);setSyncMsg('Importing...');
    try{const r=await fetch('/api/sync',{method:'POST'});const d=await r.json();if(d.status==='completed'){setSyncMsg('Done! '+d.activityCount+' runs scored.');setTimeout(()=>{setSyncing(false);setShowSettings(false);fetch('/api/user').then(r=>r.json()).then(setData);setRuns(null)},1500)}else{setSyncMsg('Error: '+(d.error||'Unknown'));setTimeout(()=>setSyncing(false),3000)}}catch(e){setSyncMsg('Error: '+e.message);setTimeout(()=>setSyncing(false),3000)}
  },[]);

  const loadRuns=useCallback((pg)=>{
    fetch(`/api/user?section=activities&page=${pg}`).then(r=>r.json()).then(d=>{setRuns(d);setRunsPage(pg)}).catch(()=>{});
  },[]);

  useEffect(()=>{if(tab==='runs'&&!runs)loadRuns(1)},[tab]);

  const doAction=async(action)=>{
    await fetch('/api/user',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});
    window.location.href='/';
  };

  if(!data)return<div style={Y.page}><div style={{...Y.scr,textAlign:'center',paddingTop:100}}><p style={{color:'#685e4e'}}>Loading...</p></div></div>;

  const sk=data.currentSkills||{};const bld=data.currentBuild;const hasBuild=bld&&Object.keys(sk).length>0;const trends=data.trends;const history=(data.buildHistory||[]).slice().reverse();

  const Div=({text})=><div style={Y.dv}><div style={Y.dvl}/><span style={Y.dvt}>{text}</span><div style={Y.dvl}/></div>;
  const Card=({children,glow,accent,active:a,style,onClick})=><div style={{...Y.card,...(glow?Y.glow:{}),...(accent?Y.accent:{}),...(a?Y.active:{}),position:'relative',...style}} onClick={onClick}><div style={Y.ci}/>{children}</div>;
  const Prof=({profile,tip})=><>{profile?.identity&&<Card glow><p style={Y.bd}>{profile.identity}</p></Card>}{profile?.howYouRun&&<Card><div style={Y.xl}>How You Run</div><p style={{...Y.bd,marginTop:6}}>{profile.howYouRun}</p></Card>}{profile?.strengths&&<Card><div style={Y.xl}>Your Strengths</div><p style={{...Y.bd,marginTop:6}}>{profile.strengths}</p></Card>}{profile?.watchFor&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>Watch For</div><p style={{...Y.bd,marginTop:6}}>{profile.watchFor}</p></Card>}{tip&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>What Would Level You Up</div><p style={{...Y.bd,marginTop:6}}>{tip}</p></Card>}</>;

  const SBar=({k,score,onClick,showVsAvg})=>{const avg=bld?.avg||0;const diff=score-avg;const t=trends?.[k];return<div style={{marginBottom:14,cursor:onClick?'pointer':undefined}} onClick={onClick}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'center'}}><span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><div style={{display:'flex',alignItems:'center',gap:6}}>{showVsAvg&&Math.abs(diff)>3&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:diff>0?'#50a060':'#c04040'}}>{diff>0?'▲':'▼'} {diff>0?'above':'below'} avg</span>}{!showVsAvg&&t&&Math.abs(t.delta)>0.5&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:t.delta>0?'#50a060':'#c04040'}}>{t.delta>0?'▲':'▼'} {Math.abs(t.delta).toFixed(1)}</span>}<span style={Y.mg}>{Math.round(score*10)/10}</span></div></div><div style={Y.bt}><div style={{height:'100%',width:score+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`,transition:'width 1s ease'}}/></div></div>};

  const fmtPace=(s)=>{if(!s||s<=0)return'--:--';const m=Math.floor(s/60);const sc=Math.floor(s%60);return`${m}:${sc.toString().padStart(2,'0')}`};
  const fmtDist=(m)=>(m/1000).toFixed(2)+' km';
  const fmtDur=(s)=>{const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);return h>0?`${h}h ${m}m`:`${m}m`};
  const fmtDate=(d)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

  // ===== HOME =====
  const Home=()=>!hasBuild?(
    <div style={{textAlign:'center',paddingTop:40}}><h1 style={{fontFamily:"'Cinzel',serif",fontSize:24,color:'#e8c050',letterSpacing:4}}>SOLESTRIDE</h1><p style={{color:'#685e4e',margin:'8px 0 24px'}}>Welcome, {data.user?.strava_firstname}.</p><Card glow style={{textAlign:'center',padding:'24px 16px'}}><p style={{...Y.bd,marginBottom:16}}>Import your full Strava run history.</p>{syncing?<p style={{...Y.mt}}>{syncMsg}</p>:<button style={{...Y.syncBtn,background:'linear-gradient(135deg,#fc4c02,#e84400)',color:'#fff',fontSize:14,fontFamily:"'DM Sans',sans-serif"}} onClick={doSync}>Sync with Strava</button>}</Card></div>
  ):(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={Y.sl}>Active Build</div><div style={{display:'flex',alignItems:'baseline',flexWrap:'wrap'}}><h1 style={Y.bn}>{bld.fullName}</h1><span style={Y.tg}>{bld.modifier}</span></div><p style={Y.tl}>{bld.tierName} tier · {bld.archetypeName} archetype</p></div><button style={Y.gear} onClick={()=>setShowSettings(true)}>⚙</button></div>
      <div style={{display:'flex',justifyContent:'center',margin:'20px 0 16px'}}><Radar skills={sk} size={260}/></div>
      <Prof profile={bld.profile||CP[bld.archetype]} tip={bld.levelUpTip}/>
      <Div text="Skills"/>
      {SK.map(k=><SBar key={k} k={k} score={sk[k]?.score||0} showVsAvg onClick={()=>{setDetail(k);setTab('detail')}}/>)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}><Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{data.activityCount}</div><div style={Y.mt}>Runs scored</div></Card><Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{bld.avg}</div><div style={Y.mt}>Avg score</div></Card></div>
      <button style={{...Y.syncBtn,marginTop:16}} onClick={async()=>{try{if(navigator.share){await navigator.share({title:'My Solestride Build',text:`${bld.fullName} (${bld.modifier}) — ${bld.avg} avg across 8 skills. ${SK.map(k=>`${SKILL_META[k].n}: ${Math.round(sk[k]?.score||0)}`).join(', ')}. solestride.app`})}else{await navigator.clipboard.writeText(`${bld.fullName} (${bld.modifier}) — ${bld.avg} avg`);alert('Copied to clipboard!')}}catch(e){}}}>Share Build</button>
    </div>
  );

  // ===== SKILLS =====
  const Skills=()=><div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={Y.sl}>Character Sheet</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Skill Profile</h1></div><button style={Y.gear} onClick={()=>setShowSettings(true)}>⚙</button></div>
    <Card style={{marginBottom:16}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>Scored 0–100 against universal human ceilings. {trends?'Arrows show 30-day trend.':'Re-sync to see trends.'} Tap any skill for breakdown.</p></Card>
    <Radar skills={sk} size={260}/><Div text="All Skills"/>
    {SK.map(k=>{const s=sk[k]?.score||0;const t=trends?.[k];return<Card key={k} style={{cursor:'pointer'}} onClick={()=>{setDetail(k);setTab('detail')}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}><div style={{flex:1}}><span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><p style={{fontSize:11,color:'#685e4e',marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{SKILL_META[k].s}</p></div><div style={{textAlign:'right'}}><span style={Y.mxl}>{Math.round(s)}</span>{t&&Math.abs(t.delta)>0.5&&<div style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:t.delta>0?'#50a060':'#c04040',marginTop:2}}>{t.delta>0?'▲':'▼'} {Math.abs(t.delta).toFixed(1)} in 30d</div>}</div></div><div style={{...Y.bt,height:5}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`}}/></div></Card>})}
  </div>;

  // ===== DETAIL =====
  const Detail=()=>{const k=detail,m=SKILL_META[k],s=sk[k]?.score||0,d=sk[k]?.detail||{},t=trends?.[k];const mkeys=Object.keys(d).filter(x=>x!=='reason'&&x!=='requires_hr'&&x!=='requires_sensor');return<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><button style={Y.bb} onClick={()=>setTab('skills')}>←</button><span style={{fontSize:23,fontWeight:500}}>{m.i} {m.n}</span></div>
    <Card glow><div style={Y.xl}>Current Rating</div><div style={{display:'flex',alignItems:'baseline',gap:10}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:44,fontWeight:300,color:'#e8c050',marginTop:4}}>{s.toFixed?s.toFixed(1):s}<span style={{fontSize:16,color:'#685e4e'}}> / 100</span></div>{t&&Math.abs(t.delta)>0.5&&<span style={{fontSize:12,fontFamily:"'DM Sans',sans-serif",color:t.delta>0?'#50a060':'#c04040'}}>{t.delta>0?'▲':'▼'} {Math.abs(t.delta).toFixed(1)}</span>}</div><div style={{...Y.bt,height:8,margin:'12px 0'}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${m.c}44,${m.c})`}}/></div></Card>
    <Card><div style={{...Y.xl,marginBottom:8}}>How This Skill Is Calculated</div><p style={Y.bd}>{m.method}</p></Card>
    <Card><div style={{...Y.xl,marginBottom:8}}>What 100 Looks Like</div><p style={Y.bd}>{m.ceiling}</p></Card>
    {mkeys.length>0&&<><Div text="Your Numbers"/>{mkeys.map(key=>{const meta=m.metrics?.[key];const val=d[key];return<Card key={key}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:meta?.ex?6:0}}><span style={{...Y.bd,flex:1}}>{meta?.label||key.replace(/_/g,' ')}</span><span style={{...Y.mg,fontSize:14}}>{typeof val==='number'?Math.round(val*100)/100:val}</span></div>{meta?.ex&&<p style={Y.se}>{meta.ex}</p>}</Card>})}</>}
    <Card accent><div style={{...Y.xl,color:'#e8c050',marginBottom:6}}>How to Improve</div><p style={Y.bd}>{m.tips}</p></Card>
  </div>};

  // ===== HISTORY =====
  const History=()=>{if(histSel!==null){const e=history[histSel];const a=ARCHETYPES.find(x=>x.id===e.archetype);return<div><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><button style={Y.bb} onClick={()=>setHistSel(null)}>←</button><span style={{fontSize:23,fontWeight:500}}>{e.fullName}</span></div><Card glow><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><span style={Y.tgs}>{e.modifier}</span><span style={Y.mt}>{fmtDate(e.date)}</span></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><span style={Y.bns}>{e.tierName} · {e.archetypeName}</span><span style={Y.mg}>{e.avg} avg</span></div><div style={Y.mt}>After {e.runCount} runs</div></Card><Prof profile={e.profile||CP[e.archetype]} tip={e.levelUpTip}/></div>}
  return<div><div style={Y.sl}>Chronicle</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build History</h1><Card style={{marginBottom:14}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>Every archetype, tier, or modifier change is recorded. Tap any entry to explore that build.</p></Card>
  {history.length===0&&<Card><p style={Y.bd}>No history yet. Sync with Strava to reconstruct your timeline.</p></Card>}
  {history.map((b,i)=><Card key={i} active={i===0} style={{cursor:'pointer'}} onClick={()=>setHistSel(i)}><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>{i===0&&<span style={Y.nw}>NOW</span>}<span style={Y.mt}>{fmtDate(b.date)}</span><span style={Y.tgs}>{b.modifier}</span></div><div style={{display:'flex',alignItems:'baseline',gap:8}}><span style={{fontSize:28}}>{AE[b.archetype]||'◇'}</span><div><h3 style={Y.bns}>{b.fullName}</h3><span style={Y.mt}>{b.avg} avg · {b.runCount} runs</span></div></div></Card>)}</div>};

  // ===== RUNS =====
  const Runs=()=><div>
    <div style={Y.sl}>Activity Log</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Runs</h1>
    {!runs?<p style={Y.mt}>Loading...</p>:<>{runs.activities?.map((a,i)=><Card key={a.strava_id||i}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div style={{flex:1,minWidth:0}}><p style={{fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</p><p style={Y.mt}>{fmtDate(a.start_date_local||a.start_date)}</p></div><div style={{textAlign:'right',marginLeft:12}}><div style={Y.mg}>{fmtDist(a.distance_m)}</div><div style={{...Y.mt,marginTop:2}}>{fmtPace(a.moving_time_s/(a.distance_m/1000))}/km · {fmtDur(a.moving_time_s)}</div></div></div>{(a.average_heartrate||a.total_elevation_gain_m>10)&&<div style={{display:'flex',gap:8,marginTop:6}}>{a.average_heartrate>0&&<span style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:'#d06050'}}>♥{Math.round(a.average_heartrate)}</span>}{a.total_elevation_gain_m>10&&<span style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:'#a08060'}}>↑{Math.round(a.total_elevation_gain_m)}m</span>}</div>}</Card>)}
    {runs.totalPages>1&&<div style={{display:'flex',justifyContent:'center',gap:12,marginTop:12}}><button onClick={()=>loadRuns(runsPage-1)} disabled={runsPage<=1} style={{...Y.syncBtn,width:'auto',padding:'8px 16px',opacity:runsPage<=1?.3:1}}>← Prev</button><span style={Y.mt}>{runsPage} / {runs.totalPages}</span><button onClick={()=>loadRuns(runsPage+1)} disabled={runsPage>=runs.totalPages} style={{...Y.syncBtn,width:'auto',padding:'8px 16px',opacity:runsPage>=runs.totalPages?.3:1}}>Next →</button></div>}</>}
  </div>;

  // ===== CODEX =====
  const Codex=()=>{const tabs=[['a','Archetypes'],['t','Tiers'],['m','Modifiers']];return<div>
    <div style={Y.sl}>Codex</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build Encyclopedia</h1>
    <Card style={{marginBottom:14}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>25 archetypes × 7 tiers × 7 modifiers = <strong style={{color:'#e8c050'}}>1,225 unique builds</strong>.</p></Card>
    <div style={{display:'flex',gap:3,marginBottom:16}}>{tabs.map(([id,label])=><button key={id} onClick={()=>{setCxTab(id);setCxSel(null)}} style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:cxTab===id?'#e8c050':'#685e4e',background:cxTab===id?'rgba(232,192,80,.1)':'rgba(60,48,30,.3)',border:'1px solid '+(cxTab===id?'rgba(232,192,80,.12)':'rgba(100,80,50,.08)'),borderRadius:2,padding:'9px 14px',cursor:'pointer',flex:1,textAlign:'center',textTransform:'uppercase',letterSpacing:1.5}}>{label}</button>)}</div>
    {cxTab==='a'&&!cxSel&&<div>{['Single','Dual','Shape'].map(cat=><div key={cat} style={{marginBottom:20}}><div style={{...Y.xl,marginBottom:10,color:'#b0a088'}}>{cat}-{cat==='Shape'?'Based':'Dominant'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{ARCHETYPES.filter(a=>a.cat===cat).map(a=><div key={a.id} onClick={()=>setCxSel(a.id)} style={{cursor:'pointer',textAlign:'center',borderRadius:3,background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',padding:'14px 6px 10px'}}><div style={{fontSize:28,marginBottom:6}}>{AE[a.id]}</div><p style={{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:1}}>{a.n}</p></div>)}</div></div>)}</div>}
    {cxTab==='a'&&cxSel&&(()=>{const a=ARCHETYPES.find(x=>x.id===cxSel);const p=CP[cxSel]||{};return<div><button style={{...Y.bb,marginBottom:14}} onClick={()=>setCxSel(null)}>← Back</button><div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:48,marginBottom:8}}>{AE[cxSel]}</div><h2 style={{...Y.bn,marginBottom:4}}>{a.n}</h2><p style={Y.tl}>{a.cat}-{a.cat==='Shape'?'Based':'Dominant'} · Primary: {a.pr}</p></div><Prof profile={p}/><Card><div style={{...Y.xl,marginBottom:6}}>At Each Tier</div>{TIERS.map(t=><div key={t.n} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(170,140,80,.04)'}}><span style={Y.bd}>{t.n} {a.n}</span><span style={Y.mt}>{t.r} avg</span></div>)}</Card></div>})()}
    {cxTab==='t'&&<div>{TIERS.map((t,i)=><Card key={t.n} style={{borderLeft:`2px solid rgba(232,192,80,${(.04+i*.06).toFixed(2)})`}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><h3 style={Y.bns}>{t.n}</h3><span style={Y.mg}>{t.r} avg</span></div><p style={Y.bd}>{t.d}</p><p style={{...Y.se,marginTop:8}}>{t.how}</p></Card>)}<Card><p style={Y.bd}>Tier = simple average of all 8 skills. Skills at 0 still count. Raise weakest or strongest — math doesn't care.</p></Card></div>}
    {cxTab==='m'&&<div>{MODS.map(m=><Card key={m.n} style={{borderLeft:'2px solid rgba(170,140,80,.08)'}}><h3 style={{...Y.bns,marginBottom:4}}>{m.n}</h3><p style={Y.bd}>{m.d}</p><p style={{...Y.se,marginTop:8}}>{m.how}</p></Card>)}<Card><p style={Y.bd}>Modifiers describe training behavior, not ability. Evaluated independently of archetype and tier.</p></Card></div>}
  </div>};

  const screens={home:Home,skills:Skills,detail:Detail,history:History,runs:Runs,codex:Codex};
  const Scr=screens[tab]||Home;
  const navItems=[['home','⚔','Home'],['skills','✦','Skills'],['history','◈','History'],['runs','🏃','Runs'],['codex','❖','Codex']];

  return(<div style={Y.page}>
    <div style={Y.scr}><Scr/></div>
    <div style={Y.nav}>{navItems.map(([id,icon,label])=><button key={id} onClick={()=>{if(id==='history')setHistSel(null);setTab(id)}} style={{...Y.nb,...(tab===id||(tab==='detail'&&id==='skills')?Y.nba:{})}}><span style={{fontSize:16}}>{icon}</span><span style={Y.nl}>{label}</span></button>)}</div>
    {showSettings&&<div style={Y.overlay} onClick={()=>{setShowSettings(false);setConfirmAction(null)}}><div style={Y.panel} onClick={e=>e.stopPropagation()}>
      <div style={{...Y.xl,marginBottom:16,color:'#b0a088'}}>Settings</div>
      <Card><div style={Y.xl}>Account</div><p style={{fontSize:16,fontWeight:500,marginTop:4}}>{data.user?.strava_firstname} {data.user?.strava_lastname}</p><p style={Y.mt}>{data.activityCount} runs scored · {data.totalActivities} total activities</p></Card>
      <button style={Y.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
      {confirmAction==='disconnect'?<div style={{marginTop:12}}><p style={{color:'#c04040',fontSize:12,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Disconnect from Strava?</p><div style={{display:'flex',gap:8}}><button style={{...Y.danger,flex:1,textAlign:'center'}} onClick={()=>doAction('disconnect')}>Confirm</button><button style={{...Y.syncBtn,flex:1,marginTop:0}} onClick={()=>setConfirmAction(null)}>Cancel</button></div></div>:<button style={Y.danger} onClick={()=>setConfirmAction('disconnect')}>Disconnect Strava</button>}
      {confirmAction==='delete'?<div style={{marginTop:6}}><p style={{color:'#c04040',fontSize:12,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Permanently delete ALL your data?</p><div style={{display:'flex',gap:8}}><button style={{...Y.danger,flex:1,textAlign:'center',background:'rgba(192,64,64,.3)'}} onClick={()=>doAction('delete-all')}>Delete Everything</button><button style={{...Y.syncBtn,flex:1,marginTop:0}} onClick={()=>setConfirmAction(null)}>Cancel</button></div></div>:<button style={Y.danger} onClick={()=>setConfirmAction('delete')}>Delete All My Data</button>}
      <div style={{textAlign:'center',marginTop:16}}><p style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'rgba(100,90,70,.4)'}}>Solestride v1.0</p><p style={{color:'rgba(100,90,70,.3)',fontSize:10,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>No maps · No social · No tracking</p></div>
    </div></div>}
  </div>);
}
