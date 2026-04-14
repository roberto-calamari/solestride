'use client';
import { useState, useEffect, useCallback } from 'react';

// ===== CONSTANTS =====
const SKILL_META = {
  velocity:{n:'Velocity',i:'⚡',c:'#f0c868',s:'Raw speed vs world standards'},
  endurance:{n:'Endurance',i:'🛤',c:'#68a878',s:'Distance capacity & pace holding'},
  ascent:{n:'Ascent',i:'⛰',c:'#a08060',s:'Climbing power'},
  stamina:{n:'Stamina',i:'♥',c:'#d06050',s:'Cardiac efficiency (needs HR)'},
  cadence:{n:'Cadence',i:'👟',c:'#9878b0',s:'Stride mechanics (needs sensor)'},
  fortitude:{n:'Fortitude',i:'📅',c:'#7090a8',s:'Consistency & discipline'},
  resilience:{n:'Resilience',i:'🔁',c:'#c09050',s:'Recovery & fatigue resistance'},
  ranging:{n:'Ranging',i:'🧭',c:'#58a0a8',s:'Route diversity & exploration'},
};
const SK = Object.keys(SKILL_META);
const ARCHETYPES = [
{id:'speed_demon',n:'Speed Demon',pr:'Velocity',d:'Pure speed above all else.',c1:'#e83030',c2:'#ff6040',c3:'#f0c060',motif:'bolt',cat:'Single'},
{id:'long_hauler',n:'Long Hauler',pr:'Endurance',d:'Eats miles for breakfast.',c1:'#3070a8',c2:'#50a0d8',c3:'#e87040',motif:'road',cat:'Single'},
{id:'hill_grinder',n:'Hill Grinder',pr:'Ascent',d:'The steeper the better.',c1:'#508848',c2:'#80c060',c3:'#e0c040',motif:'peaks',cat:'Single'},
{id:'cardiac_king',n:'Cardiac King',pr:'Stamina',d:'Supreme aerobic engine.',c1:'#c03040',c2:'#f06070',c3:'#f08080',motif:'heart',cat:'Single'},
{id:'metronome',n:'Metronome',pr:'Cadence',d:'Every step calibrated.',c1:'#a0a0b8',c2:'#d0d0e0',c3:'#4080d0',motif:'pendulum',cat:'Single'},
{id:'the_grinder',n:'The Grinder',pr:'Fortitude',d:'Never misses a day.',c1:'#505860',c2:'#8898a8',c3:'#d0d040',motif:'shield',cat:'Single'},
{id:'rubber_band',n:'Rubber Band',pr:'Resilience',d:'Rebounds from fatigue fast.',c1:'#3878a8',c2:'#60b0d8',c3:'#50c070',motif:'spring',cat:'Single'},
{id:'pathfinder',n:'Pathfinder',pr:'Ranging',d:'Always a new route.',c1:'#c07030',c2:'#e8a050',c3:'#40a0d0',motif:'star',cat:'Single'},
{id:'tempo_hound',n:'Tempo Hound',pr:'Velocity + Stamina',d:'Fast AND efficient.',c1:'#8048a0',c2:'#b870e0',c3:'#f0d050',motif:'wave',cat:'Dual'},
{id:'weekend_warrior',n:'Weekend Warrior',pr:'Velocity + Endurance',d:'When you show up, you go hard.',c1:'#d0a020',c2:'#f8d048',c3:'#ffffff',motif:'flame',cat:'Dual'},
{id:'volume_junkie',n:'Volume Junkie',pr:'Endurance + Fortitude',d:'High mileage, high consistency.',c1:'#a07030',c2:'#d0a050',c3:'#f0e0c0',motif:'layers',cat:'Dual'},
{id:'trail_rat',n:'Trail Rat',pr:'Ranging + Ascent',d:'Off-road explorer who loves hills.',c1:'#688848',c2:'#a0c868',c3:'#d05030',motif:'tree',cat:'Dual'},
{id:'the_commuter',n:'The Commuter',pr:'Fortitude + Ranging',d:'Runs everywhere, every day.',c1:'#607080',c2:'#90a8b8',c3:'#e0e040',motif:'network',cat:'Dual'},
{id:'track_rat',n:'Track Rat',pr:'Velocity + Cadence',d:'Fast with sharp form.',c1:'#d06030',c2:'#f08848',c3:'#f8e870',motif:'arrows',cat:'Dual'},
{id:'mountain_goat',n:'Mountain Goat',pr:'Ascent + Endurance',d:'Long mountain runs.',c1:'#607848',c2:'#88a868',c3:'#c8b070',motif:'horn',cat:'Dual'},
{id:'iron_lung',n:'Iron Lung',pr:'Stamina + Endurance',d:'Low HR, big distance.',c1:'#4868a0',c2:'#7098d0',c3:'#80d0a0',motif:'wind',cat:'Dual'},
{id:'clockwork',n:'Clockwork',pr:'Cadence + Fortitude',d:'Precise AND consistent.',c1:'#708098',c2:'#a0b8d0',c3:'#b0b8c8',motif:'gear',cat:'Dual'},
{id:'comeback_kid',n:'Comeback Kid',pr:'Resilience + Fortitude',d:'Trains through anything.',c1:'#a07840',c2:'#d0a860',c3:'#60c880',motif:'spiral',cat:'Dual'},
{id:'disciplined_racer',n:'Disciplined Racer',pr:'Velocity + Fortitude',d:'Fast AND disciplined.',c1:'#b85030',c2:'#e07050',c3:'#f0d060',motif:'crown',cat:'Dual'},
{id:'terrain_mixer',n:'Terrain Mixer',pr:'Ranging + Resilience',d:'Variety runner who stays fresh.',c1:'#50888a',c2:'#78b8b8',c3:'#c8a050',motif:'mosaic',cat:'Dual'},
{id:'base_builder',n:'Base Builder',pr:'Stamina + Fortitude',d:'Patient aerobic development.',c1:'#705888',c2:'#a080b8',c3:'#d0a870',motif:'pillars',cat:'Dual'},
{id:'all_rounder',n:'All-Rounder',pr:'Balanced',d:'No weakness anywhere.',c1:'#4878a0',c2:'#78b0d0',c3:'#e09040',motif:'mandala',cat:'Shape'},
{id:'the_specialist',n:'The Specialist',pr:'One extreme skill',d:'One skill towers above.',c1:'#c0a040',c2:'#e8c860',c3:'#ffffff',motif:'diamond',cat:'Shape'},
{id:'raw_talent',n:'Raw Talent',pr:'High peak, low floor',d:'Fast but inconsistent.',c1:'#a05030',c2:'#d07050',c3:'#f8e080',motif:'comet',cat:'Shape'},
{id:'workhorse',n:'Workhorse',pr:'High grit, modest speed',d:'Not the fastest, but always there.',c1:'#686058',c2:'#988878',c3:'#c0b8a0',motif:'anvil',cat:'Shape'},
];
const TIERS=[{n:'Beginner',r:'0–10',d:'Just starting. Every run builds foundation.'},{n:'Developing',r:'10–22',d:'Building habits. Becoming a runner.'},{n:'Solid',r:'22–36',d:'Consistent with real history.'},{n:'Strong',r:'36–50',d:'Serious dedicated training.'},{n:'Competitive',r:'50–65',d:'Racing-ready. Club level.'},{n:'Elite',r:'65–82',d:'Exceptional. Years of focused work.'},{n:'World-Class',r:'82+',d:'Approaching human limits.'}];
const MODS=[{n:'Consistent',d:'Steady week after week.'},{n:'Streaky',d:'Peaks then gaps.'},{n:'Improving',d:'Trending up.'},{n:'Plateau\'d',d:'Stable. Needs a shift.'},{n:'Comeback',d:'Reversing regression.'},{n:'Fresh',d:'Under 20 runs.'},{n:'Veteran',d:'Hundreds of runs.'}];

// ===== EMBLEM SVG GENERATOR =====
function Emblem({archId,size,skills}){
  const a=ARCHETYPES.find(x=>x.id===archId)||ARCHETYPES[24];
  const S=size,cx=S/2,cy=S/2,R=S*.38,mc=a.c2,mc2=a.c3,m=a.motif;
  const f=`gw${archId}`;
  const st=(2*Math.PI)/8,rs=R*.7;
  let rp='';SK.forEach((k,i)=>{const an=st*i-Math.PI/2,v=(skills?.[k]?.score||skills?.[k]||0)/100;rp+=(i?'L':'M')+(cx+v*rs*Math.cos(an)).toFixed(1)+','+(cy+v*rs*Math.sin(an)).toFixed(1)});rp+='Z';
  const motifSvg=getMotif(m,cx,cy,mc,mc2,f);
  const cm=S*.08;
  return(<svg viewBox={`0 0 ${S} ${S}`} width={size} height={size} style={{display:'block'}}><defs><radialGradient id={`bg${archId}`} cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor={a.c1} stopOpacity=".08"/><stop offset="100%" stopColor={a.c1} stopOpacity="0"/></radialGradient><radialGradient id={`gl${archId}`} cx="50%" cy="40%" r="35%"><stop offset="0%" stopColor={mc} stopOpacity=".15"/><stop offset="100%" stopColor={mc} stopOpacity="0"/></radialGradient><filter id={f}><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width={S} height={S} fill="#110e0a"/><rect width={S} height={S} fill={`url(#bg${archId})`}/><circle cx={cx} cy={cy} r={R} fill="none" stroke={a.c1} strokeWidth=".5" opacity=".15"/><circle cx={cx} cy={cy} r={R*.85} fill="none" stroke={a.c1} strokeWidth=".3" opacity=".08"/><path d={rp} fill={a.c1} fillOpacity=".06" stroke={mc} strokeWidth="1" opacity=".35"/>{SK.map((_,i)=>{const an=st*i-Math.PI/2;return<line key={i} x1={cx} y1={cy} x2={(cx+R*.9*Math.cos(an)).toFixed(1)} y2={(cy+R*.9*Math.sin(an)).toFixed(1)} stroke={a.c1} strokeWidth=".3" opacity=".06"/>})}{SK.map((k,i)=>{const an=st*i-Math.PI/2,v=(skills?.[k]?.score||skills?.[k]||0)/100;return<circle key={k} cx={(cx+v*rs*Math.cos(an)).toFixed(1)} cy={(cy+v*rs*Math.sin(an)).toFixed(1)} r="2" fill={SKILL_META[k].c} opacity=".7"/>})}<circle cx={cx} cy={cy*.95} r={R*.45} fill={`url(#gl${archId})`}/>{motifSvg}{[[cm,cm],[S-cm,cm],[cm,S-cm],[S-cm,S-cm]].map(([x,y],i)=><g key={i}><line x1={x-4} y1={y} x2={x+4} y2={y} stroke={a.c1} strokeWidth=".4" opacity=".12"/><line x1={x} y1={y-4} x2={x} y2={y+4} stroke={a.c1} strokeWidth=".4" opacity=".12"/></g>)}<rect x="1" y="1" width={S-2} height={S-2} fill="none" stroke={a.c1} strokeWidth=".5" opacity=".08" rx="2"/></svg>);
}
function getMotif(m,cx,cy,mc,mc2,f){
  const F=`url(#${f})`;
  if(m==='bolt')return<><path d={`M${cx-8} ${cy-25}L${cx+4} ${cy-3}L${cx-2} ${cy-3}L${cx+8} ${cy+25}L${cx-4} ${cy+3}L${cx+2} ${cy+3}Z`} fill={mc} fillOpacity=".7" filter={F}/><path d={`M${cx-5} ${cy-18}L${cx+2} ${cy-2}L${cx-1} ${cy-2}L${cx+5} ${cy+18}`} fill="none" stroke={mc2} strokeWidth="1.5" opacity=".9" filter={F}/></>;
  if(m==='road')return<><path d={`M${cx} ${cy-30}C${cx-25} ${cy-10} ${cx-25} ${cy+10} ${cx} ${cy+30}C${cx+25} ${cy+10} ${cx+25} ${cy-10} ${cx} ${cy-30}Z`} fill="none" stroke={mc} strokeWidth="1.5" opacity=".6" filter={F}/><line x1={cx} y1={cy-20} x2={cx} y2={cy+20} stroke={mc2} strokeWidth="1" opacity=".5" strokeDasharray="2 3"/><circle cx={cx} cy={cy} r="3" fill={mc2} opacity=".8"/></>;
  if(m==='peaks')return<><path d={`M${cx-28} ${cy+18}L${cx-8} ${cy-22}L${cx} ${cy-10}L${cx+10} ${cy-28}L${cx+28} ${cy+18}Z`} fill={mc} fillOpacity=".2" stroke={mc} strokeWidth="1" opacity=".7" filter={F}/><path d={`M${cx+4} ${cy-18}L${cx+10} ${cy-28}L${cx+16} ${cy-18}`} fill={mc2} fillOpacity=".25"/></>;
  if(m==='heart')return<><path d={`M${cx} ${cy+15}C${cx-25} ${cy} ${cx-25} ${cy-20} ${cx} ${cy-8}C${cx+25} ${cy-20} ${cx+25} ${cy} ${cx} ${cy+15}Z`} fill={mc} fillOpacity=".2" stroke={mc} strokeWidth="1" opacity=".6" filter={F}/><path d={`M${cx-20} ${cy+3}L${cx-8} ${cy+3}L${cx-4} ${cy-8}L${cx+2} ${cy+10}L${cx+6} ${cy+3}L${cx+20} ${cy+3}`} fill="none" stroke={mc2} strokeWidth="1.5" opacity=".7" filter={F}/></>;
  if(m==='pendulum')return<><circle cx={cx} cy={cy} r="20" fill="none" stroke={mc} strokeWidth="1" opacity=".5" filter={F}/><circle cx={cx} cy={cy} r="12" fill="none" stroke={mc2} strokeWidth=".8" opacity=".4"/><circle cx={cx} cy={cy} r="4" fill={mc2} opacity=".7"/></>;
  if(m==='shield')return<><path d={`M${cx-18} ${cy-22}L${cx+18} ${cy-22}L${cx+18} ${cy+5}L${cx} ${cy+25}L${cx-18} ${cy+5}Z`} fill={mc} fillOpacity=".15" stroke={mc} strokeWidth="1.2" opacity=".6" filter={F}/><line x1={cx} y1={cy-18} x2={cx} y2={cy+20} stroke={mc2} strokeWidth="1" opacity=".4"/></>;
  if(m==='spring')return<><path d={`M${cx-15} ${cy+20}Q${cx-20} ${cy+5} ${cx} ${cy+5}Q${cx+20} ${cy+5} ${cx+15} ${cy-8}Q${cx+10} ${cy-20} ${cx} ${cy-20}Q${cx-10} ${cy-20} ${cx-15} ${cy-8}`} fill="none" stroke={mc} strokeWidth="1.5" opacity=".5" filter={F}/><circle cx={cx} cy={cy-2} r="5" fill={mc2} fillOpacity=".3" stroke={mc2} strokeWidth="1" opacity=".6" filter={F}/></>;
  if(m==='star'){const pts=[];for(let i=0;i<6;i++){const an=i*Math.PI/3-Math.PI/2;pts.push({x:cx+22*Math.cos(an),y:cy+22*Math.sin(an)});}return<>{pts.map((p,i)=><g key={i}><line x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={mc} strokeWidth="1" opacity=".4" filter={F}/><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2" fill={mc} opacity=".5"/></g>)}<circle cx={cx} cy={cy} r="5" fill={mc2} opacity=".6" filter={F}/></>;}
  if(m==='wave'){return<>{[0,1,2].map(i=>{const y=cy-10+i*10,amp=12-i*3;return<path key={i} d={`M${cx-30} ${y}Q${cx-15} ${y-amp} ${cx} ${y}Q${cx+15} ${y+amp} ${cx+30} ${y}`} fill="none" stroke={i===1?mc2:mc} strokeWidth={i===1?'1.5':'1'} opacity={i===1?.8:.3} filter={i===1?F:undefined}/>})}</>;}
  if(m==='flame')return<><path d={`M${cx} ${cy+22}C${cx-18} ${cy+5} ${cx-15} ${cy-15} ${cx} ${cy-28}C${cx+15} ${cy-15} ${cx+18} ${cy+5} ${cx} ${cy+22}Z`} fill={mc} fillOpacity=".2" stroke={mc} strokeWidth="1" opacity=".6" filter={F}/><path d={`M${cx} ${cy+15}C${cx-8} ${cy+5} ${cx-6} ${cy-8} ${cx} ${cy-18}C${cx+6} ${cy-8} ${cx+8} ${cy+5} ${cx} ${cy+15}Z`} fill={mc2} fillOpacity=".2" filter={F}/></>;
  if(m==='layers')return<>{[0,1,2,3].map(i=><rect key={i} x={cx-(20+i*4)} y={cy-15+i*10} width={(20+i*4)*2} height="6" rx="1" fill={mc} fillOpacity={.15+i*.1} stroke={mc} strokeWidth=".5" opacity=".5" filter={F}/>)}</>;
  if(m==='tree')return<><line x1={cx} y1={cy+20} x2={cx} y2={cy-5} stroke={mc} strokeWidth="2" opacity=".5"/><circle cx={cx} cy={cy-15} r="16" fill={mc} fillOpacity=".18" stroke={mc} strokeWidth="1" opacity=".5" filter={F}/></>;
  if(m==='network'){const nd=[[0,-20],[-18,-5],[18,-5],[-12,15],[12,15],[0,5]],ed=[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[0,5]];return<>{ed.map(([a,b],i)=><line key={'e'+i} x1={cx+nd[a][0]} y1={cy+nd[a][1]} x2={cx+nd[b][0]} y2={cy+nd[b][1]} stroke={mc} strokeWidth=".8" opacity=".3"/>)}{nd.map((n,i)=><circle key={'n'+i} cx={cx+n[0]} cy={cy+n[1]} r={i===0?4:2.5} fill={i===0?mc2:mc} opacity=".6" filter={F}/>)}</>;}
  if(m==='arrows')return<><line x1={cx-20} y1={cy+10} x2={cx+20} y2={cy-10} stroke={mc} strokeWidth="1.5" opacity=".5" filter={F}/><line x1={cx-20} y1={cy-10} x2={cx+20} y2={cy+10} stroke={mc} strokeWidth="1.5" opacity=".5" filter={F}/></>;
  if(m==='horn')return<><path d={`M${cx-12} ${cy+20}Q${cx-25} ${cy-5} ${cx-8} ${cy-28}`} fill="none" stroke={mc} strokeWidth="2" opacity=".5" strokeLinecap="round" filter={F}/><path d={`M${cx+12} ${cy+20}Q${cx+25} ${cy-5} ${cx+8} ${cy-28}`} fill="none" stroke={mc} strokeWidth="2" opacity=".5" strokeLinecap="round" filter={F}/></>;
  if(m==='wind')return<><path d={`M${cx-25} ${cy-8}Q${cx} ${cy-20} ${cx+25} ${cy-8}`} fill="none" stroke={mc} strokeWidth="1.2" opacity=".5" filter={F}/><path d={`M${cx-22} ${cy}Q${cx} ${cy-10} ${cx+22} ${cy}`} fill="none" stroke={mc2} strokeWidth="1.5" opacity=".6" filter={F}/><path d={`M${cx-25} ${cy+8}Q${cx} ${cy} ${cx+25} ${cy+8}`} fill="none" stroke={mc} strokeWidth="1.2" opacity=".5" filter={F}/></>;
  if(m==='gear'){const t=8,gr=18;let gp='';for(let i=0;i<t;i++){const a1=(i/t)*Math.PI*2-Math.PI/2,a2=((i+.35)/t)*Math.PI*2-Math.PI/2,a3=((i+.5)/t)*Math.PI*2-Math.PI/2,a4=((i+.85)/t)*Math.PI*2-Math.PI/2;gp+=`${i?'L':'M'}${(cx+gr*Math.cos(a1)).toFixed(1)},${(cy+gr*Math.sin(a1)).toFixed(1)} L${(cx+(gr+5)*Math.cos(a2)).toFixed(1)},${(cy+(gr+5)*Math.sin(a2)).toFixed(1)} L${(cx+(gr+5)*Math.cos(a3)).toFixed(1)},${(cy+(gr+5)*Math.sin(a3)).toFixed(1)} L${(cx+gr*Math.cos(a4)).toFixed(1)},${(cy+gr*Math.sin(a4)).toFixed(1)} `}gp+='Z';return<><path d={gp} fill={mc} fillOpacity=".15" stroke={mc} strokeWidth=".8" opacity=".5" filter={F}/><circle cx={cx} cy={cy} r="3" fill={mc2} opacity=".6"/></>;}
  if(m==='spiral')return<path d={`M${cx} ${cy}C${cx+8} ${cy-8} ${cx+16} ${cy-4} ${cx+16} ${cy}C${cx+16} ${cy+12} ${cx-4} ${cy+20} ${cx-12} ${cy+12}C${cx-20} ${cy+4} ${cx-16} ${cy-12} ${cx-4} ${cy-16}C${cx+8} ${cy-20} ${cx+24} ${cy-8} ${cx+24} ${cy+4}`} fill="none" stroke={mc} strokeWidth="1.5" opacity=".5" filter={F}/>;
  if(m==='crown')return<><path d={`M${cx-18} ${cy+8}L${cx-18} ${cy-10}L${cx-9} ${cy}L${cx} ${cy-18}L${cx+9} ${cy}L${cx+18} ${cy-10}L${cx+18} ${cy+8}Z`} fill={mc} fillOpacity=".2" stroke={mc} strokeWidth="1" opacity=".6" filter={F}/><circle cx={cx} cy={cy-16} r="2" fill={mc2} opacity=".8"/></>;
  if(m==='mosaic'){const ts=9;return<>{[0,1,2].map(r=>[0,1,2].map(c=><rect key={r+'-'+c} x={cx-ts*1.5+c*ts+ts/2} y={cy-ts*1.5+r*ts+ts/2} width={ts-1} height={ts-1} rx="1" fill={(r+c)%3===0?mc2:mc} fillOpacity={(r+c)%2===0?.25:.12} stroke={mc} strokeWidth=".3" opacity=".4"/>)).flat()}</>;}
  if(m==='pillars')return<>{[0,1,2].map(i=><rect key={i} x={cx-14+i*14-3} y={cy+15-(20+i*5)} width="6" height={20+i*5} rx="1" fill={mc} fillOpacity={.15+i*.05} stroke={mc} strokeWidth=".6" opacity=".5" filter={F}/>)}<line x1={cx-20} y1={cy+16} x2={cx+20} y2={cy+16} stroke={mc2} strokeWidth="1" opacity=".4"/></>;
  if(m==='diamond')return<><path d={`M${cx} ${cy-25}L${cx+18} ${cy}L${cx} ${cy+25}L${cx-18} ${cy}Z`} fill={mc} fillOpacity=".15" stroke={mc} strokeWidth="1" opacity=".6" filter={F}/><circle cx={cx} cy={cy} r="3" fill={mc2} opacity=".8"/></>;
  if(m==='comet')return<><circle cx={cx+8} cy={cy-8} r="8" fill={mc2} fillOpacity=".3" stroke={mc2} strokeWidth="1" opacity=".6" filter={F}/><path d={`M${cx+2} ${cy-4}Q${cx-10} ${cy+5} ${cx-25} ${cy+18}`} fill="none" stroke={mc} strokeWidth="2" opacity=".4" strokeLinecap="round" filter={F}/></>;
  if(m==='anvil')return<><rect x={cx-16} y={cy+5} width="32" height="8" rx="1" fill={mc} fillOpacity=".2" stroke={mc} strokeWidth="1" opacity=".5" filter={F}/><rect x={cx-10} y={cy-15} width="20" height="20" rx="2" fill={mc} fillOpacity=".12" stroke={mc} strokeWidth=".8" opacity=".4"/></>;
  return<><circle cx={cx} cy={cy} r="8" fill={mc2} fillOpacity=".12" stroke={mc2} strokeWidth="1" opacity=".5" filter={F}/><circle cx={cx} cy={cy} r="3" fill={mc2} opacity=".7"/></>;
}

// ===== RADAR CHART =====
function Radar({skills,size}){
  const S=size,cx=S/2,cy=S/2,r=S*.34,st=(2*Math.PI)/8;
  const pt=(i,v)=>({x:cx+(v/100)*r*Math.cos(st*i-Math.PI/2),y:cy+(v/100)*r*Math.sin(st*i-Math.PI/2)});
  return(<svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{display:'block',margin:'0 auto'}}>
    {[25,50,75,100].map(v=><polygon key={v} points={SK.map((_,i)=>{const p=pt(i,v);return p.x+','+p.y}).join(' ')} fill="none" stroke="rgba(170,140,80,.05)" strokeWidth=".5"/>)}
    {SK.map((_,i)=>{const p=pt(i,100);return<line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(170,140,80,.03)" strokeWidth=".5"/>})}
    <polygon points={SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return p.x+','+p.y}).join(' ')} fill="rgba(232,192,80,.06)" stroke="rgba(232,192,80,.3)" strokeWidth="1.2"/>
    {SK.map((k,i)=>{const p=pt(i,skills?.[k]?.score||skills?.[k]||0);return<circle key={k} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill={SKILL_META[k].c} stroke="rgba(14,11,8,.8)" strokeWidth=".6"/>})}
    {SK.map((k,i)=>{const p=pt(i,118);return<text key={k} x={p.x.toFixed(1)} y={(p.y+1).toFixed(1)} textAnchor="middle" dominantBaseline="middle" style={{font:"600 7px 'Cinzel',serif",fill:'rgba(170,140,80,.3)',textTransform:'uppercase',letterSpacing:2}}>{SKILL_META[k].n.slice(0,3)}</text>})}
  </svg>);
}

// ===== STYLES =====
const S={
  page:{minHeight:'100vh',background:'#110e0a',color:'#ddd0b8',fontFamily:"'Cormorant Garamond',serif",maxWidth:430,margin:'0 auto',paddingBottom:90},
  scr:{padding:'24px 16px 20px',animation:'fu .4s ease-out'},
  card:{background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',borderRadius:3,padding:'14px 16px',marginBottom:10,position:'relative'},
  glow:{borderColor:'rgba(170,140,80,.18)',boxShadow:'0 0 30px rgba(200,160,80,.025)'},
  sl:{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:600,color:'#685e4e',textTransform:'uppercase',letterSpacing:4,marginBottom:5},
  bn:{fontSize:26,fontWeight:600,letterSpacing:.2},
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

  useEffect(()=>{fetch('/api/user').then(r=>{if(r.status===401){window.location.href='/';return null}return r.json()}).then(d=>{if(d)setData(d)}).catch(()=>{})},[]);

  const doSync=useCallback(async()=>{
    setSyncing(true);setSyncMsg('Importing from Strava...');
    try{const r=await fetch('/api/sync',{method:'POST'});const d=await r.json();if(d.status==='completed'){setSyncMsg('Done! '+d.activityCount+' runs scored.');setTimeout(()=>{setSyncing(false);fetch('/api/user').then(r=>r.json()).then(setData)},1500)}else{setSyncMsg('Error: '+(d.error||'Unknown'));setTimeout(()=>setSyncing(false),3000)}}catch(e){setSyncMsg('Error: '+e.message);setTimeout(()=>setSyncing(false),3000)}
  },[]);

  if(!data)return<div style={S.page}><div style={{...S.scr,textAlign:'center',paddingTop:100}}><p style={{color:'#685e4e'}}>Loading...</p></div></div>;

  const sk=data.currentSkills||{};
  const bld=data.currentBuild;
  const hasBuild=bld&&Object.keys(sk).length>0;
  const archData=hasBuild?ARCHETYPES.find(a=>a.id===bld.archetype)||ARCHETYPES[24]:null;

  const Divider=({text})=><div style={S.dv}><div style={S.dvl}/><span style={S.dvt}>{text}</span><div style={S.dvl}/></div>;
  const SkillBar=({k,score,onClick})=><div style={{marginBottom:14,cursor:onClick?'pointer':undefined}} onClick={onClick}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'baseline'}}><span style={S.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><span style={S.mg}>{score}</span></div><div style={S.bt}><div style={{height:'100%',width:score+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`,transition:'width 1s ease'}}/></div></div>;

  // ===== SCREENS =====
  const BuildScreen=()=>!hasBuild?(
    <div style={{textAlign:'center',paddingTop:40}}>
      <h1 style={{fontFamily:"'Cinzel',serif",fontSize:24,color:'#e8c050',letterSpacing:4}}>SOLESTRIDE</h1>
      <p style={{color:'#685e4e',margin:'8px 0 24px'}}>Welcome, {data.user?.strava_firstname}.</p>
      <div style={{...S.card,...S.glow,textAlign:'center',padding:'24px 16px'}}>
        <p style={{...S.bd,marginBottom:16}}>Import your full Strava run history.</p>
        {syncing?<p style={{color:'#685e4e',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{syncMsg}</p>:<button style={{...S.syncBtn,background:'linear-gradient(135deg,#fc4c02,#e84400)',color:'#fff',fontSize:14,fontFamily:"'DM Sans',sans-serif"}} onClick={doSync}>Sync with Strava</button>}
      </div>
    </div>
  ):(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><div style={S.sl}>Active Build</div><div style={{display:'flex',alignItems:'baseline',flexWrap:'wrap'}}><h1 style={S.bn}>{bld.fullName}</h1><span style={S.tg}>{bld.modifier}</span></div><p style={S.tl}>{bld.tierName} tier · {bld.archetypeName} archetype</p></div>
      </div>
      <div style={{display:'flex',justifyContent:'center',margin:'20px 0 16px'}}><Emblem archId={bld.archetype} size={240} skills={sk}/></div>
      <div style={{...S.card,...S.glow}}><p style={S.bd}>{bld.description}</p></div>
      <Radar skills={sk} size={250}/>
      <Divider text="Skills"/>
      {SK.map(k=><SkillBar key={k} k={k} score={sk[k]?.score||0} onClick={()=>{setDetail(k);setTab('detail')}}/>)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:8}}>
        <div style={{...S.card,textAlign:'center',padding:'10px 8px'}}><div style={S.mg}>{data.activityCount}</div><div style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Runs scored</div></div>
        <div style={{...S.card,textAlign:'center',padding:'10px 8px'}}><div style={S.mg}>{bld.avg}</div><div style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Avg score</div></div>
        <div style={{...S.card,textAlign:'center',padding:'10px 8px'}}><div style={S.mg}>{data.totalActivities}</div><div style={{color:'#685e4e',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>Total acts</div></div>
      </div>
      <button style={S.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    </div>
  );

  const SkillsScreen=()=><div>
    <div style={S.sl}>Character Sheet</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Skill Profile</h1>
    <Radar skills={sk} size={260}/>
    <Divider text="All Skills"/>
    {SK.map(k=><div key={k} style={{...S.card,cursor:'pointer'}} onClick={()=>{setDetail(k);setTab('detail')}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
        <div><span style={S.sml}>{SKILL_META[k].i} {SKILL_META[k].n}</span><p style={{fontSize:11,color:'#685e4e',marginTop:2}}>{SKILL_META[k].s}</p></div>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:300,color:'#e8c050'}}>{Math.round(sk[k]?.score||0)}</span>
      </div>
      <div style={{...S.bt,height:5}}><div style={{height:'100%',width:(sk[k]?.score||0)+'%',background:`linear-gradient(90deg,${SKILL_META[k].c}44,${SKILL_META[k].c})`}}/></div>
    </div>)}
  </div>;

  const DetailScreen=()=>{const k=detail,m=SKILL_META[k],s=sk[k]?.score||0,d=sk[k]?.detail||{};return<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}><button style={{background:'none',border:'none',color:'#685e4e',fontSize:20,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif"}} onClick={()=>setTab('skills')}>←</button><span style={{fontSize:23,fontWeight:500}}>{m.i} {m.n}</span></div>
    <div style={{...S.card,...S.glow}}><div style={S.xl}>Current Rating</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:44,fontWeight:300,color:'#e8c050',marginTop:4}}>{s.toFixed?s.toFixed(1):s}<span style={{fontSize:16,color:'#685e4e'}}> / 100</span></div><div style={{...S.bt,height:8,margin:'12px 0'}}><div style={{height:'100%',width:s+'%',background:`linear-gradient(90deg,${m.c}44,${m.c})`}}/></div></div>
    {Object.keys(d).length>0&&<div style={S.card}><div style={{...S.xl,marginBottom:12}}>Detail</div>{Object.entries(d).map(([key,val])=><div key={key} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(170,140,80,.04)'}}><span style={S.bd}>{key.replace(/_/g,' ')}</span><span style={S.mg}>{typeof val==='number'?Math.round(val*10)/10:val}</span></div>)}</div>}
  </div>};

  const CodexScreen=()=>{
    const tabs=[['a','Archetypes'],['t','Tiers'],['m','Modifiers']];
    return<div>
      <div style={S.sl}>Codex</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Build Encyclopedia</h1>
      <div style={{display:'flex',gap:3,marginBottom:16}}>{tabs.map(([id,label])=><button key={id} onClick={()=>{setCxTab(id);setCxSel(null)}} style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:600,color:cxTab===id?'#e8c050':'#685e4e',background:cxTab===id?'rgba(232,192,80,.1)':'rgba(60,48,30,.3)',border:'1px solid '+(cxTab===id?'rgba(232,192,80,.12)':'rgba(100,80,50,.08)'),borderRadius:2,padding:'9px 14px',cursor:'pointer',flex:1,textAlign:'center',textTransform:'uppercase',letterSpacing:1.5}}>{label}</button>)}</div>
      {cxTab==='a'&&!cxSel&&<div>{['Single','Dual','Shape'].map(cat=><div key={cat} style={{marginBottom:20}}><div style={{...S.xl,marginBottom:10,color:'#b0a088'}}>{cat}-{cat==='Shape'?'Based':'Dominant'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{ARCHETYPES.filter(a=>a.cat===cat).map(a=><div key={a.id} onClick={()=>setCxSel(a.id)} style={{cursor:'pointer',textAlign:'center',borderRadius:3,background:'rgba(30,25,19,.9)',border:'1px solid rgba(170,140,80,.09)',padding:'12px 4px 10px'}}><Emblem archId={a.id} size={100} skills={sk}/><p style={{fontFamily:"'Cinzel',serif",fontSize:7.5,fontWeight:600,color:'#b0a088',marginTop:8,textTransform:'uppercase',letterSpacing:1}}>{a.n}</p></div>)}</div></div>)}</div>}
      {cxTab==='a'&&cxSel&&(()=>{const a=ARCHETYPES.find(x=>x.id===cxSel);return<div><button style={{background:'none',border:'none',color:'#685e4e',fontSize:18,cursor:'pointer',fontFamily:"'Cormorant Garamond',serif",marginBottom:14}} onClick={()=>setCxSel(null)}>← Back</button><div style={{display:'flex',justifyContent:'center',margin:'0 0 16px'}}><Emblem archId={cxSel} size={200} skills={sk}/></div><h2 style={{...S.bn,textAlign:'center',marginBottom:6}}>{a.n}</h2><p style={{...S.bd,textAlign:'center',marginBottom:14}}>{a.d}</p><div style={S.card}><div style={{...S.xl,marginBottom:5}}>Primary</div><p style={S.bd}>{a.pr}</p></div><div style={S.card}><div style={{...S.xl,marginBottom:6}}>At each tier</div>{TIERS.map(t=><div key={t.n} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(170,140,80,.04)'}}><span style={S.bd}>{t.n} {a.n}</span><span style={{color:'#685e4e',fontSize:10}}>{t.r} avg</span></div>)}</div></div>})()}
      {cxTab==='t'&&<div>{TIERS.map((t,i)=><div key={t.n} style={{...S.card,borderLeft:`2px solid rgba(232,192,80,${(.04+i*.05).toFixed(2)})`}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><h3 style={{fontSize:16,fontWeight:500}}>{t.n}</h3><span style={S.mg}>{t.r} avg</span></div><p style={S.bd}>{t.d}</p></div>)}<div style={S.card}><p style={S.bd}>25 archetypes × 7 tiers × 7 modifiers = <strong style={{color:'#e8c050'}}>1,225 unique builds</strong>.</p></div></div>}
      {cxTab==='m'&&<div>{MODS.map(m=><div key={m.n} style={S.card}><h3 style={{fontSize:16,fontWeight:500,marginBottom:4}}>{m.n}</h3><p style={S.bd}>{m.d}</p></div>)}</div>}
    </div>};

  const SettingsScreen=()=><div>
    <div style={S.sl}>Settings</div><h1 style={{fontSize:23,fontWeight:500,marginBottom:14}}>Preferences</h1>
    <div style={S.card}><div style={S.xl}>Connected Account</div><p style={{fontSize:16,fontWeight:500,marginTop:4}}>{data.user?.strava_firstname} {data.user?.strava_lastname}</p><p style={{color:'#685e4e',fontSize:10,marginTop:2}}>Connected via Strava · {data.activityCount} runs scored</p></div>
    <button style={S.syncBtn} onClick={doSync} disabled={syncing}>{syncing?syncMsg:'Re-sync with Strava'}</button>
    <div style={{textAlign:'center',marginTop:24}}><p style={{fontFamily:"'Cinzel',serif",fontSize:8,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'rgba(100,90,70,.4)'}}>Solestride v1.0</p><p style={{color:'rgba(100,90,70,.3)',fontSize:10,marginTop:6}}>No maps · No social · No tracking</p></div>
  </div>;

  const screens={build:BuildScreen,skills:SkillsScreen,detail:DetailScreen,codex:CodexScreen,settings:SettingsScreen};
  const Screen=screens[tab]||BuildScreen;
  const navItems=[['build','⚔','Build'],['skills','✦','Skills'],['codex','📖','Codex'],['settings','⚙','Settings']];

  return(<div style={S.page}>
    <div style={S.scr}><Screen/></div>
    <div style={S.nav}>{navItems.map(([id,icon,label])=><button key={id} onClick={()=>setTab(id)} style={{...S.nb,...(tab===id||tab==='detail'&&id==='skills'?S.nba:{})}}><span style={{fontSize:16}}>{icon}</span><span style={S.nl}>{label}</span></button>)}</div>
  </div>);
}
