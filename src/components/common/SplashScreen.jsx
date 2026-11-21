import React, { useState, useEffect } from 'react';
import RoshniLogo from './RoshniLogo';

export const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 700);
    }, 3000); // 3 seconds display
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-ivory-50 via-cream to-sage-50 transition-opacity duration-700 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative text-center p-8 max-w-lg space-y-6">
        {/* Glowing Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-sage-200 via-sand to-terracotta/30 rounded-full blur-3xl animate-pulse-subtle pointer-events-none -z-10" />

        {/* Radiant Animated Logo */}
        <div className="inline-flex items-center justify-center animate-float">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-sage via-olive to-terracotta p-1 shadow-2xl shadow-sage-600/30">
            <div className="w-full h-full rounded-[22px] bg-ivory-50 flex items-center justify-center">
              <svg className="w-16 h-16 text-sage-600 animate-pulse-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3.5" fill="#D9825B" fillOpacity="0.3" stroke="#D9825B" />
                <circle cx="12" cy="12" r="1.5" fill="#3D3328" />
                <path d="M12 4V2" stroke="#D9825B" strokeWidth="2.5" />
                <path d="M12 22V20" stroke="#D9825B" strokeWidth="2.5" />
                <path d="M4.9 4.9L3.5 3.5" stroke="#8A9A65" strokeWidth="2" />
                <path d="M20.5 20.5l-1.4-1.4" stroke="#8A9A65" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-earth-800 font-serif tracking-tight">
            ROSHNI
          </h1>
          <p className="text-sm sm:text-base font-semibold text-terracotta font-serif italic">
            "Brightening Futures Through Clear Vision."
          </p>
          <p className="text-xs text-earth-500 max-w-sm mx-auto pt-2">
            AI-Powered Diabetic Retinopathy Screening & Explainable Ophthalmology Platform
          </p>
        </div>

        {/* Pulse Indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <span className="w-2 h-2 rounded-full bg-sage-600 animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-earth-400">Loading Clinical System...</span>
        </div>

        <div className="pt-2">
          <button
            onClick={() => { setFading(true); setTimeout(onFinish, 300); }}
            className="px-4 py-1.5 rounded-full text-[11px] font-bold text-earth-500 hover:text-earth-800 bg-white/80 border border-sand hover:bg-white shadow-xs transition-all"
          >
            Skip Intro &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
