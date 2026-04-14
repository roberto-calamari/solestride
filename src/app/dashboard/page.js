'use client';
import { useState, useEffect } from 'react';

const SKILL_COLORS = { velocity: '#f0c868', endurance: '#68a878', ascent: '#a08060', stamina: '#d06050', cadence: '#9878b0', fortitude: '#7090a8', resilience: '#c09050', ranging: '#58a0a8' };
const SKILL_ICONS = { velocity: '⚡', endurance: '🛤', ascent: '⛰', stamina: '♥', cadence: '👟', fortitude: '📅', resilience: '🔁', ranging: '🧭' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/user');
      if (res.status === 401) { window.location.href = '/'; return; }
      const d = await res.json();
      setData(d);
    } catch (e) { setError(e.message); }
  }

  async function doSync() {
    setSyncing(true); setSyncMsg('Importing from Strava...'); setError('');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const d = await res.json();
      if (d.status === 'completed') {
        setSyncMsg('Import complete! ' + (d.activityCount || 0) + ' runs scored.');
        setTimeout(() => { setSyncing(false); fetchData(); }, 1500);
      } else {
        setError(d.error || 'Sync failed'); setSyncing(false);
      }
    } catch (e) { setError(e.message); setSyncing(false); }
  }

  const cs = {
    page: { minHeight: '100vh', background: '#110e0a', color: '#ddd0b8', fontFamily: "'Cormorant Garamond', serif", padding: '24px 16px 40px', maxWidth: 430, margin: '0 auto' },
    card: { background: 'rgba(30,25,19,.9)', border: '1px solid rgba(170,140,80,.09)', borderRadius: 3, padding: '14px 16px', marginBottom: 10 },
    label: { fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 600, color: '#685e4e', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 5 },
    title: { fontSize: 26, fontWeight: 600, marginBottom: 2 },
    tier: { fontFamily: "'Cinzel', serif", fontSize: 7.5, fontWeight: 600, color: '#e8c050', background: 'rgba(232,192,80,.1)', padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: 2, border: '1px solid rgba(232,192,80,.12)', display: 'inline-block', marginLeft: 8 },
    sub: { fontSize: 14, color: '#685e4e', fontStyle: 'italic', marginTop: 5 },
    btn: { display: 'block', width: '100%', padding: '14px 24px', borderRadius: 3, border: 'none', cursor: 'pointer', background: 'rgba(232,192,80,.1)', color: '#e8c050', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginTop: 12 },
    syncBtn: { display: 'block', width: '100%', padding: '14px 24px', borderRadius: 3, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #fc4c02, #e84400)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 },
    score: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#e8c050' },
    bar: { height: 5, background: 'rgba(60,48,30,.6)', borderRadius: 1, marginTop: 4, border: '1px solid rgba(100,80,50,.12)', overflow: 'hidden' },
    desc: { fontSize: 13.5, lineHeight: 1.7, color: '#b0a088', fontFamily: "'DM Sans', sans-serif" },
    err: { padding: '10px 16px', background: 'rgba(180,50,50,.15)', border: '1px solid rgba(180,50,50,.25)', color: '#c04040', borderRadius: 3, fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 },
  };

  if (!data) return <div style={cs.page}><p style={{ color: '#685e4e' }}>Loading...</p></div>;

  const hasBuild = data.currentBuild && data.currentSkills;

  return (
    <div style={cs.page}>
      {error && <div style={cs.err}>{error}</div>}

      {!hasBuild ? (
        <div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: '#e8c050', letterSpacing: 4, marginBottom: 8 }}>SOLESTRIDE</h1>
            <p style={{ color: '#685e4e', marginBottom: 4 }}>Welcome, {data.user?.strava_firstname || 'Runner'}.</p>
          </div>
          <div style={{ ...cs.card, textAlign: 'center', padding: '24px 16px', marginTop: 24 }}>
            <p style={{ ...cs.desc, marginBottom: 16 }}>Import your full Strava run history to reconstruct your build evolution from your very first logged run.</p>
            {syncing ? (
              <div>
                <div style={cs.bar}><div style={{ height: '100%', background: 'linear-gradient(90deg, rgba(232,192,80,.4), #e8c050)', animation: 'pulse 1.5s ease-in-out infinite', width: '60%' }} /></div>
                <p style={{ color: '#685e4e', fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>{syncMsg}</p>
              </div>
            ) : (
              <button style={cs.syncBtn} onClick={doSync}>Sync with Strava</button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={cs.label}>Active Build</div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 2 }}>
            <h1 style={cs.title}>{data.currentBuild.fullName}</h1>
            <span style={cs.tier}>{data.currentBuild.modifier}</span>
          </div>
          <p style={cs.sub}>{data.currentBuild.tierName} tier · {data.currentBuild.archetypeName} archetype</p>

          <div style={{ ...cs.card, marginTop: 16 }}>
            <p style={cs.desc}>{data.currentBuild.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(170,140,80,.1), transparent)' }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, fontWeight: 600, color: '#685e4e', textTransform: 'uppercase', letterSpacing: 5 }}>Skills</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(170,140,80,.1), transparent)' }} />
          </div>

          {Object.entries(data.currentSkills).map(([key, skill]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, color: '#b0a088', textTransform: 'uppercase', letterSpacing: 2 }}>{SKILL_ICONS[key]} {key}</span>
                <span style={cs.score}>{skill.score}</span>
              </div>
              <div style={cs.bar}>
                <div style={{ height: '100%', width: skill.score + '%', background: `linear-gradient(90deg, ${SKILL_COLORS[key]}44, ${SKILL_COLORS[key]})`, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
            <div style={{ ...cs.card, textAlign: 'center', padding: '10px 8px' }}><div style={cs.score}>{data.activityCount}</div><div style={{ color: '#685e4e', fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Runs scored</div></div>
            <div style={{ ...cs.card, textAlign: 'center', padding: '10px 8px' }}><div style={cs.score}>{data.currentBuild.avg}</div><div style={{ color: '#685e4e', fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Avg score</div></div>
            <div style={{ ...cs.card, textAlign: 'center', padding: '10px 8px' }}><div style={cs.score}>{data.totalActivities}</div><div style={{ color: '#685e4e', fontSize: 10, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Total acts</div></div>
          </div>

          <button style={cs.btn} onClick={doSync} disabled={syncing}>{syncing ? syncMsg : 'Re-sync with Strava'}</button>
        </div>
      )}
    </div>
  );
}
