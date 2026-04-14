'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// ============================================================
// SKILL DESCRIPTIONS
// ============================================================

export const SKILL_META = {
  velocity: {
    name: 'Velocity',
    icon: '⚡',
    color: '#e8c55a',
    desc: 'Pure speed capability, anchored to World Athletics standards.',
    measures: 'Best performances across distances, cross-distance equivalence (Riegel), WA-scored and recency-weighted.',
  },
  endurance: {
    name: 'Endurance',
    icon: '🏔',
    color: '#5a8a6e',
    desc: 'Long-effort capacity and pace sustainability.',
    measures: 'Longest runs, pace decay over distance, volume, and negative split capability.',
  },
  ascent: {
    name: 'Ascent',
    icon: '⛰',
    color: '#8b7355',
    desc: 'Climbing power and vertical capability.',
    measures: 'Elevation gain rate, total climbing volume, grade-adjusted pace, hill frequency.',
  },
  stamina: {
    name: 'Stamina',
    icon: '❤️',
    color: '#c94444',
    desc: 'Cardiac efficiency — speed per heartbeat.',
    measures: 'Efficiency factor (pace÷HR), aerobic economy, easy-run HR, zone range. Requires HR data.',
  },
  cadence: {
    name: 'Cadence',
    icon: '🦶',
    color: '#9a85b0',
    desc: 'Mechanical stride efficiency and form.',
    measures: 'Optimal cadence targeting (~180spm), consistency, pace-cadence adaptation. Requires cadence data.',
  },
  fortitude: {
    name: 'Fortitude',
    icon: '🛡',
    color: '#7a8a9a',
    desc: 'Training discipline and consistency.',
    measures: 'Run frequency, weekly volume consistency, active weeks, training streaks over 90 days.',
  },
  resilience: {
    name: 'Resilience',
    icon: '🔄',
    color: '#b08850',
    desc: 'Recovery and fatigue resistance.',
    measures: 'Back-to-back run performance, pace variance, volume tolerance under training load.',
  },
  ranging: {
    name: 'Ranging',
    icon: '🧭',
    color: '#5a9aa0',
    desc: 'Exploration and route diversity.',
    measures: 'Unique start locations, route novelty, distance variety, terrain type diversity.',
  },
};

// ============================================================
// SKILL BAR COMPONENT
// ============================================================

export function SkillBar({ skill, score, showDecimal = false, delay = 0, onClick }) {
  const meta = SKILL_META[skill];
  if (!meta) return null;

  const displayScore = showDecimal ? score.toFixed(1) : Math.round(score);
  const fillPct = Math.min(score, 100);

  return (
    <button
      onClick={onClick}
      className="w-full text-left group active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{meta.icon}</span>
          <span className="font-display text-sm tracking-wide text-[#e8dcc8] uppercase">
            {meta.name}
          </span>
        </div>
        <span className="font-mono text-sm text-[#d4a832] tabular-nums">
          {displayScore}
        </span>
      </div>
      <div className="h-2 bg-[#282420] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full skill-bar-fill"
          style={{
            '--fill': `${fillPct}%`,
            background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </button>
  );
}

// ============================================================
// RADAR CHART COMPONENT
// ============================================================

export function RadarChart({ skills, size = 240 }) {
  const skillKeys = ['velocity', 'endurance', 'ascent', 'stamina', 'cadence', 'fortitude', 'resilience', 'ranging'];
  const center = size / 2;
  const radius = size * 0.38;
  const angleStep = (2 * Math.PI) / skillKeys.length;

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1.0];
  
  // Data points
  const points = skillKeys.map((key, i) => {
    const score = skills?.[key]?.score ?? skills?.[key] ?? 0;
    return getPoint(i, score);
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {/* Background rings */}
      {rings.map((r, i) => (
        <polygon
          key={i}
          points={skillKeys.map((_, j) => {
            const p = getPoint(j, r * 100);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke="#282420"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {skillKeys.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y}
                stroke="#282420" strokeWidth="0.5" />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(212, 168, 50, 0.08)"
        stroke="#d4a832"
        strokeWidth="1.5"
        className="radar-point"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3"
                fill={SKILL_META[skillKeys[i]]?.color || '#d4a832'}
                stroke="#0e0c0a" strokeWidth="1" />
      ))}

      {/* Labels */}
      {skillKeys.map((key, i) => {
        const p = getPoint(i, 115);
        const meta = SKILL_META[key];
        return (
          <text key={key} x={p.x} y={p.y}
                textAnchor="middle" dominantBaseline="middle"
                className="font-display text-[9px] fill-[#a09080] uppercase tracking-wider">
            {meta?.name?.slice(0, 3)}
          </text>
        );
      })}
    </svg>
  );
}

// ============================================================
// BUILD ART RENDERER (Generative Pixel Art)
// ============================================================

export function BuildArt({ artParams, size = 200, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !artParams) return;
    const ctx = canvasRef.current.getContext('2d');
    renderBuildArt(ctx, artParams, size);
  }, [artParams, size]);

  if (!artParams) {
    return <div className={`${className} bg-[#1a1816] rounded-lg`} style={{ width: size, height: size }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pixel-art rounded-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function renderBuildArt(ctx, params, size) {
  const { palette, silhouette, effect, intensity, seed, radar, tierGlow, motif } = params;
  const px = size / 64; // Each "pixel" is size/64

  // Seeded random
  let rngState = seed || 42;
  const rng = () => {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    return rngState / 0x7fffffff;
  };

  // Clear
  ctx.fillStyle = palette?.bg || '#1a1816';
  ctx.fillRect(0, 0, size, size);

  // Vignette
  const gradient = ctx.createRadialGradient(size / 2, size * 0.4, size * 0.1, size / 2, size / 2, size * 0.7);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Ground line
  const groundY = size * 0.78;
  ctx.fillStyle = palette?.primary + '15' || '#d4a83215';
  ctx.fillRect(0, groundY, size, size - groundY);
  ctx.strokeStyle = palette?.primary + '30' || '#d4a83230';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(size, groundY);
  ctx.stroke();

  // Background particles/effect
  if (effect === 'embers' || effect === 'sparks') {
    for (let i = 0; i < 15; i++) {
      const x = rng() * size;
      const y = rng() * groundY;
      const s = (rng() * 2 + 1) * px;
      ctx.fillStyle = palette?.primary + (Math.floor(rng() * 40 + 20)).toString(16);
      ctx.fillRect(Math.floor(x / px) * px, Math.floor(y / px) * px, s, s);
    }
  } else if (effect === 'mist') {
    for (let i = 0; i < 8; i++) {
      const y = groundY - rng() * size * 0.3;
      ctx.fillStyle = palette?.accent + '08';
      ctx.fillRect(0, y, size, rng() * 4 * px);
    }
  } else if (effect === 'dust') {
    for (let i = 0; i < 20; i++) {
      const x = rng() * size;
      const y = groundY - rng() * size * 0.15;
      ctx.fillStyle = palette?.secondary + '30';
      ctx.fillRect(Math.floor(x / px) * px, Math.floor(y / px) * px, px, px);
    }
  }

  // Silhouette figure
  const figX = size / 2;
  const figY = groundY;
  const figH = size * 0.45;
  const figW = size * 0.18;

  drawSilhouette(ctx, figX, figY, figW, figH, px, palette, silhouette, intensity, rng);

  // Tier glow aura
  if (tierGlow) {
    const auraGrad = ctx.createRadialGradient(figX, figY - figH * 0.5, 0, figX, figY - figH * 0.5, figW * 2);
    auraGrad.addColorStop(0, palette?.primary + '20');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(figX - figW * 2, figY - figH - figW, figW * 4, figH + figW * 2);
  }

  // Motif symbol (top corner)
  drawMotif(ctx, motif, size * 0.85, size * 0.12, size * 0.08, palette?.primary + '40', px);

  // Radar mini-chart in corner
  if (radar) {
    drawMiniRadar(ctx, radar, size * 0.14, size * 0.86, size * 0.1, palette?.primary + '50');
  }

  // Frame border
  ctx.strokeStyle = palette?.primary + '18';
  ctx.lineWidth = px;
  ctx.strokeRect(px * 2, px * 2, size - px * 4, size - px * 4);

  // Inner frame
  ctx.strokeStyle = palette?.primary + '08';
  ctx.strokeRect(px * 4, px * 4, size - px * 8, size - px * 8);
}

function drawSilhouette(ctx, cx, groundY, w, h, px, palette, type, intensity, rng) {
  const col = palette?.primary || '#d4a832';
  const darkCol = palette?.secondary || '#8a6830';

  // Body block (simplified pixel figure)
  const bodyW = w;
  const bodyH = h;
  const headR = w * 0.35;
  const legSpread = type === 'striding' ? w * 0.6 : type === 'windswept' ? w * 0.4 : w * 0.15;
  const armAngle = type === 'windswept' ? 0.4 : type === 'ascending' ? 0.6 : 0.15;

  // Draw with pixel-aligned blocks
  const p = (x, y, w2, h2, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x / px) * px, Math.floor(y / px) * px, 
                 Math.ceil(w2 / px) * px, Math.ceil(h2 / px) * px);
  };

  // Shadow on ground
  ctx.fillStyle = '#00000030';
  p(cx - bodyW * 0.8, groundY - px, bodyW * 1.6, px * 2, '#00000020');

  // Legs
  const legTop = groundY - bodyH * 0.4;
  p(cx - legSpread - px * 2, legTop, px * 4, bodyH * 0.4, darkCol);
  p(cx + legSpread - px * 2, legTop, px * 4, bodyH * 0.4, darkCol);

  // Torso
  const torsoTop = groundY - bodyH * 0.75;
  p(cx - bodyW * 0.4, torsoTop, bodyW * 0.8, bodyH * 0.38, col);

  // Shoulders
  p(cx - bodyW * 0.5, torsoTop, bodyW, px * 3, col);

  // Arms
  const armLen = bodyH * 0.3;
  p(cx - bodyW * 0.5 - px * 3, torsoTop + armAngle * armLen, px * 3, armLen, darkCol);
  p(cx + bodyW * 0.5, torsoTop + armAngle * armLen * 0.5, px * 3, armLen, darkCol);

  // Head
  const headY = torsoTop - headR * 1.8;
  p(cx - headR, headY, headR * 2, headR * 2, col);

  // Eye dots
  p(cx - headR * 0.4, headY + headR * 0.6, px, px, palette?.bg || '#0e0c0a');
  p(cx + headR * 0.2, headY + headR * 0.6, px, px, palette?.bg || '#0e0c0a');

  // Cloak/cape for higher tiers
  if (intensity > 0.5) {
    ctx.fillStyle = darkCol + '60';
    const capeW = bodyW * 1.2;
    p(cx - capeW * 0.5, torsoTop + px * 2, capeW, bodyH * 0.5, darkCol + '40');
    // Cape flutter
    for (let i = 0; i < 3; i++) {
      p(cx + bodyW * 0.3 + rng() * px * 4, torsoTop + bodyH * 0.2 + i * px * 4, px * 2, px * 2, darkCol + '30');
    }
  }

  // Crown/marking for mythic
  if (intensity > 0.85) {
    p(cx - headR * 0.6, headY - px * 2, px * 2, px * 2, palette?.primary || '#d4a832');
    p(cx, headY - px * 3, px * 2, px * 3, palette?.primary || '#d4a832');
    p(cx + headR * 0.4, headY - px * 2, px * 2, px * 2, palette?.primary || '#d4a832');
  }
}

function drawMotif(ctx, motif, x, y, size, color, px) {
  ctx.strokeStyle = color;
  ctx.lineWidth = px * 0.8;
  ctx.fillStyle = 'none';

  switch (motif) {
    case 'mountain':
      ctx.beginPath();
      ctx.moveTo(x - size, y + size);
      ctx.lineTo(x, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.stroke();
      break;
    case 'flame':
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x + size * 0.5, y, x, y + size);
      ctx.quadraticCurveTo(x - size * 0.5, y, x, y - size);
      ctx.stroke();
      break;
    case 'compass':
      ctx.beginPath();
      ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
      ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
      ctx.stroke();
      break;
    case 'heartbeat':
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x - size * 0.3, y);
      ctx.lineTo(x - size * 0.1, y - size * 0.6);
      ctx.lineTo(x + size * 0.1, y + size * 0.4);
      ctx.lineTo(x + size * 0.3, y);
      ctx.lineTo(x + size, y);
      ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(x - size * 0.6, y - size * 0.7);
      ctx.lineTo(x + size * 0.6, y - size * 0.7);
      ctx.lineTo(x + size * 0.6, y + size * 0.2);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y + size * 0.2);
      ctx.closePath();
      ctx.stroke();
      break;
    default:
      // Footprint
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillRect(x - size * 0.15, y + size * 0.2, size * 0.1, size * 0.15);
      ctx.fillRect(x + size * 0.05, y + size * 0.2, size * 0.1, size * 0.15);
  }
}

function drawMiniRadar(ctx, radar, cx, cy, r, color) {
  const keys = ['velocity', 'endurance', 'ascent', 'stamina', 'cadence', 'fortitude', 'resilience', 'ranging'];
  const n = keys.length;
  const step = (2 * Math.PI) / n;

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  // Ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Data
  ctx.beginPath();
  keys.forEach((key, i) => {
    const val = (radar[key] || 0) / 100;
    const angle = step * i - Math.PI / 2;
    const x = cx + val * r * Math.cos(angle);
    const y = cy + val * r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color.replace(/[0-9a-f]{2}$/, '15');
  ctx.fill();
  ctx.stroke();
}

// ============================================================
// BOTTOM NAVIGATION
// ============================================================

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { path: '/dashboard', label: 'Build', icon: '⚔' },
    { path: '/skills', label: 'Skills', icon: '📊' },
    { path: '/runs', label: 'Runs', icon: '🏃' },
    { path: '/build/history', label: 'History', icon: '📜' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0c0a]/95 backdrop-blur-md border-t border-[#282420] safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.path || (tab.path !== '/dashboard' && pathname?.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors
                ${active ? 'text-[#d4a832]' : 'text-[#6a5e52]'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-display tracking-wider uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================
// UTILITY COMPONENTS
// ============================================================

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center">
      <div className="loading-pulse text-[#d4a832] font-display text-xl mb-4">⚔</div>
      <p className="text-[#6a5e52] text-sm">{message}</p>
    </div>
  );
}

export function OrnamentDivider({ children }) {
  return (
    <div className="ornament-divider text-xs font-display tracking-widest uppercase text-[#6a5e52] my-6">
      {children}
    </div>
  );
}

export function formatPace(secondsPerKm, imperial = false) {
  if (!secondsPerKm || secondsPerKm <= 0) return '--:--';
  const pace = imperial ? secondsPerKm * 1.60934 : secondsPerKm;
  const min = Math.floor(pace / 60);
  const sec = Math.floor(pace % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function formatDistance(meters, imperial = false) {
  if (imperial) return (meters / 1609.34).toFixed(2) + ' mi';
  return (meters / 1000).toFixed(2) + ' km';
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
