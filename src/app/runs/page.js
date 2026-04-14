'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, LoadingScreen, formatPace, formatDistance, formatDuration, formatDate } from '../../components/ui';

const WORKOUT_COLORS = {
  easy: '#5a8a6e',
  long_run: '#5a7a9a',
  tempo: '#e8c55a',
  intervals: '#c94444',
  hill_effort: '#8b7355',
  race: '#d4a832',
  steady_aerobic: '#5a9aa0',
  unclassified: '#4a4038',
};

const WORKOUT_LABELS = {
  easy: 'Easy',
  long_run: 'Long Run',
  tempo: 'Tempo',
  intervals: 'Intervals',
  hill_effort: 'Hill',
  race: 'Race',
  steady_aerobic: 'Aerobic',
  unclassified: 'Unclassified',
};

export default function RunsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch(`/api/user?section=activities&page=${page}`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/user?section=profile').then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([acts, prof]) => {
        setData(acts);
        setSettings(prof?.user);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingScreen />;

  const imperial = settings?.unit_preference === 'imperial';
  const activities = data?.activities || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      <div className="mb-6 page-enter">
        <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Activity Log</p>
        <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">Runs</h1>
        <p className="text-[#4a4038] text-xs mt-1">{total} activities total</p>
      </div>

      <div className="space-y-2">
        {activities.map((act, i) => {
          const type = act.override_type || act.inferred_type || 'unclassified';
          const excluded = !act.included || act.override_excluded;

          return (
            <div
              key={act.id}
              className={`card-dark p-3 page-enter ${excluded ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-display tracking-wider uppercase"
                      style={{
                        color: WORKOUT_COLORS[type] || '#4a4038',
                        background: (WORKOUT_COLORS[type] || '#4a4038') + '15',
                      }}
                    >
                      {WORKOUT_LABELS[type] || type}
                    </span>
                    {excluded && (
                      <span className="px-1.5 py-0.5 rounded bg-[#c94444]/10 text-[#c94444] text-[9px] font-display">
                        EXCLUDED
                      </span>
                    )}
                    {act.override_type && (
                      <span className="text-[#d4a832] text-[9px]">✎</span>
                    )}
                  </div>
                  <p className="text-[#e8dcc8] text-sm truncate">{act.name}</p>
                  <p className="text-[#6a5e52] text-xs">{formatDate(act.start_date_local)}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-mono text-sm text-[#e8dcc8]">
                    {formatDistance(act.distance_m, imperial)}
                  </p>
                  <p className="font-mono text-xs text-[#a09080]">
                    {formatPace(act.pace_per_km_s, imperial)}{imperial ? '/mi' : '/km'}
                  </p>
                  <p className="text-[#4a4038] text-xs">
                    {formatDuration(act.moving_time_s)}
                  </p>
                </div>
              </div>

              {/* Metric badges */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {act.wa_score > 0 && (
                  <span className="text-[#d4a832] text-[10px] font-mono">WA:{Math.round(act.wa_score)}</span>
                )}
                {act.average_heartrate > 0 && (
                  <span className="text-[#c94444] text-[10px] font-mono">♥{Math.round(act.average_heartrate)}</span>
                )}
                {act.total_elevation_gain_m > 10 && (
                  <span className="text-[#8b7355] text-[10px] font-mono">↑{Math.round(act.total_elevation_gain_m)}m</span>
                )}
                {excluded && act.exclude_reason && (
                  <span className="text-[#4a4038] text-[10px]">{act.exclude_reason}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded bg-[#282420] text-[#a09080] text-sm disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-[#6a5e52] text-xs">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded bg-[#282420] text-[#a09080] text-sm disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
