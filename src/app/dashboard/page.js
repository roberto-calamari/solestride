'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkillBar, RadarChart, BuildArt, BottomNav, LoadingScreen, OrnamentDivider, SKILL_META } from '../../components/ui';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/user?section=profile');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const json = await res.json();
      setData(json);
      
      // If no sync has happened, prompt sync
      if (json.syncStatus?.status === 'none') {
        setSyncProgress({ status: 'needs_sync' });
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  }

  async function startSync() {
    setSyncing(true);
    setSyncProgress({ status: 'running', imported: 0, total: 0 });
    
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const result = await res.json();
      setSyncProgress(result);
      
      if (result.status === 'completed') {
        // Refresh profile
        await fetchProfile();
      }
    } catch (e) {
      setSyncProgress({ status: 'failed', error: e.message });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) return <LoadingScreen message="Loading your codex..." />;

  // First-time sync prompt
  if (!data?.currentBuild) {
    return (
      <div className="min-h-dvh px-5 pt-12 pb-28 safe-top">
        <div className="text-center mb-10 page-enter">
          <h1 className="font-display text-2xl text-[#d4a832] tracking-wider mb-2">SOLESTRIDE</h1>
          <p className="text-[#a09080] text-sm">
            Welcome, {data?.user?.strava_firstname || 'Runner'}.
          </p>
        </div>

        {syncProgress?.status === 'running' ? (
          <div className="card-dark p-6 text-center page-enter">
            <div className="loading-pulse text-[#d4a832] text-4xl mb-4">⚔</div>
            <p className="font-display text-sm text-[#e8dcc8] mb-2">Importing your history...</p>
            <p className="text-[#6a5e52] text-xs">
              {syncProgress.imported || 0} activities imported
            </p>
            <div className="mt-4 h-1 bg-[#282420] rounded-full overflow-hidden">
              <div className="h-full bg-[#d4a832] rounded-full transition-all duration-500"
                   style={{ width: `${syncProgress.total ? (syncProgress.imported / syncProgress.total * 100) : 10}%` }} />
            </div>
            <p className="text-[#4a4038] text-xs mt-3">
              This may take a few minutes for large histories.
              Your session is preserved if it pauses.
            </p>
          </div>
        ) : syncProgress?.status === 'completed' ? (
          <div className="card-dark p-6 text-center page-enter">
            <p className="text-[#5a8a6e] text-lg mb-2">✓ Import complete</p>
            <p className="text-[#a09080] text-sm">Refreshing your profile...</p>
          </div>
        ) : syncProgress?.status === 'failed' ? (
          <div className="card-dark p-6 text-center page-enter">
            <p className="text-[#c94444] text-sm mb-3">Sync encountered an issue</p>
            <p className="text-[#6a5e52] text-xs mb-4">{syncProgress.error}</p>
            <button onClick={startSync} className="px-6 py-2 rounded-lg bg-[#282420] text-[#d4a832] font-display text-sm">
              Retry
            </button>
          </div>
        ) : (
          <div className="card-dark p-6 text-center page-enter">
            <p className="text-[#a09080] text-sm mb-4">
              Import your full Strava run history to reconstruct your build evolution
              from your very first logged run.
            </p>
            <button
              onClick={startSync}
              disabled={syncing}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#d4a832] to-[#b08820]
                         text-[#0e0c0a] font-display font-semibold tracking-wider
                         active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync with Strava'}
            </button>
          </div>
        )}

        <BottomNav />
      </div>
    );
  }

  const { currentBuild, currentSkills, user, activityCount } = data;
  const skills = currentSkills || {};
  const build = currentBuild;

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-enter">
        <div>
          <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Active Build</p>
          <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">
            {build?.full_name || 'Unknown'}
          </h1>
        </div>
        <button
          onClick={startSync}
          disabled={syncing}
          className="px-3 py-1.5 rounded-md bg-[#282420] text-[#d4a832] text-xs font-display
                     active:scale-95 transition-transform disabled:opacity-50"
        >
          {syncing ? '...' : 'Sync'}
        </button>
      </div>

      {/* Build Art */}
      <div className="flex justify-center mb-6 page-enter" style={{ animationDelay: '0.1s' }}>
        <div className="relative">
          <BuildArt artParams={build?.art_params} size={200} />
          {/* Tier badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                          bg-[#0e0c0a] border border-[#d4a832]/20">
            <span className="font-display text-[10px] text-[#d4a832] tracking-widest uppercase">
              {build?.tier || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Lore card */}
      <div className="card-dark p-4 mb-6 page-enter" style={{ animationDelay: '0.2s' }}>
        <p className="text-[#a09080] text-sm leading-relaxed italic">
          "{build?.lore_text}"
        </p>
      </div>

      {/* Radar chart */}
      <div className="page-enter" style={{ animationDelay: '0.3s' }}>
        <RadarChart skills={skills} size={260} />
      </div>

      <OrnamentDivider>Skills</OrnamentDivider>

      {/* Skill bars */}
      <div className="space-y-4 page-enter" style={{ animationDelay: '0.4s' }}>
        {Object.entries(SKILL_META).map(([key, meta], i) => (
          <SkillBar
            key={key}
            skill={key}
            score={skills[key]?.score || 0}
            delay={i * 80}
            onClick={() => router.push(`/skills/${key}`)}
          />
        ))}
      </div>

      <OrnamentDivider>Stats</OrnamentDivider>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 page-enter" style={{ animationDelay: '0.5s' }}>
        <div className="card-dark p-3 text-center">
          <p className="font-mono text-lg text-[#d4a832]">{activityCount}</p>
          <p className="text-[#6a5e52] text-xs mt-1">Runs</p>
        </div>
        <div className="card-dark p-3 text-center">
          <p className="font-mono text-lg text-[#d4a832]">
            {build?.archetype || '—'}
          </p>
          <p className="text-[#6a5e52] text-xs mt-1">Archetype</p>
        </div>
        <div className="card-dark p-3 text-center">
          <p className="font-mono text-lg text-[#d4a832]">
            {Math.round(Object.values(skills).reduce((s, v) => s + (v?.score || 0), 0) / 8)}
          </p>
          <p className="text-[#6a5e52] text-xs mt-1">Avg Score</p>
        </div>
      </div>

      {/* Share button */}
      <div className="mt-8 flex justify-center page-enter" style={{ animationDelay: '0.6s' }}>
        <button
          onClick={() => router.push('/share')}
          className="px-6 py-2.5 rounded-lg bg-[#282420] border border-[#d4a832]/15
                     text-[#d4a832] font-display text-sm tracking-wider
                     active:scale-[0.97] transition-transform"
        >
          Share Build Card
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
