'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav, LoadingScreen, OrnamentDivider } from '../../components/ui';

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user?section=profile')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setProfile)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, []);

  async function updateSetting(key, value) {
    setSaving(true);
    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-settings', [key]: value }),
      });
      setProfile(p => ({ ...p, user: { ...p.user, [key]: value } }));
    } catch (e) {
      console.error('Failed to update:', e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'disconnect' }),
    });
    router.push('/');
  }

  async function handleDelete() {
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-all' }),
    });
    router.push('/');
  }

  if (loading) return <LoadingScreen />;

  const user = profile?.user;

  return (
    <div className="min-h-dvh px-5 pt-8 pb-28 safe-top">
      <div className="mb-6 page-enter">
        <p className="text-[#6a5e52] text-xs font-display tracking-widest uppercase">Settings</p>
        <h1 className="font-display text-xl text-[#e8dcc8] tracking-wide mt-1">
          {user?.strava_firstname || 'Runner'}
        </h1>
      </div>

      {/* Sync info */}
      <div className="card-dark p-4 mb-4 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#a09080] text-sm">Strava Connected</p>
            <p className="text-[#4a4038] text-xs mt-1">
              {profile?.activityCount || 0} runs imported
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 rounded bg-[#282420] text-[#d4a832] text-xs font-display"
          >
            Sync
          </button>
        </div>
      </div>

      <OrnamentDivider>Display</OrnamentDivider>

      {/* Unit preference */}
      <div className="card-dark p-4 mb-4 page-enter" style={{ animationDelay: '0.1s' }}>
        <p className="text-[#a09080] text-sm mb-3">Units</p>
        <div className="flex gap-2">
          {['metric', 'imperial'].map(unit => (
            <button
              key={unit}
              onClick={() => updateSetting('unit_preference', unit)}
              className={`flex-1 py-2 rounded text-sm font-display tracking-wider capitalize
                ${user?.unit_preference === unit
                  ? 'bg-[#d4a832]/15 text-[#d4a832] border border-[#d4a832]/30'
                  : 'bg-[#1a1816] text-[#6a5e52] border border-transparent'
                }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitive mode */}
      <div className="card-dark p-4 mb-4 page-enter" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#a09080] text-sm">Sensitive Viewing Mode</p>
            <p className="text-[#4a4038] text-xs mt-1">Hides personal details on screen</p>
          </div>
          <button
            onClick={() => updateSetting('sensitive_mode', user?.sensitive_mode ? 0 : 1)}
            className={`w-12 h-7 rounded-full transition-colors relative
              ${user?.sensitive_mode ? 'bg-[#d4a832]/30' : 'bg-[#282420]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-[#e8dcc8] absolute top-1 transition-transform
              ${user?.sensitive_mode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <OrnamentDivider>Data</OrnamentDivider>

      {/* Export */}
      <div className="card-dark p-4 mb-4 page-enter" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#a09080] text-sm">Export My Data</p>
            <p className="text-[#4a4038] text-xs mt-1">Download all processed data as JSON</p>
          </div>
          <a
            href="/api/export"
            download
            className="px-3 py-1.5 rounded bg-[#282420] text-[#5a8a6e] text-xs font-display"
          >
            Export
          </a>
        </div>
      </div>

      <OrnamentDivider>Privacy</OrnamentDivider>

      {/* Disconnect Strava */}
      <div className="card-dark p-4 mb-4 page-enter" style={{ animationDelay: '0.25s' }}>
        {confirmDisconnect ? (
          <div>
            <p className="text-[#c94444] text-sm mb-3">Disconnect from Strava? Your data will be kept.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                className="flex-1 py-2 rounded bg-[#c94444]/15 text-[#c94444] text-sm font-display"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="flex-1 py-2 rounded bg-[#282420] text-[#6a5e52] text-sm font-display"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDisconnect(true)}
            className="w-full text-left flex items-center justify-between"
          >
            <div>
              <p className="text-[#a09080] text-sm">Disconnect Strava</p>
              <p className="text-[#4a4038] text-xs mt-1">Revokes access but keeps your data</p>
            </div>
            <span className="text-[#6a5e52]">→</span>
          </button>
        )}
      </div>

      {/* Delete all data */}
      <div className="card-dark p-4 mb-4 border border-[#c94444]/10 page-enter" style={{ animationDelay: '0.3s' }}>
        {confirmDelete ? (
          <div>
            <p className="text-[#c94444] text-sm mb-3">
              Permanently delete ALL your data? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded bg-[#c94444] text-white text-sm font-display"
              >
                Delete Everything
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded bg-[#282420] text-[#6a5e52] text-sm font-display"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full text-left flex items-center justify-between"
          >
            <div>
              <p className="text-[#c94444] text-sm">Delete All My Data</p>
              <p className="text-[#4a4038] text-xs mt-1">Permanently erases everything</p>
            </div>
            <span className="text-[#6a5e52]">→</span>
          </button>
        )}
      </div>

      {/* App info */}
      <div className="text-center mt-8 page-enter" style={{ animationDelay: '0.35s' }}>
        <p className="text-[#4a4038] text-xs font-display tracking-wider">SOLESTRIDE v1.0</p>
        <p className="text-[#363230] text-xs mt-1">No maps · No social · Your data is private</p>
      </div>

      <BottomNav />
    </div>
  );
}
