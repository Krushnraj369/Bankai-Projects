import React from 'react';

interface LogoProps {
  theme: 'light' | 'dark' | 'cosmic';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ theme, className = "", showText = true }) => {
  // Define colors based on theme
  const colors = {
    light: {
      primary: '#4f46e5',   // Indigo-600
      secondary: '#0ea5e9', // Sky-500
      text: '#0f172a'       // Slate-900
    },
    dark: {
      primary: '#818cf8',   // Indigo-400
      secondary: '#38bdf8', // Sky-400
      text: '#f8fafc'       // Slate-50
    },
    cosmic: {
      primary: '#a78bfa',   // Violet-400
      secondary: '#c084fc', // Purple-400
      text: '#e2e8f0'       // Slate-200
    }
  };

  const activeColors = colors[theme] || colors.light;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Abstract "Bankai" Symbol - Resembling a releasing energy vortex */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <defs>
          <linearGradient id={`grad-${theme}`} x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor={activeColors.primary} />
            <stop offset="100%" stopColor={activeColors.secondary} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Outer Ring Segments */}
        <path 
          d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 28.8366 36 20" 
          stroke={`url(#grad-${theme})`} 
          strokeWidth="3" 
          strokeLinecap="round"
          className="opacity-20"
        />
        
        {/* Inner Swirls - The "Release" */}
        <path 
          d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30" 
          stroke={`url(#grad-${theme})`} 
          strokeWidth="3" 
          strokeLinecap="round"
          pathLength="1"
          className="animate-[spin_10s_linear_infinite_reverse]"
          style={{ transformOrigin: 'center' }}
        />
        
        <path 
          d="M26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20" 
          stroke={activeColors.secondary} 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="animate-[spin_6s_linear_infinite]"
          style={{ transformOrigin: 'center' }}
        />

        {/* Central Core */}
        <circle cx="20" cy="20" r="3" fill={activeColors.primary} filter={theme === 'cosmic' ? 'url(#glow)' : ''} />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight leading-none" style={{ color: activeColors.text }}>
            Bankai<span style={{ color: activeColors.secondary }}>QA</span>
          </span>
          <span className="text-[10px] font-medium tracking-widest opacity-60 uppercase" style={{ color: activeColors.text }}>
            Test OS
          </span>
        </div>
      )}
    </div>
  );
};