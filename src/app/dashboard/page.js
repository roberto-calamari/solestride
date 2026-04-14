'use client';
import { useState, useEffect, useCallback } from 'react';

// ===== SKILL META WITH FULL EXPLANATIONS =====
const SKILL_META = {
  velocity:{n:'Velocity',i:'⚡',c:'#f0c868',s:'Raw speed vs world standards',
    method:'Your speed is measured by converting each run to a World Athletics (WA) score — the same system used to compare performances across different distances at international competitions. Your best 5 runs within the scoring window are selected, weighted by recency (recent runs count more), and averaged. That average is scored against the theoretical world-record ceiling of 1400 WA points.',
    ceiling:'A score of 100 would mean averaging world-record equivalent performances. A 25-minute 5K scores roughly 30. A competitive 18-minute 5K scores around 55. Sub-elite 15:30 approaches 70. Scores above 80 require national-class speed.',
    tips:'Add one tempo session per week (20-30 minutes at comfortably hard pace) and occasional race-pace intervals. Parkruns and local 5Ks are also great catalysts.',
    metrics:{
      wa_avg:{label:'World Athletics Score (Average)',ex:'Your weighted average WA score across your top recent runs. A recreational 5K in ~25 min scores around 400-500 WA points. A competitive 18:00 5K scores ~800. World records approach 1400.'},
      runs_used:{label:'Runs Contributing',ex:'How many of your runs contributed to this score. Only your top 5 most recent WA-scored runs are used, weighted so recent performances count more.'},
      top_wa:{label:'Best Single WA Score',ex:'Your highest WA score from any single run. This represents your peak speed performance.'},
    }},
  endurance:{n:'Endurance',i:'🛤',c:'#68a878',s:'Distance capacity & pace holding',
    method:'Endurance combines three factors: your longest single run (35% weight), the average of your 3 longest runs (35%), and your monthly volume (30%). Each is compared against ceilings representing very high human capacity.',
    ceiling:'A score of 100 requires a 50km+ longest run, 35km+ average top 3, and 400km+ monthly volume. A 21km long run with 140km/month scores roughly 50-60. Regular 10km runs land around 25-40.',
    tips:'Extend your weekly long run by 10% every 2-3 weeks. Adding one extra easy run per week also builds monthly volume.',
    metrics:{
      longest_km:{label:'Longest Single Run (km)',ex:'The distance of your longest run. Compared against a ceiling of 50km.'},
      avg_top3:{label:'Average of Top 3 Runs (km)',ex:'The average distance of your 3 longest runs — more indicative than a single outlier.'},
      monthly_vol:{label:'Monthly Volume (km)',ex:'Your total distance divided by months in your scoring window. Compared against 400km/month.'},
    }},
  ascent:{n:'Ascent',i:'⛰',c:'#a08060',s:'Climbing power',
    method:'Ascent measures three dimensions: your top climbing rate in meters per km (40% weight), total accumulated elevation gain (30%), and frequency of hilly runs (30%).',
    ceiling:'100 requires averaging 80m/km on your hilliest runs, 5000m+ total climbing, and 70%+ hilly runs. Mountain and trail runners score highest.',
    tips:'Seek out hillier routes or add dedicated hill repeats. Even one hilly route per week significantly boosts your scores.',
    metrics:{
      top_rate:{label:'Top Climbing Rate (m/km)',ex:'Average elevation gain per km across your 3 hilliest runs. Flat = 0-3, rolling = 5-10, hilly = 10-25, mountain = 25+. Compared against 80.'},
      total_climb:{label:'Total Elevation Gained (m)',ex:'Sum of all elevation gain in your window. Compared against 5,000m.'},
      hill_pct:{label:'Hilly Run Frequency (%)',ex:'Percentage of runs qualifying as genuinely hilly (8+ m/km elevation rate).'},
    }},
  stamina:{n:'Stamina',i:'♥',c:'#d06050',s:'Cardiac efficiency (needs HR)',
    method:'Stamina measures pace-to-heart-rate efficiency. It uses your Efficiency Factor (65% weight) and lowest easy-run heart rate (35%). Requires a heart rate monitor.',
    ceiling:'100 requires Efficiency Factor above 2.2 and easy-run HR around 100 bpm. An EF of 1.4-1.6 with easy HR ~140 is typical (score ~40-55).',
    tips:'Run truly easy (conversational pace) 80% of the time. Cardiac efficiency takes months to improve — patience is key.',
    metrics:{
      top_ef:{label:'Efficiency Factor (Top 5 Avg)',ex:'Pace ÷ heart rate, averaged across your 5 best. Higher = more speed per heartbeat. 1.0-1.2 beginner, 1.3-1.5 recreational, 1.5-1.8 serious, 1.8+ elite.'},
      easy_hr:{label:'Easiest Run Heart Rate (bpm)',ex:'Your lowest average HR from an easy run. Lower = more aerobic fitness.'},
      hr_runs:{label:'Runs With HR Data',ex:'How many runs had heart rate data. More data = more reliable score.'},
    }},
  cadence:{n:'Cadence',i:'👟',c:'#9878b0',s:'Stride mechanics (needs sensor)',
    method:'Cadence measures how close your average is to the biomechanically optimal ~182 spm (60% weight) and how consistent it is across runs (40%). Requires cadence-capable device.',
    ceiling:'100 requires averaging 180-184 spm with extremely low run-to-run variance. Most recreational runners average 160-170 spm, scoring 30-50.',
    tips:'Try running to a metronome app at 5 spm above your current average. Shorter, quicker strides reduce impact and improve efficiency.',
    metrics:{
      avg_cadence:{label:'Average Cadence (steps/min)',ex:'Your mean cadence across runs with data. Sweet spot is 180-185 spm. Below 160 is typically overstriding. Score penalizes distance from 182.'},
      cadence_runs:{label:'Runs With Cadence Data',ex:'How many runs had cadence recorded. More data = more reliable score. Ensure your watch or footpod records cadence consistently.'},
    }},
  fortitude:{n:'Fortitude',i:'📅',c:'#7090a8',s:'Consistency & discipline',
    method:'Fortitude measures discipline over the last 90 days: runs per week (30%), percentage of active weeks (35%), and weekly distance stability (35% — lower variance = higher score).',
    ceiling:'100 requires 7 runs/week, 100% active weeks, and near-zero variance. Running 4x/week with good consistency scores ~55-65.',
    tips:'Frequency matters more than intensity. Adding even a short 20-minute easy run on an off day boosts your numbers significantly.',
    metrics:{
      runs_per_week:{label:'Runs Per Week (Average)',ex:'Your average runs/week over 90 days. Compared against 7/week.'},
      active_weeks_pct:{label:'Active Weeks (%)',ex:'Percentage of weeks with at least one run. Missing a full week drops this fast.'},
      volume_cv:{label:'Weekly Volume Consistency',ex:'How much your weekly km fluctuates (coefficient of variation). Lower = more consistent. Under 0.2 is very consistent; over 0.5 is erratic.'},
    }},
  resilience:{n:'Resilience',i:'🔁',c:'#c09050',s:'Recovery & fatigue resistance',
    method:'Resilience combines pace degradation on consecutive-day runs (50%) with overall pace variance (50%). Less degradation and less variance = higher score.',
    ceiling:'100 requires zero pace drop on back-to-back days and extremely low variance. Most runners see 3-8% pace drop, scoring 40-60.',
    tips:'Build back-to-back tolerance gradually. Run easy the day after hard sessions. Sleep, nutrition, and hydration matter as much as training.',
    metrics:{
      b2b_drop:{label:'Back-to-Back Pace Change',ex:'How much pace degrades on consecutive days. 0.05 = 5% slower. Negative = you ran faster (very unusual, strong recovery sign).'},
      pace_cv:{label:'Overall Pace Variance',ex:'How much pace varies across all runs. Under 0.05 very consistent; over 0.10 wide swings.'},
      b2b_pairs:{label:'Back-to-Back Run Pairs',ex:'Times you ran on consecutive days. More pairs = more data. Low count may mean score is unreliable.'},
    }},
  ranging:{n:'Ranging',i:'🧭',c:'#58a0a8',s:'Route diversity & exploration',
    method:'Ranging combines unique start locations (30%), route novelty vs total runs (30%), distance variety (20%), and terrain type diversity (20%).',
    ceiling:'100 requires 15+ locations, 70%+ unique routes, 6+ distance brackets, and all terrain types. Same loop every day scores near 0 for novelty.',
    tips:'Run from a different starting point once a week. Vary distances. Seek one new route per week. Small variations count.',
    metrics:{
      locations:{label:'Unique Starting Locations',ex:'Distinct start areas (~1km grid). Running from home = 1. Different parks/neighborhoods increases this. Compared against 15.'},
      unique_routes:{label:'Unique Routes',ex:'Distinct routes by GPS path. Shown as count — compared as a ratio vs total runs (e.g., 11/20 = 55% novelty).'},
      dist_buckets:{label:'Distance Variety',ex:'Distinct distance brackets (3km increments). Only 5km runs = 1 bucket. Mix 3/5/10/15km = 4 buckets. Compared against 6.'},
      terrain_types:{label:'Terrain Types',ex:'Categories covered: flat (0-3 m/km), rolling (3-10), hilly (10-25), mountain (25+). Only flat roads = 1. Compared against 3.'},
    }},
};
const SK = Object.keys(SKILL_META);

// ===== ARCHETYPE DATA WITH UNIQUE EMOJIS =====
const ARCH_EMOJI = {
  speed_demon:'⚡',long_hauler:'🛤',hill_grinder:'⛰',cardiac_king:'♥',metronome:'⏱',the_grinder:'🔨',rubber_band:'🔄',pathfinder:'🧭',
  tempo_hound:'🎯',weekend_warrior:'⚔',volume_junkie:'📈',trail_rat:'🌲',the_commuter:'🚏',track_rat:'🏁',mountain_goat:'🐐',iron_lung:'💨',clockwork:'⚙',comeback_kid:'💪',disciplined_racer:'🏅',terrain_mixer:'🎲',base_builder:'🧱',
  all_rounder:'⊕',the_specialist:'💎',raw_talent:'✨',workhorse:'🐴',
};
const ARCHETYPES = [
{id:'speed_demon',n:'Speed Demon',pr:'Velocity',d:'Pure speed above all else.',cat:'Single'},
{id:'long_hauler',n:'Long Hauler',pr:'Endurance',d:'Eats miles for breakfast.',cat:'Single'},
{id:'hill_grinder',n:'Hill Grinder',pr:'Ascent',d:'The steeper the better.',cat:'Single'},
{id:'cardiac_king',n:'Cardiac King',pr:'Stamina',d:'Supreme aerobic engine.',cat:'Single'},
{id:'metronome',n:'Metronome',pr:'Cadence',d:'Every step calibrated.',cat:'Single'},
{id:'the_grinder',n:'The Grinder',pr:'Fortitude',d:'Never misses a day.',cat:'Single'},
{id:'rubber_band',n:'Rubber Band',pr:'Resilience',d:'Rebounds from fatigue fast.',cat:'Single'},
{id:'pathfinder',n:'Pathfinder',pr:'Ranging',d:'Always a new route.',cat:'Single'},
{id:'tempo_hound',n:'Tempo Hound',pr:'Velocity + Stamina',d:'Fast AND efficient.',cat:'Dual'},
{id:'weekend_warrior',n:'Weekend Warrior',pr:'Velocity + Endurance',d:'When you show up, you go hard.',cat:'Dual'},
{id:'volume_junkie',n:'Volume Junkie',pr:'Endurance + Fortitude',d:'High mileage, high consistency.',cat:'Dual'},
{id:'trail_rat',n:'Trail Rat',pr:'Ranging + Ascent',d:'Off-road explorer.',cat:'Dual'},
{id:'the_commuter',n:'The Commuter',pr:'Fortitude + Ranging',d:'Runs everywhere, every day.',cat:'Dual'},
{id:'track_rat',n:'Track Rat',pr:'Velocity + Cadence',d:'Fast with sharp form.',cat:'Dual'},
{id:'mountain_goat',n:'Mountain Goat',pr:'Ascent + Endurance',d:'Long mountain runs.',cat:'Dual'},
{id:'iron_lung',n:'Iron Lung',pr:'Stamina + Endurance',d:'Low HR, big distance.',cat:'Dual'},
{id:'clockwork',n:'Clockwork',pr:'Cadence + Fortitude',d:'Precise AND consistent.',cat:'Dual'},
{id:'comeback_kid',n:'Comeback Kid',pr:'Resilience + Fortitude',d:'Trains through anything.',cat:'Dual'},
{id:'disciplined_racer',n:'Disciplined Racer',pr:'Velocity + Fortitude',d:'Fast AND disciplined.',cat:'Dual'},
{id:'terrain_mixer',n:'Terrain Mixer',pr:'Ranging + Resilience',d:'Variety stays fresh.',cat:'Dual'},
{id:'base_builder',n:'Base Builder',pr:'Stamina + Fortitude',d:'Patient aerobic development.',cat:'Dual'},
{id:'all_rounder',n:'All-Rounder',pr:'Balanced',d:'No weakness anywhere.',cat:'Shape'},
{id:'the_specialist',n:'The Specialist',pr:'One extreme skill',d:'One skill towers above.',cat:'Shape'},
{id:'raw_talent',n:'Raw Talent',pr:'High peak, low floor',d:'Fast but inconsistent.',cat:'Shape'},
{id:'workhorse',n:'Workhorse',pr:'High grit, modest speed',d:'Not the fastest, but always there.',cat:'Shape'},
];
const TIERS=[{n:'Beginner',r:'0–10',d:'Just starting.',how:'Average of all 8 skills falls between 0 and 10. Skills reading 0 (missing sensor data) still count as 0.'},{n:'Developing',r:'10–22',d:'Building habits.',how:'Average between 10 and 22. A few skills developing while others remain low.'},{n:'Solid',r:'22–36',d:'Consistent with real history.',how:'Average 22–36. Running regularly for months with meaningful data across most skills.'},{n:'Strong',r:'36–50',d:'Serious dedicated training.',how:'Average 36–50. Multiple skills in the 40-60 range.'},{n:'Competitive',r:'50–65',d:'Racing-ready. Club level.',how:'Average 50–65. Stronger than the large majority of runners across the board.'},{n:'Elite',r:'65–82',d:'Exceptional.',how:'Average 65–82. Years of dedicated, structured training with strong performance nearly everywhere.'},{n:'World-Class',r:'82+',d:'Approaching human limits.',how:'Average above 82. Every skill near ceiling. Practically unreachable without professional-level ability.'}];
const MODS=[{n:'Consistent',d:'Steady week after week.',how:'Fortitude > 55 AND weekly volume coefficient of variation < 0.4.'},{n:'Streaky',d:'Peaks then gaps.',how:'Weekly volume CV > 0.6 — distance swings over 60% week to week.'},{n:'Improving',d:'Trending up.',how:'Recent skill scores show consistent upward movement vs earlier snapshots.'},{n:'Plateau\'d',d:'Stable. Needs a shift.',how:'Scores in a narrow band for an extended period without meaningful change.'},{n:'Comeback',d:'Reversing regression.',how:'Scores rising after a period of decline — returning from a training break.'},{n:'Fresh',d:'Under 20 scored runs.',how:'Fewer than 20 runs scored. Limited data for other modifiers.'},{n:'Veteran',d:'Hundreds of runs.',how:'200+ scored runs AND fortitude > 55 — deep history with maintained consistency.'}];

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
  active:{borderLeft:'2px solid rgba(232,192,80,.3)'},
  sl:{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:4,marginBottom:5},
  bn:{fontSize:26,fontWeight:600,fontFamily:"'Cormorant Garamond',serif"},
  bns:{fontSize:16,fontWeight:500,fontFamily:"'Cormorant Garamond',serif"},
  tg:{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#e8c050',background:'rgba(232,192,80,.1)',padding:'3px 10px',borderRadius:2,textTransform:'uppercase',letterSpacing:2,border:'1px solid rgba(232,192,80,.12)',marginLeft:8},
  tgs:{fontFamily:"'Cinzel',serif",fontSize:7,fontWeight:500,color:'#685e4e',background:'rgba(170,140,80,.05)',padding:'2px 7px',borderRadius:2,textTransform:'uppercase',letterSpacing:1.5},
  tl:{fontSize:14,color:'#685e4e',fontStyle:'italic',marginTop:5},
  bd:{fontSize:13.5,lineHeight:1.7,color:'#b0a088',fontFamily:"'DM Sans',sans-serif"},
  xl:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:1.5},
  dv:{display:'flex',alignItems:'center',gap:14,margin:'28px 0 16px'},
  dvl:{flex:1,height:1,background:'linear-gradient(to right,transparent,rgba(170,140,80,.1),transparent)'},
  dvt:{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:5},
  sml:{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:2},
  mg:{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'#e8c050'},
  mxl:{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:300,color:'#e8c050'},
  bt:{height:5,background:'rgba(60,48,30,.6)',borderRadius:1,marginTop:4,border:'1px solid rgba(100,80,50,.12)',overflow:'hidden'},
  mt:{fontSize:10,lineHeight:1.3,color:'#685e4e',fontFamily:"'DM Sans',sans-serif"},
  nw:{fontFamily:"'Cinzel',serif",fontSize:7,fontWeight:600,color:'#e8c050',background:'rgba(232,192,80,.1)',padding:'2px 7px',borderRadius:2,letterSpacing:2},
  nav:{position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:'rgba(14,11,8,.96)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(170,140,80,.05)',display:'flex',justifyContent:'space-around',padding:'7px 0 max(10px,env(safe-area-inset-bottom))',maxWidth:430,margin:'0 auto'},
  nb:{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 14px',border:'none',background:'none',cursor:'pointer',color:'#685e4e',transition:'color .2s',fontFamily:"'Cinzel',serif"},
  nba:{color:'#e8c050'},
  nl:{fontSize:7,fontWeight:600,letterSpacing:2.5,textTransform:'uppercase'},
  syncBtn:{display:'block',width:'100%',padding:'14px 24px',borderRadius:3,border:'none',cursor:'pointer',background:'rgba(232,192,80,.1)',color:'#e8c050',fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,letterSpacing:2,textTransform:'uppercase',marginTop:12},
  se:{fontSize:11,lineHeight:1.6,color:'#685e4e',marginTop:3,paddingLeft:4,borderLeft:'2px solid rgba(232,192,80,.06)',fontFamily:"'DM Sans',sans-serif"},
  bb:{background:'none',border:'none',color:'#685e4e',fontSize:20,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif",padding:'4px 8px'},
};

// ===== MAIN COMPONENT =====
export default function Dashboard(){
  const[data,setData]=useState(null);
  const[tab,setTab]=useState('home');
  const[detail,setDetail]=useState(null);
  const[cxTab,setCxTab]=useState('a');
  const[cxSel,setCxSel]=useState(null);
  const[histSel,setHistSel]=useState(null);
  const[syncing,setSyncing]=useState(false);
  const[syncMsg,setSyncMsg]=useState('');

  useEffect(()=>{fetch('/api/user').then(r=>{if(r.status===401){window.location.href='/';return null}return r.json()}).then(d=>{if(d)setData(d)}).catch(()=>{})},[]);

  const doSync=useCallback(async()=>{
    setSyncing(true);setSyncMsg('Importing from Strava...');
    try{const r=await fetch('/api/sync',{method:'POST'});const d=await r.json();if(d.status==='completed'){setSyncMsg('Done! '+d.activityCount+' runs scored.');setTimeout(()=>{setSyncing(false);fetch('/api/user').then(r=>r.json()).then(setData)},1500)}else{setSyncMsg('Error: '+(d.error||'Unknown'));setTimeout(()=>setSyncing(false),3000)}}catch(e){setSyncMsg('Error: '+e.message);setTimeout(()=>setSyncing(false),3000)}
  },[]);

  if(!data)return<div style={Y.page}><div style={{...Y.scr,textAlign:'center',paddingTop:100}}><p style={{color:'#685e4e'}}>Loading...</p></div></div>;

  const sk=data.currentSkills||{};
  const bld=data.currentBuild;
  const hasBuild=bld&&Object.keys(sk).length>0;
  const trends=data.trends||null;
  const history=(data.buildHistory||[]).slice().reverse(); // newest first

  // Helpers
  const Divider=({text})=><div style={Y.dv}><div style={Y.dvl}/><span style={Y.dvt}>{text}</span><div style={Y.dvl}/></div>;
  const Card=({children,glow,accent,active:isActive,style,onClick})=><div style={{...Y.card,...(glow?Y.glow:{}),...(accent?Y.accent:{}),...(isActive?Y.active:{}),position:'relative',...style}} onClick={onClick}><div style={Y.cardInner}/>{children}</div>;

  const SkillBar=({k,score,onClick,showVsAvg})=>{
    const avg=bld?.avg||0;
    const diff=score-avg;
    const trend=trends?.[k];
    return<div style={{marginBottom:14,cursor:onClick?'pointer':undefined}} onClick={onClick}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'center'}}>
        <span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {showVsAvg&&Math.abs(diff)>3&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:diff>0?'#50a060':'#c04040'}}>{diff>0?'▲':'▼'} {diff>0?'above':'below'} avg</span>}
          {!showVsAvg&&trend&&Math.abs(trend.delta)>0.5&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:trend.delta>0?'#50a060':'#c04040'}}>{trend.delta>0?'▲':'▼'} {Math.abs(trend.delta).toFixed(1)}</span>}
          <span style={Y.mg}>{Math.round(score*10)/10}</span>
        </div>
      </div>
      <div style={Y.bt}><div style={{height:'100%',width:score+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`,transition:'width 1s ease'}}/></div>
    </div>;
  };

  // Profile section (reusable for home, codex, history)
  const ProfileCards=({profile,levelUpTip})=><>
    {profile?.identity&&<Card glow><p style={Y.bd}>{profile.identity}</p></Card>}
    {profile?.howYouRun&&<Card><div style={Y.xl}>How You Run</div><p style={{...Y.bd,marginTop:6}}>{profile.howYouRun}</p></Card>}
    {profile?.strengths&&<Card><div style={Y.xl}>Your Strengths</div><p style={{...Y.bd,marginTop:6}}>{profile.strengths}</p></Card>}
    {profile?.watchFor&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>Watch For</div><p style={{...Y.bd,marginTop:6}}>{profile.watchFor}</p></Card>}
    {levelUpTip&&<Card accent><div style={{...Y.xl,color:'#e8c050'}}>What Would Level You Up</div><p style={{...Y.bd,marginTop:6}}>{levelUpTip}</p></Card>}
  </>;

  // ===== HOME SCREEN =====
  const HomeScreen=()=>!hasBuild?(
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
      <div><div style={Y.sl}>Active Build</div><div style={{display:'flex',alignItems:'baseline',flexWrap:'wrap'}}><h1 style={Y.bn}>{bld.fullName}</h1><span style={Y.tg}>{bld.modifier}</span></div><p style={Y.tl}>{bld.tierName} tier · {bld.archetypeName} archetype</p></div>
      <div style={{display:'flex',justifyContent:'center',margin:'20px 0 16px'}}><Radar skills={sk} size={260}/></div>
      <ProfileCards profile={bld.profile} levelUpTip={bld.levelUpTip}/>
      <Divider text="Skills"/>
      {SK.map(k=><SkillBar key={k} k={k} score={sk[k]?.score||0} showVsAvg onClick={()=>{setDetail(k);setTab('detail')}}/>)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
        <Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{data.activityCount}</div><div style={Y.mt}>Runs scored</div></Card>
        <Card style={{textAlign:'center',padding:'10px 8px'}}><div style={Y.mg}>{bld.avg}</div><div style={Y.mt}>Avg score</div></Card>
      </div>
      <button style={Y.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    </div>
  );

  // ===== SKILLS SCREEN =====
  const SkillsScreen=()=><div>
    <div style={Y.sl}>Character Sheet</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Skill Profile</h1>
    <Card style={{marginBottom:16}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>All skills scored 0–100 against universal human ceilings. No age or gender adjustment. {trends?'Trends show 30-day change.':'Sync again in the future to see trends.'} Tap any skill for full breakdown.</p></Card>
    <Radar skills={sk} size={260}/>
    <Divider text="All Skills"/>
    {SK.map(k=>{
      const s=sk[k]?.score||0;
      const trend=trends?.[k];
      return<Card key={k} style={{cursor:'pointer'}} onClick={()=>{setDetail(k);setTab('detail')}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
          <div style={{flex:1}}><span style={Y.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><p style={{fontSize:11,color:'#685e4e',marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{SKILL_META[k].s}</p></div>
          <div style={{textAlign:'right'}}>
            <span style={Y.mxl}>{Math.round(s)}</span>
            {trend&&Math.abs(trend.delta)>0.5&&<div style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",color:trend.delta>0?'#50a060':'#c04040',marginTop:2}}>{trend.delta>0?'▲':'▼'} {Math.abs(trend.delta).toFixed(1)} in 30d</div>}
          </div>
        </div>
        <div style={{...Y.bt,height:5}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`}}/></div>
      </Card>;
    })}
  </div>;

  // ===== SKILL DETAIL =====
  const DetailScreen=()=>{
    const k=detail,m=SKILL_META[k],s=sk[k]?.score||0,d=sk[k]?.detail||{};
    const metricKeys=Object.keys(d).filter(key=>key!=='reason'&&key!=='requires_hr'&&key!=='requires_sensor');
    const trend=trends?.[k];
    return<div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><button style={Y.bb} onClick={()=>setTab('skills')}>←</button><span style={{fontSize:23,fontWeight:500}}>{m.i} {m.n}</span></div>
      <Card glow>
        <div style={Y.xl}>Current Rating</div>
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:44,fontWeight:300,color:'#e8c050',marginTop:4}}>{s.toFixed?s.toFixed(1):s}<span style={{fontSize:16,color:'#685e4e'}}> / 100</span></div>
          {trend&&Math.abs(trend.delta)>0.5&&<span style={{fontSize:12,fontFamily:"'DM Sans',sans-serif",color:trend.delta>0?'#50a060':'#c04040'}}>{trend.delta>0?'▲':'▼'} {Math.abs(trend.delta).toFixed(1)} in 30d</span>}
        </div>
        <div style={{...Y.bt,height:8,margin:'12px 0'}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${m.c}44,${m.c})`}}/></div>
      </Card>
      <Card><div style={{...Y.xl,marginBottom:8}}>How This Skill Is Calculated</div><p style={Y.bd}>{m.method}</p></Card>
      <Card><div style={{...Y.xl,marginBottom:8}}>What 100 Looks Like</div><p style={Y.bd}>{m.ceiling}</p></Card>
      {metricKeys.length>0&&<><Divider text="Your Numbers"/>
        {metricKeys.map(key=>{
          const meta=m.metrics?.[key];const val=d[key];
          return<Card key={key}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:meta?.ex?6:0}}>
              <span style={{...Y.bd,flex:1}}>{meta?.label||key.replace(/_/g,' ')}</span>
              <span style={{...Y.mg,fontSize:14}}>{typeof val==='number'?Math.round(val*100)/100:val}</span>
            </div>
            {meta?.ex&&<p style={Y.se}>{meta.ex}</p>}
          </Card>;
        })}</>}
      <Card accent><div style={{...Y.xl,color:'#e8c050',marginBottom:6}}>How to Improve This Skill</div><p style={Y.bd}>{m.tips}</p></Card>
    </div>;
  };

  // ===== HISTORY SCREEN =====
  const HistoryScreen=()=>{
    if(histSel!==null){
      const entry=history[histSel];
      const arch=ARCHETYPES.find(a=>a.id===entry.archetype);
      return<div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><button style={Y.bb} onClick={()=>setHistSel(null)}>←</button><span style={{fontSize:23,fontWeight:500}}>{entry.fullName}</span></div>
        <Card glow>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><span style={Y.tgs}>{entry.modifier}</span><span style={Y.mt}>{new Date(entry.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
            <span style={Y.bns}>{entry.tierName} tier · {entry.archetypeName}</span>
            <span style={Y.mg}>{entry.avg} avg</span>
          </div>
          <div style={Y.mt}>After {entry.runCount} runs</div>
        </Card>
        <ProfileCards profile={entry.profile} levelUpTip={entry.levelUpTip}/>
        {arch&&<Card><div style={{...Y.xl,marginBottom:5}}>About {arch.n}</div><p style={Y.bd}>{arch.d}</p><p style={{...Y.mt,marginTop:4}}>Primary: {arch.pr} · {arch.cat}-{arch.cat==='Shape'?'Based':'Dominant'}</p></Card>}
      </div>;
    }
    return<div>
      <div style={Y.sl}>Chronicle</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build History</h1>
      <Card style={{marginBottom:14}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>Every time your archetype, tier, or modifier changed, it's recorded here. Tap any entry to learn about that build. Only meaningful identity changes are shown.</p></Card>
      {history.length===0&&<Card><p style={Y.bd}>No build history yet. Sync with Strava to reconstruct your full timeline.</p></Card>}
      {history.map((b,i)=><Card key={i} active={i===0} style={{cursor:'pointer'}} onClick={()=>setHistSel(i)}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
          {i===0&&<span style={Y.nw}>NOW</span>}
          <span style={Y.mt}>{new Date(b.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
          <span style={Y.tgs}>{b.modifier}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontSize:28}}>{ARCH_EMOJI[b.archetype]||'◇'}</span>
          <div>
            <h3 style={Y.bns}>{b.fullName}</h3>
            <span style={Y.mt}>{b.avg} avg · {b.runCount} runs</span>
          </div>
        </div>
      </Card>)}
    </div>;
  };

  // ===== CODEX SCREEN =====
  const CodexScreen=()=>{
    const tabs=[['a','Archetypes'],['t','Tiers'],['m','Modifiers']];
    return<div>
      <div style={Y.sl}>Codex</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build Encyclopedia</h1>
      <Card style={{marginBottom:14}}><p style={{...Y.bd,color:'#685e4e',fontSize:12}}>25 archetypes × 7 tiers × 7 modifiers = <strong style={{color:'#e8c050'}}>1,225 unique builds</strong>. Same data always produces the same build.</p></Card>
      <div style={{display:'flex',gap:3,marginBottom:16}}>{tabs.map(([id,label])=><button key={id} onClick={()=>{setCxTab(id);setCxSel(null)}} style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:cxTab===id?'#e8c050':'#685e4e',background:cxTab===id?'rgba(232,192,80,.1)':'rgba(60,48,30,.3)',border:'1px solid '+(cxTab===id?'rgba(232,192,80,.12)':'rgba(100,80,50,.08)'),borderRadius:2,padding:'9px 14px',cursor:'pointer',flex:1,textAlign:'center',textTransform:'uppercase',letterSpacing:1.5}}>{label}</button>)}</div>

      {cxTab==='a'&&!cxSel&&<div>{['Single','Dual','Shape'].map(cat=><div key={cat} style={{marginBottom:20}}><div style={{...Y.xl,marginBottom:10,color:'#b0a088'}}>{cat}-{cat==='Shape'?'Based':'Dominant'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{ARCHETYPES.filter(a=>a.cat===cat).map(a=><div key={a.id} onClick={()=>setCxSel(a.id)} style={{cursor:'pointer',textAlign:'center',borderRadius:3,background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',padding:'14px 6px 10px'}}><div style={{fontSize:28,marginBottom:6}}>{ARCH_EMOJI[a.id]}</div><p style={{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#b0a088',textTransform:'uppercase',letterSpacing:1}}>{a.n}</p></div>)}</div></div>)}</div>}

      {cxTab==='a'&&cxSel&&(()=>{const a=ARCHETYPES.find(x=>x.id===cxSel);const profile=require_profile(cxSel);return<div>
        <button style={{...Y.bb,marginBottom:14}} onClick={()=>setCxSel(null)}>← Back</button>
        <div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:48,marginBottom:8}}>{ARCH_EMOJI[cxSel]}</div><h2 style={{...Y.bn,marginBottom:4}}>{a.n}</h2><p style={Y.tl}>{a.cat}-{a.cat==='Shape'?'Based':'Dominant'} · Primary: {a.pr}</p></div>
        <ProfileCards profile={profile}/>
        <Card><div style={{...Y.xl,marginBottom:6}}>At Each Tier</div>{TIERS.map(t=><div key={t.n} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(170,140,80,.04)'}}><span style={Y.bd}>{t.n} {a.n}</span><span style={Y.mt}>{t.r} avg</span></div>)}</Card>
      </div>})()}

      {cxTab==='t'&&<div>{TIERS.map((t,i)=><Card key={t.n} style={{borderLeft:`2px solid rgba(232,192,80,${(.04+i*.06).toFixed(2)})`}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><h3 style={Y.bns}>{t.n}</h3><span style={Y.mg}>{t.r} avg</span></div><p style={Y.bd}>{t.d}</p><p style={{...Y.se,marginTop:8}}>{t.how}</p></Card>)}<Card><p style={Y.bd}>Your tier is the simple average of all 8 skills. Skills at 0 (missing sensor data) still count. Raise your weakest or your strongest — the math doesn't care which.</p></Card></div>}

      {cxTab==='m'&&<div>{MODS.map(m=><Card key={m.n} style={{borderLeft:'2px solid rgba(170,140,80,.08)'}}><h3 style={{...Y.bns,marginBottom:4}}>{m.n}</h3><p style={Y.bd}>{m.d}</p><p style={{...Y.se,marginTop:8}}>{m.how}</p></Card>)}<Card><p style={Y.bd}>Modifiers describe training behavior, not ability. Evaluated independently of archetype and tier.</p></Card></div>}
    </div>};

  // ===== SETTINGS SCREEN =====
  const SettingsScreen=()=><div>
    <div style={Y.sl}>Settings</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Preferences</h1>
    <Card><div style={Y.xl}>Connected Account</div><p style={{fontSize:16,fontWeight:500,marginTop:4}}>{data.user?.strava_firstname} {data.user?.strava_lastname}</p><p style={Y.mt}>Connected via Strava · {data.activityCount} runs scored</p></Card>
    <button style={Y.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    <div style={{textAlign:'center',marginTop:24}}><p style={{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'rgba(100,90,70,.4)'}}>Solestride v1.0</p><p style={{color:'rgba(100,90,70,.3)',fontSize:10,marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>No maps · No social · No tracking</p></div>
  </div>;

  // Fetch archetype profile for codex (from builds engine data passed through API, or use local fallback)
  function require_profile(archId){ return bld?.profile && bld?.archetype===archId ? bld.profile : CODEX_PROFILES[archId] || {}; }

  const screens={home:HomeScreen,skills:SkillsScreen,detail:DetailScreen,history:HistoryScreen,codex:CodexScreen,settings:SettingsScreen};
  const Screen=screens[tab]||HomeScreen;
  const navItems=[['home','⚔','Home'],['skills','✦','Skills'],['history','◈','History'],['codex','❖','Codex'],['settings','⚙','Settings']];

  return(<div style={Y.page}>
    <div style={Y.scr}><Screen/></div>
    <div style={Y.nav}>{navItems.map(([id,icon,label])=><button key={id} onClick={()=>{if(id==='history')setHistSel(null);setTab(id)}} style={{...Y.nb,...(tab===id||(tab==='detail'&&id==='skills')?Y.nba:{})}}><span style={{fontSize:16}}>{icon}</span><span style={Y.nl}>{label}</span></button>)}</div>
  </div>);
}

// ===== CODEX ARCHETYPE PROFILES (local fallback for when viewing other archetypes) =====
const CODEX_PROFILES={
speed_demon:{identity:"You live for the feeling of legs turning over fast and ground disappearing beneath you. Speed is your language — you don't just run, you attack distance.",howYouRun:"Your best runs are the fast ones. You gravitate toward shorter, sharper efforts and feel most alive when the pace drops below what most consider comfortable.",strengths:"Raw velocity across distances. Your WA scores are your calling card.",watchFor:"Speed without endurance base can plateau. Don't neglect the slow miles."},
long_hauler:{identity:"Distance is your natural habitat. While others calculate pace, you calculate how far you can go. You genuinely enjoy the deep meditative state that comes after the first hour.",howYouRun:"You favor longer efforts. Your training log shows runs that intimidate most people by distance alone. You hold pace remarkably well over long efforts.",strengths:"Endurance capacity and pace sustainability over distance.",watchFor:"Long slow miles alone won't develop top-end speed. Add structured speed work once a week."},
hill_grinder:{identity:"Flat courses bore you. You come alive when the road tilts upward and the field thins out. Hills are where you do your best work.",howYouRun:"Your route choices tell the story: you seek elevation. Your climbing rate and total ascent stand out because you hunt hills.",strengths:"Climbing power, elevation gain rate, comfort on sustained grades.",watchFor:"Hill strength without flat speed can limit race performance. Mix in flat tempo work."},
cardiac_king:{identity:"You're the efficiency machine. Where others burn matches, you run on a slow, steady flame. Your heart rate data shows a finely tuned aerobic engine.",howYouRun:"Your easy runs are truly easy. Your efficiency factor is notably high — every heartbeat propels you further than most.",strengths:"Cardiac efficiency, aerobic economy, speed at controlled heart rate.",watchFor:"High efficiency without speed work leaves race-day performance untapped."},
metronome:{identity:"Precision is your trademark. Your stride is calibrated, your cadence consistent, your form holds together when others fall apart.",howYouRun:"Your cadence data is remarkably consistent. You've dialed in that optimal 175-185 spm sweet spot.",strengths:"Mechanical efficiency, stride consistency, form under fatigue.",watchFor:"Form without fitness can cap potential. Push aerobic and speed boundaries."},
the_grinder:{identity:"You are the definition of discipline. While others have on-again-off-again relationships with running, you show up. Every week. Rain or shine.",howYouRun:"Your weekly volume is stable, frequency high. The habit is deeply embedded — less a choice, more who you are.",strengths:"Training consistency, frequency, compounding fitness gains.",watchFor:"Consistency without variation can lead to staleness. Add deliberate hard and easy phases."},
rubber_band:{identity:"Recovery is your secret weapon. You bounce back from hard efforts like nothing happened. Your body adapts and recovers faster than most.",howYouRun:"Your back-to-back performance is strong. Minimal pace degradation when you stack hard days together.",strengths:"Fatigue resistance, back-to-back performance, training load absorption.",watchFor:"Good recovery can mask overtraining. Strategic rest days can paradoxically make you faster."},
pathfinder:{identity:"Every run is an exploration. You're allergic to the same route twice. Running is as much about discovery as fitness.",howYouRun:"Your route diversity is exceptional. Different starting points, distances, terrain types. Where others have 'their loop,' you have an expanding map.",strengths:"Route diversity, exploration, terrain variety building well-rounded adaptability.",watchFor:"Exploration without structure can scatter training focus. Explore with purpose."},
tempo_hound:{identity:"Speed meets efficiency. Fast AND your heart rate proves you're not redlining. The sports car with great fuel economy.",howYouRun:"Strong WA scores with excellent efficiency factors. You run fast without cardiac redline.",strengths:"The velocity-stamina combination is the most race-relevant pairing in running.",watchFor:"Push into longer tempo efforts to extend how long you can sustain efficient speed."},
weekend_warrior:{identity:"When you show up, you go hard. Your effort-per-session ratio is off the charts. You make every run count.",howYouRun:"Concentrated bursts of quality. Speed and endurance both score well because your sessions are genuine training.",strengths:"High-quality sessions developing both speed and endurance simultaneously.",watchFor:"Adding even one more easy run per week could dramatically boost consistency scores."},
volume_junkie:{identity:"Miles are your currency and you're wealthy. High weekly volume with the discipline to maintain it week after week.",howYouRun:"High mileage, high consistency. You've internalized running as a daily practice.",strengths:"The endurance-fortitude combination builds deep aerobic fitness — the base speed layers onto.",watchFor:"Volume without intensity can leave speed underdeveloped. Your base is ready for speed work."},
trail_rat:{identity:"Pavement is just the road to the trailhead. You seek dirt, elevation, and terrain demanding more than forward motion.",howYouRun:"You actively seek challenging terrain. You collect vertical gain and new routes like souvenirs.",strengths:"Ranging-ascent builds total-body fitness, ankle stability, mental toughness.",watchFor:"Trail running can underdevelop raw speed. Mix in flat road tempo work."},
the_commuter:{identity:"Running isn't just exercise — it's how you move through the world. High consistency meets high route diversity.",howYouRun:"You run often and everywhere. Running is transportation as much as sport.",strengths:"Consistency-exploration builds robust all-terrain fitness and unshakeable habit.",watchFor:"Utilitarian running can lack intensity. Designate 1-2 runs as deliberate workouts."},
track_rat:{identity:"Speed AND form — both dials turned up. You look fast even standing still, cadence dialed in, pace to back it up.",howYouRun:"High velocity paired with optimized cadence. Form and fitness amplify each other.",strengths:"Velocity-cadence combination is biomechanically optimal. Less waste, fewer injuries.",watchFor:"Build your long run to extend how far your speed carries."},
mountain_goat:{identity:"You live for long days in the mountains. Climbing power with distance capacity. You sign up for races with the most elevation.",howYouRun:"Big elevation, big distance. You don't just climb — you climb far.",strengths:"Ascent-endurance is the ultrarunner's calling card.",watchFor:"Mountain fitness doesn't always translate to flat speed. Add periodic flat tempo."},
iron_lung:{identity:"Massive aerobic engine AND you can run it all day. Cardiac efficiency meets distance capacity. Built for endurance events.",howYouRun:"Long runs at low heart rates. Remarkable efficiency even deep into long efforts.",strengths:"Stamina-endurance is the foundation of marathon and ultra performance.",watchFor:"Tempo and interval work can sharpen the blade your endurance has forged."},
clockwork:{identity:"Precise, consistent, reliable. Your cadence is dialed in and you show up like clockwork. Same form, same dedication.",howYouRun:"Consistent cadence paired with consistent training. Double consistency compounds.",strengths:"Cadence-fortitude builds injury-resistant fitness.",watchFor:"Add one challenging session per week to push your pace ceiling."},
comeback_kid:{identity:"You train through anything. Fatigue, bad weather, tough weeks — none of it stops you. You never left.",howYouRun:"Consistent training with minimal performance degradation between sessions.",strengths:"Resilience-fortitude is the most durable build. Volume absorbed, quality maintained.",watchFor:"Your durability is the perfect base for adding structured intensity."},
disciplined_racer:{identity:"Fast AND reliable. Genuine speed backed by months of disciplined preparation. Not a one-race wonder.",howYouRun:"High velocity paired with high fortitude. Speed earned through consistent training.",strengths:"Velocity-fortitude is the competitive runner's ideal.",watchFor:"Push into race-specific work to translate training speed into racing speed."},
terrain_mixer:{identity:"Variety keeps you fresh. Different routes and quick recovery from whatever terrain throws at you.",howYouRun:"High route diversity paired with strong fatigue resistance.",strengths:"Ranging-resilience builds adaptable, well-rounded fitness.",watchFor:"Anchor exploration around a periodized training framework."},
base_builder:{identity:"Playing the long game. Patient aerobic development paired with unwavering consistency. Deep foundations first.",howYouRun:"Strong cardiac efficiency paired with disciplined consistency.",strengths:"Stamina-fortitude builds the deepest possible fitness base.",watchFor:"Set a target race and start periodizing. Your base is ready."},
all_rounder:{identity:"No weakness. No dominant strength either — and that's the point. Competent everywhere, limited nowhere. The Swiss Army knife.",howYouRun:"Your skill radar is remarkably even. You don't have a 'thing' and that IS your thing.",strengths:"Balanced development across all 8 skills. Compete in any format.",watchFor:"Balance can become a plateau. Pick ONE skill to focus on for 6-8 weeks."},
the_specialist:{identity:"One skill towers above all others — and it's magnificent. Where others spread thin, you've gone deep. That peak is your identity.",howYouRun:"Your highest skill is dramatically higher than the rest.",strengths:"Extreme peak performance in your primary skill.",watchFor:"The gap between peak and floor creates fragility. Shore up your weakest."},
raw_talent:{identity:"High highs and low lows. When you're on, you're ON — but consistency isn't there yet. Your best runs look a tier above you.",howYouRun:"Impressive peaks, wide variance. Genuine talent not yet channeled into consistent training.",strengths:"Natural ability producing occasional outstanding performances. Ceiling higher than average suggests.",watchFor:"Consistent training — even moderate — would close the gap between peaks and average."},
workhorse:{identity:"You outwork everyone. You might not be the fastest, but you'll be the last one standing. Your training consistency and grit are remarkable.",howYouRun:"High fortitude, modest velocity. Your log is thick and your commitment unquestionable. You rarely miss days.",strengths:"Grit, consistency, and compounding fitness from showing up every day for months and years.",watchFor:"Speed is your primary growth lever. Even one tempo session per week would unlock a tier jump. Your base can handle it."},
};
