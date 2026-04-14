'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, LoadingScreen, OrnamentDivider, BuildArt, formatDate } from '../../../components/ui';

export default function BuildHistoryPage() {
  const [builds, setBuilds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user?section=builds')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBuilds)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!builds || builds.length === 0) {
    return (
      <div className="min-h-dvh px-5 pt-12 pb-28 safe-top text-center">
        <p className="text-[#6a5e52]">No build history yet.</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      <div className="mb-6 page-enter">
        <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Build Evolution</p>
        <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">History</h1>
        <p className="text-[#4a4038] text-xs mt-1">{builds.length} meaningful build changes recorded</p>
      </div>

      <div className="space-y-3">
        {builds.map((build, i) => {
          const isLatest = i === 0;
          const isExpanded = expanded === build.id;

          return (
            <div
              key={build.id}
              className={`card-dark overflow-hidden page-enter ${isLatest ? 'border-l-2 border-[#d4a832]/30' : ''}`}
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : build.id)}
                className="w-full text-left p-4 active:bg-[#282420]/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isLatest && (
                        <span className="px-1.5 py-0.5 rounded bg-[#d4a832]/10 text-[#d4a832] text-[10px] font-display">
                          ACTIVE
                        </span>
                      )}
                      <span className="text-[#6a5e52] text-xs">{formatDate(build.effective_date)}</span>
                    </div>
                    <h3 className="font-display text-base text-[#e8dcc8] tracking-wide mt-1">
                      {build.full_name}
                    </h3>
                    <p className="text-[#6a5e52] text-xs mt-1 capitalize">
                      {build.tier} · {build.archetype}
                      {build.modifier ? ` · ${build.modifier}` : ''}
                    </p>
                  </div>
                  <span className="text-[#4a4038] text-lg">{isExpanded ? '−' : '+'}</span>
                </div>

                {/* Change reason */}
                {build.change_reason && (
                  <p className="text-[#a09080] text-xs mt-2 italic">
                    {build.change_reason}
                  </p>
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#282420]">
                  <div className="flex gap-4">
                    <BuildArt artParams={build.art_params} size={100} />
                    <div className="flex-1">
                      <p className="text-[#a09080] text-xs leading-relaxed italic">
                        "{build.lore_text}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
