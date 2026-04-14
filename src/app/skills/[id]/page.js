'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, LoadingScreen, OrnamentDivider, SKILL_META, formatDate } from '../../../components/ui';

export default function SkillDetailPage({ params }) {
  const resolvedParams = use(params);
  const skillId = resolvedParams.id;
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const meta = SKILL_META[skillId];

  useEffect(() => {
    if (!meta) { router.push('/skills'); return; }
    
    Promise.all([
      fetch('/api/user?section=profile').then(r => r.json()),
      fetch(`/api/user?section=skills-history&skill=${skillId}`).then(r => r.json()),
    ])
      .then(([p, h]) => { setProfile(p); setHistory(h); })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [skillId]);

  if (loading || !meta) return <LoadingScreen />;

  const currentSkill = profile?.currentSkills?.[skillId];
  const score = currentSkill?.score || 0;
  const detail = currentSkill?.detail || {};

  // Build history chart data
  const chartData = (history || []).map(s => ({
    date: s.snapshot_date,
    score: s[skillId] || 0,
    trigger: s.trigger_type,
  }));

  // Recent changes
  const recentChanges = chartData.length >= 2
    ? chartData.slice(-5).reverse()
    : [];

  // Peak score
  const peakScore = chartData.length > 0 ? Math.max(...chartData.map(d => d.score)) : 0;
  const minScore = chartData.length > 0 ? Math.min(...chartData.map(d => d.score)) : 0;

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6 page-enter">
        <button onClick={() => router.back()} className="text-[#6a5e52] text-2xl">←</button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta.icon}</span>
            <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide uppercase">{meta.name}</h1>
          </div>
          <p className="text-[#6a5e52] text-xs mt-0.5">{meta.desc}</p>
        </div>
      </div>

      {/* Current score (with decimal) */}
      <div className="card-dark p-5 mb-6 page-enter" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Current Rating</p>
            <p className="font-mono text-4xl text-[#d4a832] mt-1 tabular-nums">{score.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-[#4a4038] text-xs">Peak: {peakScore.toFixed(1)}</p>
            <p className="text-[#4a4038] text-xs">Range: {minScore.toFixed(1)} – {peakScore.toFixed(1)}</p>
          </div>
        </div>
        <div className="h-3 bg-[#1a1816] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(score, 100)}%`,
              background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
            }}
          />
        </div>
        <p className="text-[#4a4038] text-xs mt-2">
          Anchored to universal human ceilings. Top scores require elite-level performance.
        </p>
      </div>

      {/* History chart (simple ASCII-like line chart) */}
      {chartData.length > 1 && (
        <div className="card-dark p-4 mb-6 page-enter" style={{ animationDelay: '0.2s' }}>
          <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase mb-3">History</p>
          <SkillHistoryChart data={chartData} color={meta.color} />
        </div>
      )}

      <OrnamentDivider>What This Measures</OrnamentDivider>

      {/* Measurement explanation */}
      <div className="card-dark p-4 mb-6 page-enter" style={{ animationDelay: '0.3s' }}>
        <p className="text-[#a09080] text-sm leading-relaxed">{meta.measures}</p>
      </div>

      {/* Sub-scores / drivers */}
      {detail.sub_scores && (
        <>
          <OrnamentDivider>Sub-Scores</OrnamentDivider>
          <div className="card-dark p-4 mb-6 page-enter" style={{ animationDelay: '0.35s' }}>
            <div className="space-y-3">
              {Object.entries(detail.sub_scores).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[#a09080] text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace('Score', '').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#1a1816] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${val * 100}%`,
                        background: meta.color,
                      }} />
                    </div>
                    <span className="font-mono text-xs text-[#d4a832] w-8 text-right">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Key metrics */}
      <OrnamentDivider>Key Metrics</OrnamentDivider>
      <div className="card-dark p-4 mb-6 page-enter" style={{ animationDelay: '0.4s' }}>
        <div className="grid grid-cols-2 gap-3">
          {detail.runs_used !== undefined && (
            <MetricItem label="Runs Used" value={detail.runs_used} />
          )}
          {detail.window_days !== undefined && (
            <MetricItem label="Window" value={`${detail.window_days}d`} />
          )}
          {detail.wa_score_avg !== undefined && (
            <MetricItem label="Avg WA Score" value={Math.round(detail.wa_score_avg)} />
          )}
          {detail.best_eq5k_s !== undefined && (
            <MetricItem label="Best 5K Equiv" value={formatTime5k(detail.best_eq5k_s)} />
          )}
          {detail.longest_km !== undefined && (
            <MetricItem label="Longest Run" value={`${detail.longest_km} km`} />
          )}
          {detail.avg_top3_km !== undefined && (
            <MetricItem label="Avg Top 3 Dist" value={`${detail.avg_top3_km} km`} />
          )}
          {detail.volume_km_per_month !== undefined && (
            <MetricItem label="Vol/Month" value={`${detail.volume_km_per_month} km`} />
          )}
          {detail.avg_top3_elev_per_km !== undefined && (
            <MetricItem label="Avg Elev/km" value={`${detail.avg_top3_elev_per_km} m`} />
          )}
          {detail.total_elevation_m !== undefined && (
            <MetricItem label="Total Climb" value={`${detail.total_elevation_m} m`} />
          )}
          {detail.avg_efficiency_factor !== undefined && (
            <MetricItem label="Efficiency" value={detail.avg_efficiency_factor.toFixed(2)} />
          )}
          {detail.avg_cadence_spm !== undefined && (
            <MetricItem label="Avg Cadence" value={`${detail.avg_cadence_spm} spm`} />
          )}
          {detail.runs_per_week !== undefined && (
            <MetricItem label="Runs/Week" value={detail.runs_per_week} />
          )}
          {detail.active_week_ratio !== undefined && (
            <MetricItem label="Active Weeks" value={`${detail.active_week_ratio}%`} />
          )}
          {detail.longest_streak !== undefined && (
            <MetricItem label="Longest Streak" value={`${detail.longest_streak} runs`} />
          )}
          {detail.unique_start_locations !== undefined && (
            <MetricItem label="Unique Locations" value={detail.unique_start_locations} />
          )}
          {detail.unique_routes !== undefined && (
            <MetricItem label="Unique Routes" value={detail.unique_routes} />
          )}
        </div>
      </div>

      {/* Top performances */}
      {detail.top_performances && (
        <>
          <OrnamentDivider>Top Performances</OrnamentDivider>
          <div className="space-y-2 page-enter" style={{ animationDelay: '0.45s' }}>
            {detail.top_performances.map((p, i) => (
              <div key={i} className="card-dark p-3 flex items-center justify-between">
                <div>
                  <span className="text-[#a09080] text-sm">{formatDate(p.date)}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-[#d4a832]">WA {p.wa_score}</span>
                  <span className="text-[#6a5e52] text-xs ml-2">≈{p.eq5k_min}min 5K</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Regression notice */}
      {detail.regression_applied && (
        <div className="card-dark p-4 mt-6 border-l-2 border-[#c94444]/30 page-enter" style={{ animationDelay: '0.5s' }}>
          <p className="text-[#c94444] text-xs font-display tracking-wider uppercase mb-1">Inactivity Regression</p>
          <p className="text-[#a09080] text-sm">
            This skill has been reduced due to {Math.round(detail.inactivity_days)} days of inactivity.
            Pre-regression value: {detail.pre_regression_score?.toFixed(1)}.
            New runs will restore and rebuild this rating.
          </p>
        </div>
      )}

      {/* Data gaps notice */}
      {(detail.requires_hr || detail.requires_cadence) && detail.runs_used === 0 && (
        <div className="card-dark p-4 mt-6 border-l-2 border-[#7a8a9a]/30 page-enter">
          <p className="text-[#7a8a9a] text-xs font-display tracking-wider uppercase mb-1">Missing Data</p>
          <p className="text-[#a09080] text-sm">
            This skill requires {detail.requires_hr ? 'heart rate' : 'cadence'} data.
            None of your recent runs include this sensor. Runs without this data
            are excluded from this skill only — they still count for other skills.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[#4a4038] text-xs">{label}</span>
      <span className="font-mono text-sm text-[#e8dcc8]">{value}</span>
    </div>
  );
}

function formatTime5k(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Simple SVG line chart for skill history
function SkillHistoryChart({ data, color }) {
  if (!data || data.length < 2) return null;

  const width = 320;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxScore = Math.max(...data.map(d => d.score), 10);
  const minScore = Math.min(...data.map(d => d.score), 0);
  const range = maxScore - minScore || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.score - minScore) / range) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = pathD + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => {
        const y = padding.top + chartH * (1 - f);
        return (
          <line key={f} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                stroke="#282420" strokeWidth="0.5" />
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={`${color}10`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />

      {/* Inactivity markers */}
      {data.map((d, i) => {
        if (d.trigger !== 'inactivity') return null;
        return (
          <circle key={i} cx={points[i].x} cy={points[i].y} r="2"
                  fill="#c94444" opacity="0.7" />
        );
      })}

      {/* Latest point */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y}
              r="3" fill={color} stroke="#0e0c0a" strokeWidth="1" />

      {/* Y axis labels */}
      <text x={padding.left - 4} y={padding.top + 3} textAnchor="end"
            className="text-[8px] fill-[#4a4038]">{Math.round(maxScore)}</text>
      <text x={padding.left - 4} y={padding.top + chartH + 3} textAnchor="end"
            className="text-[8px] fill-[#4a4038]">{Math.round(minScore)}</text>

      {/* Date labels */}
      {data.length > 0 && (
        <>
          <text x={padding.left} y={height - 2} textAnchor="start"
                className="text-[7px] fill-[#4a4038]">
            {new Date(data[0].date).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
          </text>
          <text x={width - padding.right} y={height - 2} textAnchor="end"
                className="text-[7px] fill-[#4a4038]">
            {new Date(data[data.length - 1].date).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
          </text>
        </>
      )}
    </svg>
  );
}
