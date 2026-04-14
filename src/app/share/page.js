'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen, RadarChart, BuildArt, SKILL_META, BottomNav } from '../../components/ui';

export default function SharePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardType, setCardType] = useState('build');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user?section=profile')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setProfile)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, []);

  async function shareCard() {
    if (!cardRef.current) return;

    try {
      // Use html-to-image if available, otherwise try canvas screenshot
      const canvas = await htmlToCanvas(cardRef.current);
      canvas.toBlob(async (blob) => {
        if (navigator.share && blob) {
          const file = new File([blob], 'solestride-card.png', { type: 'image/png' });
          try {
            await navigator.share({
              title: 'My Solestride Build',
              files: [file],
            });
          } catch (e) {
            // Fallback: download
            downloadBlob(blob);
          }
        } else if (blob) {
          downloadBlob(blob);
        }
      }, 'image/png');
    } catch (e) {
      console.error('Share failed:', e);
    }
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solestride-card.png';
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <LoadingScreen />;
  if (!profile?.currentBuild) {
    return (
      <div className="min-h-dvh px-5 pt-12 pb-28 safe-top text-center">
        <p className="text-[#6a5e52]">No build to share yet.</p>
        <BottomNav />
      </div>
    );
  }

  const { currentBuild: build, currentSkills: skills, user } = profile;

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      <div className="flex items-center gap-3 mb-6 page-enter">
        <button onClick={() => router.back()} className="text-[#6a5e52] text-2xl">←</button>
        <div>
          <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Share</p>
          <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">Build Card</h1>
        </div>
      </div>

      {/* Card type selector */}
      <div className="flex gap-2 mb-6 page-enter" style={{ animationDelay: '0.1s' }}>
        {[
          { id: 'build', label: 'Build' },
          { id: 'skills', label: 'Skills' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setCardType(t.id)}
            className={`flex-1 py-2 rounded text-sm font-display tracking-wider
              ${cardType === t.id
                ? 'bg-[#d4a832]/15 text-[#d4a832] border border-[#d4a832]/30'
                : 'bg-[#1a1816] text-[#6a5e52] border border-transparent'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card preview */}
      <div className="flex justify-center mb-6 page-enter" style={{ animationDelay: '0.2s' }}>
        <div
          ref={cardRef}
          className="w-[340px] rounded-xl overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #1a1816, #0e0c0a)' }}
        >
          {cardType === 'build' ? (
            <BuildCard build={build} skills={skills} />
          ) : (
            <SkillsCard skills={skills} build={build} />
          )}
        </div>
      </div>

      {/* Share actions */}
      <div className="flex gap-3 justify-center page-enter" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={shareCard}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#d4a832] to-[#b08820]
                     text-[#0e0c0a] font-display font-semibold tracking-wider
                     active:scale-[0.97] transition-transform"
        >
          {copied ? 'Downloaded!' : 'Share / Save'}
        </button>
      </div>

      <p className="text-center text-[#4a4038] text-xs mt-4 page-enter" style={{ animationDelay: '0.35s' }}>
        No maps or location data included. Privacy safe.
      </p>

      <BottomNav />
    </div>
  );
}

function BuildCard({ build, skills }) {
  return (
    <div className="p-5">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="font-display text-[10px] text-[#d4a832]/50 tracking-[0.3em] uppercase">Solestride</p>
      </div>

      {/* Art */}
      <div className="flex justify-center mb-4">
        <BuildArt artParams={build?.art_params} size={160} />
      </div>

      {/* Build name */}
      <div className="text-center mb-4">
        <h2 className="font-display text-lg text-[#e8dcc8] tracking-wide">
          {build?.full_name}
        </h2>
        <p className="text-[#6a5e52] text-xs mt-1 capitalize">
          {build?.tier} · {build?.archetype}
        </p>
      </div>

      {/* Mini radar */}
      <div className="flex justify-center mb-4">
        <RadarChart skills={skills} size={180} />
      </div>

      {/* Lore excerpt */}
      <p className="text-[#a09080] text-xs text-center italic leading-relaxed px-2">
        "{(build?.lore_text || '').slice(0, 120)}..."
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#282420] text-center">
        <p className="text-[#4a4038] text-[9px] font-display tracking-[0.2em] uppercase">
          solestride.app
        </p>
      </div>
    </div>
  );
}

function SkillsCard({ skills, build }) {
  return (
    <div className="p-5">
      <div className="text-center mb-4">
        <p className="font-display text-[10px] text-[#d4a832]/50 tracking-[0.3em] uppercase">Solestride</p>
        <h2 className="font-display text-base text-[#e8dcc8] tracking-wide mt-1">
          {build?.full_name}
        </h2>
      </div>

      {/* Skill list */}
      <div className="space-y-3 mb-4">
        {Object.entries(SKILL_META).map(([key, meta]) => {
          const score = skills?.[key]?.score || 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{meta.icon}</span>
                  <span className="font-display text-[11px] text-[#a09080] uppercase tracking-wider">
                    {meta.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-[#d4a832]">{Math.round(score)}</span>
              </div>
              <div className="h-1.5 bg-[#282420] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(score, 100)}%`,
                  background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Average */}
      <div className="text-center pt-3 border-t border-[#282420]">
        <span className="font-mono text-lg text-[#d4a832]">
          {Math.round(Object.values(skills || {}).reduce((s, v) => s + (v?.score || 0), 0) / 8)}
        </span>
        <span className="text-[#6a5e52] text-xs ml-2">avg score</span>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[#4a4038] text-[9px] font-display tracking-[0.2em] uppercase">
          solestride.app
        </p>
      </div>
    </div>
  );
}

// Simple canvas capture fallback
async function htmlToCanvas(element) {
  const canvas = document.createElement('canvas');
  const rect = element.getBoundingClientRect();
  const scale = 2; // 2x for retina
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  
  // Draw background
  ctx.fillStyle = '#0e0c0a';
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Use SVG foreignObject approach
  const data = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${element.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      // Fallback: just return a simple canvas with text
      ctx.fillStyle = '#d4a832';
      ctx.font = '16px serif';
      ctx.fillText('Solestride Build Card', 20, 40);
      resolve(canvas);
    };
    img.src = url;
  });
}
