'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkillBar, RadarChart, BottomNav, LoadingScreen, OrnamentDivider, SKILL_META } from '../../components/ui';

export default function SkillsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user?section=profile')
      .then(r => r.ok ? r.json() : Promise.reject('Not authenticated'))
      .then(setData)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data?.currentSkills) {
    return (
      <div className="min-h-dvh px-5 pt-12 pb-28 safe-top text-center">
        <p className="text-[#6a5e52]">No skill data yet. Sync your Strava first.</p>
        <BottomNav />
      </div>
    );
  }

  const skills = data.currentSkills;

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      <div className="mb-6 page-enter">
        <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Character Sheet</p>
        <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">Skill Profile</h1>
      </div>

      {/* Radar */}
      <div className="mb-6 page-enter" style={{ animationDelay: '0.1s' }}>
        <RadarChart skills={skills} size={280} />
      </div>

      <OrnamentDivider>All Skills</OrnamentDivider>

      {/* Detailed skill bars */}
      <div className="space-y-5 page-enter" style={{ animationDelay: '0.2s' }}>
        {Object.entries(SKILL_META).map(([key, meta], i) => {
          const skill = skills[key];
          return (
            <button
              key={key}
              onClick={() => router.push(`/skills/${key}`)}
              className="w-full text-left card-dark p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <span className="font-display text-sm tracking-wide text-[#e8dcc8] uppercase block">
                      {meta.name}
                    </span>
                    <span className="text-[#6a5e52] text-xs">{meta.desc}</span>
                  </div>
                </div>
                <span className="font-mono text-xl text-[#d4a832] tabular-nums">
                  {Math.round(skill?.score || 0)}
                </span>
              </div>
              <div className="h-2 bg-[#1a1816] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full skill-bar-fill"
                  style={{
                    '--fill': `${Math.min(skill?.score || 0, 100)}%`,
                    background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              {/* Quick detail */}
              {skill?.detail?.runs_used !== undefined && (
                <div className="flex gap-3 mt-2 text-[#4a4038] text-xs">
                  <span>{skill.detail.runs_used} runs used</span>
                  {skill.detail.requires_hr && <span>Requires HR</span>}
                  {skill.detail.requires_cadence && <span>Requires cadence</span>}
                  {skill.detail.inactivity_days && (
                    <span className="text-[#c94444]">
                      {Math.round(skill.detail.inactivity_days)}d inactive
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
