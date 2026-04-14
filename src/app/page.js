'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      {/* Atmospheric background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0e0c0a] via-[#1a1614] to-[#0e0c0a] -z-10" />
      <div className="fixed inset-0 opacity-[0.015] -z-10" style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(212, 168, 50, 0.3), transparent 60%)`
      }} />

      {/* Logo area */}
      <div className="mb-12 text-center page-enter">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <svg viewBox="0 0 80 80" className="w-full h-full candle-glow">
            <defs>
              <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#d4a832" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#d4a832" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="38" fill="none" stroke="#d4a832" strokeWidth="0.5" opacity="0.3" />
            <circle cx="40" cy="40" r="28" fill="url(#glow)" opacity="0.4" />
            {/* Stylized footprint/compass */}
            <path d="M40 15 L40 65 M25 40 L55 40 M30 25 L50 55 M50 25 L30 55" 
                  stroke="#d4a832" strokeWidth="0.8" opacity="0.4" fill="none" />
            <circle cx="40" cy="40" r="4" fill="#d4a832" opacity="0.7" />
          </svg>
        </div>
        
        <h1 className="font-display text-3xl font-semibold tracking-wider text-[#e8dcc8] mb-3">
          SOLESTRIDE
        </h1>
        <p className="font-body text-[#a09080] text-lg leading-relaxed max-w-xs mx-auto">
          Your running history, rebuilt as an RPG character codex.
        </p>
      </div>

      {/* Description */}
      <div className="mb-10 text-center max-w-sm page-enter" style={{ animationDelay: '0.15s' }}>
        <p className="text-[#7a6e62] text-sm leading-relaxed">
          Connect your Strava account. Solestride will import your entire outdoor run history 
          and reconstruct your full skill evolution from your very first logged run.
        </p>
      </div>

      {/* Strava connect button */}
      <div className="page-enter" style={{ animationDelay: '0.3s' }}>
        <a
          href="/api/auth/strava"
          className="group flex items-center gap-3 px-8 py-4 rounded-lg
                     bg-gradient-to-r from-[#fc4c02] to-[#e84400]
                     text-white font-body font-semibold text-lg
                     shadow-lg shadow-[#fc4c02]/20
                     active:scale-[0.97] transition-transform duration-150"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connect with Strava
        </a>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-lg bg-[#5e1a1a]/30 border border-[#c94444]/20 text-[#c94444] text-sm text-center max-w-sm">
          {error === 'auth_denied' && 'Authorization was denied. Please try again.'}
          {error === 'token_failed' && 'Authentication failed. Please try again.'}
          {error === 'server_error' && 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center page-enter" style={{ animationDelay: '0.45s' }}>
        <p className="text-[#4a4038] text-xs">
          No maps. No social. No tracking.<br />
          Your data stays private.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="loading-pulse text-[#d4a832] font-display text-xl">SOLESTRIDE</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
