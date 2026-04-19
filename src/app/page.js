'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center',background:'#110e0a',color:'#ddd0b8',maxWidth:430,margin:'0 auto'}}>
      {/* Ambient glow */}
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 30%, rgba(232,192,80,.04), transparent 60%)',pointerEvents:'none',zIndex:0}} />

      {/* Logo */}
      <div style={{position:'relative',zIndex:1}}>
        <svg viewBox="0 0 80 80" style={{width:80,height:80,marginBottom:24,opacity:.7}}>
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e8c050" strokeWidth=".5" opacity=".3"/>
          <circle cx="40" cy="40" r="26" fill="none" stroke="#e8c050" strokeWidth=".4" opacity=".15"/>
          <line x1="40" y1="10" x2="40" y2="70" stroke="#e8c050" strokeWidth=".5" opacity=".2"/>
          <line x1="10" y1="40" x2="70" y2="40" stroke="#e8c050" strokeWidth=".5" opacity=".2"/>
          <line x1="18" y1="18" x2="62" y2="62" stroke="#e8c050" strokeWidth=".4" opacity=".12"/>
          <line x1="62" y1="18" x2="18" y2="62" stroke="#e8c050" strokeWidth=".4" opacity=".12"/>
          <circle cx="40" cy="40" r="4" fill="#e8c050" opacity=".6"/>
          <polygon points="40,14 43,34 40,32 37,34" fill="#e8c050" opacity=".4"/>
        </svg>

        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:'#ddd0b8',letterSpacing:6,marginBottom:8}}>SOLESTRIDE</h1>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:'#685e4e',lineHeight:1.6,maxWidth:300,margin:'0 auto 32px'}}>
          Your running history, decoded into 8 skills, a unique build archetype, and a complete evolution timeline.
        </p>
      </div>

      {/* Value props */}
      <div style={{position:'relative',zIndex:1,maxWidth:320,marginBottom:32}}>
        {[
          {icon:'⚡',text:'8 skills scored against universal human ceilings — from speed to consistency to exploration'},
          {icon:'🐴',text:'1,225 unique builds. Your archetype, tier, and modifier are determined by how you actually run'},
          {icon:'◈',text:'Full history reconstruction — see every build you\'ve held since your first logged run'},
        ].map((item,i)=>(
          <div key={i} style={{display:'flex',gap:12,marginBottom:16,textAlign:'left'}}>
            <span style={{fontSize:20,flexShrink:0,marginTop:2}}>{item.icon}</span>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#b0a088',lineHeight:1.6}}>{item.text}</p>
          </div>
        ))}
      </div>

      {/* Strava button */}
      <div style={{position:'relative',zIndex:1}}>
        <a
          href="/api/auth/strava"
          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 32px',borderRadius:3,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#fc4c02,#e84400)',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:16,textDecoration:'none'}}
        >
          <svg viewBox="0 0 24 24" style={{width:20,height:20}} fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
          </svg>
          Connect with Strava
        </a>
      </div>

      {error && (
        <p style={{marginTop:16,padding:'8px 16px',borderRadius:3,background:'rgba(192,64,64,.15)',border:'1px solid rgba(192,64,64,.2)',color:'#c04040',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
          {error === 'auth_denied' ? 'Authorization was denied. Please try again.' :
           error === 'token_failed' ? 'Authentication failed. Please try again.' :
           'Something went wrong. Please try again.'}
        </p>
      )}

      {/* Footer */}
      <p style={{marginTop:40,fontSize:10,color:'rgba(100,90,70,.4)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
        No maps. No social. No tracking.<br/>Your data stays private. Always.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#110e0a'}}>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:20,color:'#e8c050',letterSpacing:4}}>SOLESTRIDE</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
