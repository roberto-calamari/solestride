'use client';
import { useState, useEffect, useCallback } from 'react';

// ===== SKILL META WITH FULL EXPLANATIONS =====
const SKILL_META = {
  velocity:{n:'Velocity',i:'⚡',c:'#f0c868',s:'Raw speed vs world standards',
    method:'Your speed is measured by converting each run to a World Athletics (WA) score — the same system used to compare performances across different distances at international competitions. Your best 5 runs within the scoring window are selected, weighted by recency (recent runs count more), and averaged. That average is scored against the theoretical world-record ceiling of 1400 WA points.',
    ceiling:'A score of 100 would mean averaging world-record equivalent performances. For reference: a 25-minute 5K scores roughly 30. A competitive 18-minute 5K scores around 55. Sub-elite 15:30 approaches 70. Scores above 80 require genuinely national-class speed.',
    tips:'Add one tempo session per week (20-30 minutes at comfortably hard pace) and occasional race-pace intervals. Even one weekly speed session can significantly boost your WA scores. Parkruns and local 5Ks are also great catalysts.',
    metrics:{
      wa_avg:{label:'World Athletics Score (Average)',ex:'Your weighted average WA score across your top recent runs. A recreational 5K in ~25 min scores around 400-500 WA points. A competitive 18:00 5K scores ~800. World records approach 1400.'},
      runs_used:{label:'Runs Contributing',ex:'How many of your runs contributed to this score. Only your top 5 most recent WA-scored runs are used, weighted so recent performances count more (exponential decay over ~30 days).'},
      top_wa:{label:'Best Single WA Score',ex:'Your highest WA score from any single run in the scoring window. This represents your peak speed performance — the best version of your speed that your data shows.'},
    }},
  endurance:{n:'Endurance',i:'🛤',c:'#68a878',s:'Distance capacity & pace holding',
    method:'Endurance measures how far you can go and how well you hold pace over distance. It combines three factors: your longest single run (35% weight), the average of your 3 longest runs (35%), and your monthly volume (30%). Each is compared against ceilings representing very high human capacity.',
    ceiling:'A score of 100 requires a 50km+ longest run, 35km+ average across your top 3, and 400km+ monthly volume. A 21km long run with 140km/month scores roughly in the 50-60 range. Most recreational runners with regular 10km runs land in the 25-40 range.',
    tips:'Extend your weekly long run by 10% every 2-3 weeks. Adding one extra easy run per week also builds monthly volume. The key is patience — endurance responds to consistent, gradual progression more than any single heroic effort.',
    metrics:{
      longest_km:{label:'Longest Single Run (km)',ex:'The distance of your longest run in the scoring window. Compared against a ceiling of 50km. This measures your absolute distance capacity — how far you can push in a single effort.'},
      avg_top3:{label:'Average of Top 3 Runs (km)',ex:'The average distance of your 3 longest runs. This is more indicative than a single outlier — it shows whether long runs are a pattern or a one-off.'},
      monthly_vol:{label:'Monthly Volume (km)',ex:'Your total distance divided by the number of months in your scoring window. Compared against 400km/month. This measures sustained training volume.'},
    }},
  ascent:{n:'Ascent',i:'⛰',c:'#a08060',s:'Climbing power',
    method:'Ascent measures your climbing ability across three dimensions: your top climbing rate in meters of elevation per kilometer run (40% weight), your total accumulated elevation gain (30%), and the frequency of hilly runs in your training (30%).',
    ceiling:'A score of 100 requires averaging 80m elevation gain per km on your hilliest runs, 5000m+ total climbing, and 70%+ of your runs being genuinely hilly (8+ m/km elevation rate). Mountain and trail runners typically score highest here.',
    tips:'Seek out hillier routes or add dedicated hill repeats. Even running a hilly route once per week will significantly boost both your climbing rate and your hill frequency percentage. Stair workouts count toward general hill fitness too.',
    metrics:{
      top_rate:{label:'Top Climbing Rate (m/km)',ex:'Your average elevation gain per kilometer across your 3 hilliest runs. For context: flat road = 0-3 m/km, rolling = 5-10, hilly = 10-25, mountain = 25+. Compared against 80 m/km.'},
      total_climb:{label:'Total Elevation Gained (m)',ex:'Sum of all elevation gain across scored runs in your window. Compared against a ceiling of 5,000 meters — equivalent to several months of regular hill training.'},
      hill_pct:{label:'Hilly Run Frequency (%)',ex:'The percentage of your runs that qualify as genuinely hilly (8+ m/km elevation rate). This measures how much of your training involves meaningful climbing.'},
    }},
  stamina:{n:'Stamina',i:'♥',c:'#d06050',s:'Cardiac efficiency (needs HR)',
    method:'Stamina measures how efficiently your heart produces speed — the relationship between pace and heart rate. It uses your Efficiency Factor (pace divided by heart rate, 65% weight) and your lowest recorded easy-run heart rate (35%). Requires a heart rate monitor.',
    ceiling:'A score of 100 requires an Efficiency Factor above 2.2 (extremely fast pace at low HR) and easy-run heart rates around 100 bpm. An EF of 1.4-1.6 with easy HR around 140 is typical for regular runners (score ~40-55). Elite marathoners often exceed 1.8 EF.',
    tips:'More easy-paced running at controlled heart rate is the single best way to improve this. Run truly easy (conversational pace) 80% of the time and let your aerobic base develop. Patience is key — cardiac efficiency takes months to measurably improve.',
    metrics:{
      top_ef:{label:'Efficiency Factor (Top 5 Average)',ex:'Pace divided by heart rate, averaged across your 5 best runs. Higher = more speed per heartbeat. An EF of 1.0-1.2 is beginner, 1.3-1.5 is recreational, 1.5-1.8 is serious, 1.8+ is elite.'},
      easy_hr:{label:'Easiest Run Heart Rate (bpm)',ex:'Your lowest average heart rate from an easy-paced run. Lower = more aerobic fitness. This reflects your base cardiovascular conditioning.'},
      hr_runs:{label:'Runs With Heart Rate Data',ex:'How many of your runs had heart rate data available. More data = more reliable score. If this is low, wearing your HR monitor more consistently will improve accuracy.'},
    }},
  cadence:{n:'Cadence',i:'👟',c:'#9878b0',s:'Stride mechanics (needs sensor)',
    method:'Cadence measures stride efficiency by looking at how close your average cadence is to the biomechanically optimal ~182 steps per minute (60% weight) and how consistent your cadence is across runs (40%). Requires a cadence-capable device.',
    ceiling:'A score of 100 requires averaging 180-184 spm with extremely low run-to-run variance (coefficient of variation under 1%). Most recreational runners average 160-170 spm with moderate variance, scoring in the 30-50 range.',
    tips:'Focus on increasing cadence gradually — try running to a metronome app at 5 spm above your current average. Shorter, quicker strides reduce impact forces and improve efficiency. Cadence tends to improve naturally with speed work too.',
    metrics:{
      avg_cadence:{label:'Average Cadence (steps/min)',ex:'Your mean cadence across all runs with cadence data. The biomechanical sweet spot is 180-185 spm. Below 160 is typically overstriding; above 190 is unusual outside sprinting. Score penalizes distance from 182.'},
      cadence_runs:{label:'Runs With Cadence Data',ex:'How many of your runs had cadence data recorded. More data means a more reliable score. If this is low, ensure your watch or footpod is recording cadence consistently.'},
    }},
  fortitude:{n:'Fortitude',i:'📅',c:'#7090a8',s:'Consistency & discipline',
    method:'Fortitude measures training discipline over the last 90 days using three factors: runs per week (30%), percentage of weeks with at least one run (35%), and how stable your weekly distance is (35% — lower variance = higher score).',
    ceiling:'A score of 100 requires 7 runs per week, 100% active weeks, and near-zero variance in weekly distance. Running 4x/week with good consistency scores roughly 55-65. Running 3x/week with occasional missed weeks lands around 35-45.',
    tips:'Frequency matters more than intensity here. Adding even a short 20-minute easy run on an off day boosts your runs-per-week and active-weeks percentage. Set a minimum-viable run (e.g., 2km) for days when motivation is low.',
    metrics:{
      runs_per_week:{label:'Runs Per Week (Average)',ex:'Your average number of runs per week over the last 90 days. Compared against 7 runs/week. Even 0.5 more runs per week meaningfully moves this number.'},
      active_weeks_pct:{label:'Active Weeks (%)',ex:'The percentage of weeks in the last 90 days where you ran at least once. Missing an entire week drops this significantly. Compared against 100%.'},
      volume_cv:{label:'Weekly Volume Consistency',ex:'The coefficient of variation of your weekly distance — how much your weekly kilometers fluctuate. Lower = more consistent. A value of 0.3 means your weekly distance varies by about 30% from week to week. Under 0.2 is very consistent.'},
    }},
  resilience:{n:'Resilience',i:'🔁',c:'#c09050',s:'Recovery & fatigue resistance',
    method:'Resilience measures how well you perform on back-to-back days. It combines your average pace degradation on consecutive-day runs (50%) with your overall pace variance across all runs (50%). Less degradation and less variance = higher score.',
    ceiling:'A score of 100 requires zero pace degradation on consecutive days and extremely low pace variance across all runs. Most runners see 3-8% pace drop on back-to-back days and moderate pace variance, scoring in the 40-60 range.',
    tips:'Build back-to-back run tolerance gradually. Try running easy the day after a harder session. Sleep quality, nutrition, and hydration are as important as the training itself for improving recovery capacity.',
    metrics:{
      b2b_drop:{label:'Back-to-Back Pace Change',ex:'How much your pace degrades when you run on consecutive days. A value of 0.05 means you\'re 5% slower on the second day. Negative values mean you actually ran faster — highly unusual and a sign of strong recovery.'},
      pace_cv:{label:'Overall Pace Variance',ex:'How much your pace varies across all runs (coefficient of variation). Lower = more consistent performance. Under 0.05 is very consistent; over 0.10 indicates wide swings in effort or fitness.'},
      b2b_pairs:{label:'Back-to-Back Run Pairs',ex:'How many times you ran on consecutive days within the scoring window. More pairs = more data to evaluate recovery. If this is low, your resilience score may not be fully representative.'},
    }},
  ranging:{n:'Ranging',i:'🧭',c:'#58a0a8',s:'Route diversity & exploration',
    method:'Ranging measures how much you explore. It combines unique starting locations (30% — coarsened to ~1km grid for privacy), route novelty relative to total runs (30%), variety in run distances (20%), and terrain type diversity (20%).',
    ceiling:'A score of 100 requires 15+ unique start locations, 70%+ unique routes, 6+ distinct distance brackets, and all terrain types (flat, rolling, hilly, mountain). Running the same loop every day scores near 0 for route novelty.',
    tips:'Run from a different starting point once a week. Vary your distances — mix short 3-5km runs with longer 10-15km efforts. Seek out one new route per week. Even small variations to familiar routes count toward uniqueness.',
    metrics:{
      locations:{label:'Unique Starting Locations',ex:'How many distinct starting areas you\'ve run from (locations coarsened to ~1km grid). Running from home every day = 1. Running from different parks, neighborhoods, or trailheads increases this. Compared against 15.'},
      unique_routes:{label:'Unique Routes',ex:'How many of your routes are distinct from each other (based on GPS path hashing). Compared as a ratio against your total runs — if 11 of 20 runs are unique, that\'s 55% novelty.'},
      dist_buckets:{label:'Distance Variety',ex:'How many distinct distance brackets your runs span (grouped in 3km increments). Running only 5km every time = 1 bucket. Mixing 3km, 5km, 10km, 15km = 4 buckets. Compared against 6.'},
      terrain_types:{label:'Terrain Types',ex:'How many terrain categories your runs cover: flat (0-3 m/km elevation), rolling (3-10), hilly (10-25), or mountain (25+). Running only flat roads = 1. Compared against 3 terrain types.'},
    }},
};
const SK = Object.keys(SKILL_META);

// ===== ARCHETYPE DISPLAY DATA (for codex) =====
const ARCHETYPES = [
{id:'speed_demon',n:'Speed Demon',pr:'Velocity',d:'Pure speed above all else.',c1:'#e83030',c2:'#ff6040',c3:'#f0c060',cat:'Single'},
{id:'long_hauler',n:'Long Hauler',pr:'Endurance',d:'Eats miles for breakfast.',c1:'#3070a8',c2:'#50a0d8',c3:'#e87040',cat:'Single'},
{id:'hill_grinder',n:'Hill Grinder',pr:'Ascent',d:'The steeper the better.',c1:'#508848',c2:'#80c060',c3:'#e0c040',cat:'Single'},
{id:'cardiac_king',n:'Cardiac King',pr:'Stamina',d:'Supreme aerobic engine.',c1:'#c03040',c2:'#f06070',c3:'#f08080',cat:'Single'},
{id:'metronome',n:'Metronome',pr:'Cadence',d:'Every step calibrated.',c1:'#a0a0b8',c2:'#d0d0e0',c3:'#4080d0',cat:'Single'},
{id:'the_grinder',n:'The Grinder',pr:'Fortitude',d:'Never misses a day.',c1:'#505860',c2:'#8898a8',c3:'#d0d040',cat:'Single'},
{id:'rubber_band',n:'Rubber Band',pr:'Resilience',d:'Rebounds from fatigue fast.',c1:'#3878a8',c2:'#60b0d8',c3:'#50c070',cat:'Single'},
{id:'pathfinder',n:'Pathfinder',pr:'Ranging',d:'Always a new route.',c1:'#c07030',c2:'#e8a050',c3:'#40a0d0',cat:'Single'},
{id:'tempo_hound',n:'Tempo Hound',pr:'Velocity + Stamina',d:'Fast AND efficient.',c1:'#8048a0',c2:'#b870e0',c3:'#f0d050',cat:'Dual'},
{id:'weekend_warrior',n:'Weekend Warrior',pr:'Velocity + Endurance',d:'When you show up, you go hard.',c1:'#d0a020',c2:'#f8d048',c3:'#ffffff',cat:'Dual'},
{id:'volume_junkie',n:'Volume Junkie',pr:'Endurance + Fortitude',d:'High mileage, high consistency.',c1:'#a07030',c2:'#d0a050',c3:'#f0e0c0',cat:'Dual'},
{id:'trail_rat',n:'Trail Rat',pr:'Ranging + Ascent',d:'Off-road explorer who loves hills.',c1:'#688848',c2:'#a0c868',c3:'#d05030',cat:'Dual'},
{id:'the_commuter',n:'The Commuter',pr:'Fortitude + Ranging',d:'Runs everywhere, every day.',c1:'#607080',c2:'#90a8b8',c3:'#e0e040',cat:'Dual'},
{id:'track_rat',n:'Track Rat',pr:'Velocity + Cadence',d:'Fast with sharp form.',c1:'#d06030',c2:'#f08848',c3:'#f8e870',cat:'Dual'},
{id:'mountain_goat',n:'Mountain Goat',pr:'Ascent + Endurance',d:'Long mountain runs.',c1:'#607848',c2:'#88a868',c3:'#c8b070',cat:'Dual'},
{id:'iron_lung',n:'Iron Lung',pr:'Stamina + Endurance',d:'Low HR, big distance.',c1:'#4868a0',c2:'#7098d0',c3:'#80d0a0',cat:'Dual'},
{id:'clockwork',n:'Clockwork',pr:'Cadence + Fortitude',d:'Precise AND consistent.',c1:'#708098',c2:'#a0b8d0',c3:'#b0b8c8',cat:'Dual'},
{id:'comeback_kid',n:'Comeback Kid',pr:'Resilience + Fortitude',d:'Trains through anything.',c1:'#a07840',c2:'#d0a860',c3:'#60c880',cat:'Dual'},
{id:'disciplined_racer',n:'Disciplined Racer',pr:'Velocity + Fortitude',d:'Fast AND disciplined.',c1:'#b85030',c2:'#e07050',c3:'#f0d060',cat:'Dual'},
{id:'terrain_mixer',n:'Terrain Mixer',pr:'Ranging + Resilience',d:'Variety runner who stays fresh.',c1:'#50888a',c2:'#78b8b8',c3:'#c8a050',cat:'Dual'},
{id:'base_builder',n:'Base Builder',pr:'Stamina + Fortitude',d:'Patient aerobic development.',c1:'#705888',c2:'#a080b8',c3:'#d0a870',cat:'Dual'},
{id:'all_rounder',n:'All-Rounder',pr:'Balanced',d:'No weakness anywhere.',c1:'#4878a0',c2:'#78b0d0',c3:'#e09040',cat:'Shape'},
{id:'the_specialist',n:'The Specialist',pr:'One extreme skill',d:'One skill towers above.',c1:'#c0a040',c2:'#e8c860',c3:'#ffffff',cat:'Shape'},
{id:'raw_talent',n:'Raw Talent',pr:'High peak, low floor',d:'Fast but inconsistent.',c1:'#a05030',c2:'#d07050',c3:'#f8e080',cat:'Shape'},
{id:'workhorse',n:'Workhorse',pr:'High grit, modest speed',d:'Not the fastest, but always there.',c1:'#686058',c2:'#988878',c3:'#c0b8a0',cat:'Shape'},
];
const TIERS=[{n:'Beginner',r:'0–10',d:'Just starting. Every run builds foundation.',how:'Average of all 8 skill scores falls between 0 and 10. Even skills reading 0 (missing sensor data) count as 0 in the average.'},{n:'Developing',r:'10–22',d:'Building habits. Becoming a runner.',how:'Average between 10 and 22. Typically means a few skills are developing while others remain low or data-dependent.'},{n:'Solid',r:'22–36',d:'Consistent with real history.',how:'Average between 22 and 36. You\'ve been running regularly for months with enough data to score meaningfully across most skills.'},{n:'Strong',r:'36–50',d:'Serious dedicated training.',how:'Average between 36 and 50. Multiple skills in the 40-60 range with consistent training patterns.'},{n:'Competitive',r:'50–65',d:'Racing-ready. Club level.',how:'Average between 50 and 65. Strong scores across the board — you\'re faster, more consistent, and better-trained than the large majority of runners.'},{n:'Elite',r:'65–82',d:'Exceptional. Years of focused work.',how:'Average between 65 and 82. This requires years of dedicated, structured training with strong performance across nearly all measurable dimensions.'},{n:'World-Class',r:'82+',d:'Approaching human limits.',how:'Average above 82. Every skill must be near its ceiling. Practically unreachable without professional-level genetics and training.'}];
const MODS=[{n:'Consistent',d:'Steady week after week.',how:'Assigned when your fortitude score exceeds 55 AND your weekly volume coefficient of variation is below 0.4 — meaning your weekly distance doesn\'t fluctuate more than 40%.'},{n:'Streaky',d:'Peaks then gaps.',how:'Assigned when your weekly volume coefficient of variation exceeds 0.6 — meaning your weekly distance swings by more than 60%, indicating alternating heavy and light periods.'},{n:'Improving',d:'Trending up.',how:'Assigned when comparing recent skill scores to earlier snapshots shows consistent upward movement across multiple skills.'},{n:'Plateau\'d',d:'Stable. Needs a shift.',how:'Assigned when skill scores have remained within a narrow band for an extended period without meaningful change in either direction.'},{n:'Comeback',d:'Reversing regression.',how:'Assigned when scores are rising after a period of decline — typically after a break from training followed by a return to consistent running.'},{n:'Fresh',d:'Under 20 scored runs.',how:'Assigned when fewer than 20 of your runs have been scored. With limited data, other modifiers can\'t be reliably determined.'},{n:'Veteran',d:'Hundreds of runs.',how:'Assigned when you have 200+ scored runs AND your fortitude score exceeds 55 — reflecting both deep history and maintained consistency.'}];

// ===== RADAR CHART =====
function Radar({skills,size}){
  const S=size,cx=S/2,cy=S/2,r=S*.36,st=(2*Math.PI)/8;
  const pt=(i,v)=>({x:cx+(v/100)*r*Math.cos(st*i-Math.PI/2),y:cy+(v/100)*r*Math.sin(st*i-Math.PI/2)});
  return(<svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{display:'block',margin:'0 auto'}}>
    {[25,50,75,100].map(v=><polygon key={v} points={SK.map((_,i)=>{const p=pt(i,v);return p.x+','+p.y}).join(' ')} fill="none" stroke="rgba(170,140,80,.06)" strokeWidth=".5"/>)}
    {SK.map((_,i)=>{const p=pt(i,100);return<line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(170,140,80,.04)" strokeWidth=".5"/>})}
    <polygon points={SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return p.x+','+p.y}).join(' ')} fill="rgba(232,192,80,.08)" stroke="rgba(232,192,80,.35)" strokeWidth="1.5"/>
    {SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return<circle key={k} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={SKILL_META[k].c} stroke="rgba(14,11,8,.8)" strokeWidth=".8"/>})}
    {SK.map((k,i)=>{const p=pt(i,120);return<text key={k} x={p.x.toFixed(1)} y={(p.y+1).toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{font:"600 7px 'Cinzel',serif",fill:'rgba(170,140,80,.35)',textTransform:'uppercase',letterSpacing:2}}>{SKILL_META[k].n.slice(0,3)}</text>})}
  </svg>);
}

// ===== STYLES =====
const Y={
  page:{minHeight:'100vh',background:'#110e0a',color:'#ddd0b8',fontFamily:"'Cormorant Garamond',serif",maxWidth:430,margin:'0 auto',paddingBottom:90},
  scr:{padding:'24px 16px 20px',animation:'fu .4s ease-out'},
  card:{background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',borderRadius:3,padding:'14px 16px',marginBottom:10,position:'relative'},
  cardInner:{content:'',position:'absolute',inset:2,border:'1px solid rgba(232,192,80,.04)',borderRadius:2,pointerEvents:'none'},
  glow:{borderColor:'rgba(170,140,80,.18)',boxShadow:'0 0 30px rgba(200,160,80,.025),inset 0 1px 0 rgba(255,240,200,.03)'},
  accent:{borderLeft:'2px solid rgba(232,192,80,.2)'},
  sl:{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:4,marginBottom:5},
  bn:{fontSize:26,fontWeight:600,fontFamily:"'Cormorant Garamond',serif",letterSpacing:.2},
  tg:{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#e8c050',background:'rgba(232,192,80,.1)',padding:'3px 10px',borderRadius:2,textTransform:'uppercase',letterSpacing:2,border:'1px solid rgba(232,192,80,.12)',marginLeft:8},
  tl:{fontSize:14,color:'#685e4e',fontStyle:'italic',marginTop:5},
  bd:{fontSize:13.5,lineHeight:1.7,color:'#b0a088',fontFamily:"'DM Sans',sans-serif"},
  xl:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:1.5},
  dv:{display:'flex',alignItems:'center',gap:14,margin:'28px 0 16px'},
  dvl:{flex:1,height:1,background:'linear-gradient(to right,transparent,rgba(170,140,80,.1),transparent)'},
  dvt:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:5},
  sml:{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:2},
  mg:{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'#e8c050'},
  bt:{height:5,background:'rgba(60,48,30,.6)',borderRadius:1,marginTop:4,border:'1px solid rgba(100,80,50,.12)',overflow:'hidden'},
  nav:{position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:'rgba(14,11,8,.96)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(170,140,80,.05)',display:'flex',justifyContent:'space-around',padding:'7px 0 max(10px,env(safe-area-inset-bottom))',maxWidth:430,margin:'0 auto'},
  nb:{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 14px',border:'none',background:'none',cursor:'pointer',color:'#685e4e',transition:'color .2s',fontFamily:"'Cinzel',serif"},
  nba:{color:'#e8c050'},
  nl:{fontSize:7,fontWeight:600,letterSpacing:2.5,textTransform:'uppercase'},
  syncBtn:{display:'block',width:'100%',padding:'14px 24px',borderRadius:3,border:'none',cursor:'pointer',background:'rgba(232,192,80,.1)',color:'#e8c050',fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,letterSpacing:2,textTransform:'uppercase',marginTop:12},
  se:{fontSize:11,lineHeight:1.6,color:'#685e4e',marginTop:3,paddingLeft:4,borderLeft:'2px solid rgba(232,192,80,.06)',fontFamily:"'DM Sans',sans-serif"},
  infoBtn:{background:'none',border:'1px solid rgba(170,140,80,.15)',borderRadius:'50%',width:18,height:18,fontSize:10,color:'#685e4e',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',marginLeft:6,fontFamily:"'DM Sans',sans-serif",lineHeight:1},
};

// ===== MAIN COMPONENT =====
export default function Dashboard(){
  const[data,setData]=useState(null);
  const[tab,setTab]=useState('build');
  const[detail,setDetail]=useState(null);
  const[cxTab,setCxTab]=useState('a');
  const[cxSel,setCxSel]=useState(null);
  const[syncing,setSyncing]=useState(false);
  const[syncMsg,setSyncMsg]=useState('');
  const[infoPopup,setInfoPopup]=useState(null);

  useEffect(()=>{fetch('/api/user').then(r=>{if(r.status===401){window.location.href='/';return null}return r.json()}).then(d=>{if(d)setData(d)}).catch(()=>{})},[]);

  const doSync=useCallback(async()=>{
    setSyncing(true);setSyncMsg('Importing from Strava...');
    try{const r=await fetch('/api/sync',{method:'POST'});const d=await r.json();if(d.status==='completed'){setSyncMsg('Done! '+d.activityCount+' runs scored.');setTimeout(()=>{setSyncing(false);fetch('/api/user').then(r=>r.json()).then(setData)},1500)}else{setSyncMsg('Error: '+(d.error||'Unknown'));setTimeout(()=>setSyncing(false),3000)}}catch(e){setSyncMsg('Error: '+e.message);setTimeout(()=>setSyncing(false),3000)}
  },[]);

  if(!data)return<div style={Y.page}><div style={{...Y.scr,textAlign:'center',paddingTop:100}}><p style={{color:'#685e4e'}}>Loading...</p></div></div>;

  const sk=data.currentSkills||{};
  const bld=data.currentBuild;
  const hasBuild=bld&&Object.keys(sk).length>0;

  // Helpers
  const Divider=({text})=><div style={Y.dv}><div style={Y.dvl}/><span style={Y.dvt}>{text}</span><div style={Y.dvl}/></div>;
  const Card=({children,glow,accent,style})=><div style={{...Y.card,...(glow?Y.glow:{}),...(accent?Y.accent:{}),position:'relative',...style}}><div style={Y.cardInner}/>{children}</div>;
  const InfoButton=({onClick})=><button style={Y.infoBtn} onClick={onClick}>ⓘ</button>;

  // Info popup overlay
  const InfoModal=({title,text,onClose})=><div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,.7)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}><div style={{...Y.card,maxWidth:360,padding:'20px 18px',border:'1px solid rgba(170,140,80,.2)'}} onClick={e=>e.stopPropagation()}><div style={{...Y.xl,color:'#b0a088',marginBottom:8}}>{title}</div><p style={Y.bd}>{text}</p><button style={{...Y.syncBtn,marginTop:16,fontSize:9,padding:'8px 12px'}} onClick={onClose}>Close</button></div></div>;

  const SkillBar=({k,score,onClick})=>{
    const avg=bld?.avg||0;
    const diff=score-avg;
    return<div style={{marginBottom:14,cursor:onClick?'pointer':undefined}} onClick={onClick}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'center'}}>
        <span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {Math.abs(diff)>3&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:diff>0?'#50a060':'#c04040'}}>{diff>0?'▲':'▼'} {diff>0?'above':'below'} avg</span>}
          <span style={Y.mg}>{Math.round(score*10)/10}</span>
        </div>
      </div>
      <div style={Y.bt}><div style={{height:'100%',width:score+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`,transition:'width 1s ease'}}/></div>
    </div>;
  };

  // ===== BUILD SCREEN =====
  const BuildScreen=()=>!hasBuild?(
    <div style={{textAlign:'center',paddingTop:40}}>
      <h1 style={{fontFamily:"'Cinzel',serif",fontSize:24,color:'#e8c050',letterSpacing:4}}>SOLESTRIDE</h1>
      <p style={{color:'#685e4e',margin:'8px 0 24px'}}>Welcome, {data.user?.strava_firstname}.</p>
      <Card glow style={{textAlign:'center',padding:'24px 16px'}}>
        <p style={{...Y.bd,marginBottom:16}}>Import your full Strava run history.</p>
        {syncing?<p style={{color:'#685e4e',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{syncMsg}</p>:<button style={{...Y.syncBtn,background:'linear-gradient(135deg,#fc4c02,#e84400)',color:'#fff',fontSize:14,fontFamily:"'DM Sans',sans-serif"}} onClick={doSync}>Sync with Strava</button>}
      </Card>
    </div>
  ):(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><div style={Y.sl}>Active Build</div><div style={{display:'flex',alignItems:'baseline',flexWrap:'wrap'}}><h1 style={Y.bn}>{bld.fullName}</h1><span style={Y.tg}>{bld.modifier}</span></div><p style={Y.tl}>{bld.tierName} tier · {bld.archetypeName} archetype</p></div>
      </div>

      {/* Radar as hero visual */}
      <div style={{display:'flex',justifyContent:'center',margin:'20px 0 16px'}}><Radar skills={sk} size={260}/></div>

      {/* Identity blurb */}
      <Card glow><p style={Y.bd}>{bld.profile?.identity||bld.description}</p></Card>

      {/* How you run */}
      {bld.profile?.howYouRun&&<Card><div style={Y.xl}>How You Run</div><p style={{...Y.bd,marginTop:6}}>{bld.profile.howYouRun}</p></Card>}

      {/* Strengths */}
      {bld.profile?.strengths&&<Card><div style={Y.xl}>Your Strengths</div><p style={{...Y.bd,marginTop:6}}>{bld.profile.strengths}</p></Card>}

      {/* Watch for */}
      {bld.profile?.watchFor&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>Watch For</div><p style={{...Y.bd,marginTop:6}}>{bld.profile.watchFor}</p></Card>}

      {/* Level up tip */}
      {bld.levelUpTip&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>What Would Level You Up</div><p style={{...Y.bd,marginTop:6}}>{bld.levelUpTip}</p></Card>}

      <Divider text="Skills"/>
      {SK.map(k=><SkillBar key={k} k={k} score={sk[k]?.score||0} onClick={()=>{setDetail(k);setTab('detail')}}/>)}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
        <Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{data.activityCount}</div><div style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Runs scored</div></Card>
        <Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{bld.avg}</div><div style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Avg score</div></Card>
      </div>

      <button style={Y.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    </div>
  );

  // ===== SKILLS SCREEN =====
  const SkillsScreen=()=><div>
    <div style={Y.sl}>Character Sheet</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Skill Profile</h1>
    <Card style={{marginBottom:16}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>All skills scored 0–100 against universal human performance ceilings. No age or gender adjustment. Scores above 70 require genuinely competitive ability. 90+ is elite. Tap any skill for full methodology and breakdown.</p></Card>
    <Radar skills={sk} size={260}/>
    <Divider text="All Skills"/>
    {SK.map(k=><Card key={k} style={{cursor:'pointer'}} onClick={()=>{setDetail(k);setTab('detail')}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
        <div style={{flex:1}}><span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><p style={{fontSize:11,color:'#685e4e',marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{SKILL_META[k].s}</p></div>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:300,color:'#e8c050'}}>{Math.round(sk[k]?.score||0)}</span>
      </div>
      <div style={{...Y.bt,height:5}}><div style={{height:'100%',width:(sk[k]?.score||0)+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`}}/></div>
    </Card>)}
  </div>;

  // ===== SKILL DETAIL SCREEN =====
  const DetailScreen=()=>{
    const k=detail,m=SKILL_META[k],s=sk[k]?.score||0,d=sk[k]?.detail||{};
    const metricKeys=Object.keys(d).filter(key=>key!=='reason'&&key!=='requires_hr'&&key!=='requires_sensor');
    return<div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <button style={{background:'none',border:'none',color:'#685e4e',fontSize:20,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif"}} onClick={()=>setTab('skills')}>←</button>
        <span style={{fontSize:23,fontWeight:500}}>{m.i} {m.n}</span>
      </div>

      {/* Current rating */}
      <Card glow>
        <div style={Y.xl}>Current Rating</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:44,fontWeight:300,color:'#e8c050',marginTop:4}}>{s.toFixed?s.toFixed(1):s}<span style={{fontSize:16,color:'#685e4e'}}> / 100</span></div>
        <div style={{...Y.bt,height:8,margin:'12px 0'}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${m.c}44,${m.c})`}}/></div>
      </Card>

      {/* Methodology */}
      <Card>
        <div style={{...Y.xl,marginBottom:8}}>How This Skill Is Calculated</div>
        <p style={Y.bd}>{m.method}</p>
      </Card>

      {/* What 100 looks like */}
      <Card>
        <div style={{...Y.xl,marginBottom:8}}>What 100 Looks Like</div>
        <p style={Y.bd}>{m.ceiling}</p>
      </Card>

      {/* Detail metrics with explanations */}
      {metricKeys.length>0&&<>
        <Divider text="Your Numbers"/>
        {metricKeys.map(key=>{
          const metricMeta=m.metrics?.[key];
          const val=d[key];
          const label=metricMeta?.label||key.replace(/_/g,' ');
          const explain=metricMeta?.ex;
          return<Card key={key}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:explain?6:0}}>
              <span style={{...Y.bd,flex:1,textTransform:'none'}}>{label}</span>
              <span style={{...Y.mg,fontSize:14}}>{typeof val==='number'?Math.round(val*100)/100:val}</span>
            </div>
            {explain&&<p style={Y.se}>{explain}</p>}
          </Card>;
        })}
      </>}

      {/* Improvement tips */}
      <Card accent>
        <div style={{...Y.xl,color:'#e8c050',marginBottom:6}}>How to Improve This Skill</div>
        <p style={Y.bd}>{m.tips}</p>
      </Card>
    </div>;
  };

  // ===== CODEX SCREEN =====
  const CodexScreen=()=>{
    const tabs=[['a','Archetypes'],['t','Tiers'],['m','Modifiers']];
    return<div>
      <div style={Y.sl}>Codex</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build Encyclopedia</h1>
      <Card style={{marginBottom:14}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>25 archetypes × 7 tiers × 7 modifiers = <strong style={{color:'#e8c050'}}>1,225 unique builds</strong>. Your build is determined by which skills dominate your profile (archetype), your overall power level (tier), and your training behavior (modifier). Same data always produces the same build.</p></Card>
      <div style={{display:'flex',gap:3,marginBottom:16}}>{tabs.map(([id,label])=><button key={id} onClick={()=>{setCxTab(id);setCxSel(null)}} style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:cxTab===id?'#e8c050':'#685e4e',background:cxTab===id?'rgba(232,192,80,.1)':'rgba(60,48,30,.3)',border:'1px solid '+(cxTab===id?'rgba(232,192,80,.12)':'rgba(100,80,50,.08)'),borderRadius:2,padding:'9px 14px',cursor:'pointer',flex:1,textAlign:'center',textTransform:'uppercase',letterSpacing:1.5}}>{label}</button>)}</div>

      {/* Archetypes tab */}
      {cxTab==='a'&&!cxSel&&<div>{['Single','Dual','Shape'].map(cat=><div key={cat} style={{marginBottom:20}}><div style={{...Y.xl,marginBottom:10,color:'#b0a088'}}>{cat}-{cat==='Shape'?'Based':'Dominant'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{ARCHETYPES.filter(a=>a.cat===cat).map(a=><div key={a.id} onClick={()=>setCxSel(a.id)} style={{cursor:'pointer',textAlign:'center',borderRadius:3,background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',padding:'14px 6px 10px'}}><div style={{fontSize:28,marginBottom:6}}>{a.pr.includes('Velocity')?'⚡':a.pr.includes('Endurance')?'🛤':a.pr.includes('Ascent')?'⛰':a.pr.includes('Stamina')?'♥':a.pr.includes('Cadence')?'👟':a.pr.includes('Fortitude')?'📅':a.pr.includes('Resilience')?'🔁':a.pr.includes('Ranging')?'🧭':a.pr.includes('Balanced')?'⊕':'◇'}</div><p style={{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:1}}>{a.n}</p></div>)}</div></div>)}</div>}

      {/* Archetype detail */}
      {cxTab==='a'&&cxSel&&(()=>{const a=ARCHETYPES.find(x=>x.id===cxSel);return<div>
        <button style={{background:'none',border:'none',color:'#685e4e',fontSize:18,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif",marginBottom:14}} onClick={()=>setCxSel(null)}>← Back</button>
        <h2 style={{...Y.bn,textAlign:'center',marginBottom:6}}>{a.n}</h2>
        <p style={{...Y.tl,textAlign:'center',marginBottom:14}}>{a.cat}-{a.cat==='Shape'?'Based':'Dominant'} · Primary: {a.pr}</p>
        <Card glow><p style={Y.bd}>{a.d}</p></Card>
        <Card><div style={{...Y.xl,marginBottom:6}}>At Each Tier</div>{TIERS.map(t=><div key={t.n} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(170,140,80,.04)'}}><span style={Y.bd}>{t.n} {a.n}</span><span style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>{t.r} avg</span></div>)}</Card>
      </div>})()}

      {/* Tiers tab */}
      {cxTab==='t'&&<div>{TIERS.map((t,i)=><Card key={t.n} style={{borderLeft:`2px solid rgba(232,192,80,${(.04+i*.06).toFixed(2)})`}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><h3 style={{fontSize:16,fontWeight:500}}>{t.n}</h3><span style={Y.mg}>{t.r} avg</span></div>
        <p style={Y.bd}>{t.d}</p>
        <p style={{...Y.se,marginTop:8}}>{t.how}</p>
      </Card>)}<Card><p style={Y.bd}>Your tier is determined by the simple average of all 8 skill scores. Skills reading 0 because you lack sensor data (e.g., no heart rate monitor) still count as 0. To move up, you can either raise your strongest skills higher or fill in your weakest gaps — the math doesn't care which.</p></Card></div>}

      {/* Modifiers tab */}
      {cxTab==='m'&&<div>{MODS.map(m=><Card key={m.n} style={{borderLeft:'2px solid rgba(170,140,80,.08)'}}>
        <h3 style={{fontSize:16,fontWeight:500,marginBottom:4}}>{m.n}</h3>
        <p style={Y.bd}>{m.d}</p>
        <p style={{...Y.se,marginTop:8}}>{m.how}</p>
      </Card>)}<Card><p style={Y.bd}>Modifiers describe your training behavior pattern — not your raw ability. They're evaluated independently of your archetype and tier, based on consistency metrics, score trends, history length, and gap patterns. Two runners with the same archetype and tier but different training behavior will have different modifiers.</p></Card></div>}
    </div>};

  // ===== SETTINGS SCREEN =====
  const SettingsScreen=()=><div>
    <div style={Y.sl}>Settings</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Preferences</h1>
    <Card><div style={Y.xl}>Connected Account</div><p style={{fontSize:16,fontWeight:500,marginTop:4}}>{data.user?.strava_firstname} {data.user?.strava_lastname}</p><p style={{color:'#685e4e',fontSize:10,marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>Connected via Strava · {data.activityCount} runs scored</p></Card>
    <button style={Y.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    <div style={{textAlign:'center',marginTop:24}}><p style={{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'rgba(100,90,70,.4)'}}>Solestride v1.0</p><p style={{color:'rgba(100,90,70,.3)',fontSize:10,marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>No maps · No social · No tracking</p></div>
  </div>;

  const screens={build:BuildScreen,skills:SkillsScreen,detail:DetailScreen,codex:CodexScreen,settings:SettingsScreen};
  const Screen=screens[tab]||BuildScreen;
  const navItems=[['build','⚔','Build'],['skills','✦','Skills'],['codex','📖','Codex'],['settings','⚙','Settings']];

  return(<div style={Y.page}>
    <div style={Y.scr}><Screen/></div>
    <div style={Y.nav}>{navItems.map(([id,icon,label])=><button key={id} onClick={()=>setTab(id)} style={{...Y.nb,...(tab===id||tab==='detail'&&id==='skills'?Y.nba:{})}}><span style={{fontSize:16}}>{icon}</span><span style={Y.nl}>{label}</span></button>)}</div>
    {infoPopup&&<InfoModal title={infoPopup.title} text={infoPopup.text} onClose={()=>setInfoPopup(null)}/>}
  </div>);
}
