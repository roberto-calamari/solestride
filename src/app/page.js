'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
      textAlign: 'center', background: '#110e0a', color: '#ddd0b8',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: 24, opacity: 0.7 }}>
        <circle cx="40" cy="40" r="36" fill="none" stroke="#e8c050" strokeWidth="0.5" opacity="0.3"/>
        <circle cx="40" cy="40" r="26" fill="none" stroke="#e8c050" strokeWidth="0.4" opacity="0.15"/>
        <line x1="40" y1="10" x2="40" y2="70" stroke="#e8c050" strokeWidth="0.5" opacity="0.2"/>
        <line x1="10" y1="40" x2="70" y2="40" stroke="#e8c050" strokeWidth="0.5" opacity="0.2"/>
        <circle cx="40" cy="40" r="4" fill="#e8c050" opacity="0.6"/>
        <polygon points="40,14 43,34 40,32 37,34" fill="#e8c050" opacity="0.4"/>
      </svg>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 700, letterSpacing: 6, marginBottom: 8 }}>SOLESTRIDE</h1>
      <p style={{ fontSize: 16, color: '#b0a088', marginBottom: 8 }}>Your running history, rebuilt as an RPG character codex.</p>
      <p style={{ fontSize: 13, color: '#685e4e', maxWidth: 300, marginBottom: 32, lineHeight: 1.6 }}>
        Connect your Strava account. Solestride will import your entire outdoor run history
        and reconstruct your full skill evolution from your very first logged run.
      </p>
      <a href="/api/auth/strava" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        padding: '14px 32px', borderRadius: 3, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #fc4c02, #e84400)', color: '#fff',
        textDecoration: 'none', width: '100%', maxWidth: 300,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
        Connect with Strava
      </a>
      {error && (
        <div style={{
          marginTop: 16, padding: '10px 20px', borderRadius: 3,
          background: 'rgba(180,50,50,0.15)', border: '1px solid rgba(180,50,50,0.25)',
          color: '#c04040', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        }}>
          {error === 'token_failed' ? 'Authentication failed. Please try again.' :
           error === 'auth_denied' ? 'Authorization was denied.' :
           'Something went wrong. Please try again.'}
        </div>
      )}
      <p style={{ marginTop: 40, fontSize: 11, color: 'rgba(100,90,70,0.4)', lineHeight: 1.5 }}>
        No maps. No social. No tracking.<br/>Your data stays private.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#110e0a' }} />}>
      <LoginContent />
    </Suspense>
  );
}
