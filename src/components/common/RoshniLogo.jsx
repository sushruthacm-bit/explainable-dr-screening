import React from 'react';

/**
 * ROSHNI Animated Popping Logo
 * Represents: An illuminated eye / radiant retina bringing light & clear vision
 */
export const RoshniLogo = ({ size = 'md', animated = true, showTagline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-11 h-11 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
  }[size] || 'w-11 h-11 text-xl';

  return (
    <div className="flex items-center gap-3">
      {/* Popping Animated Eye/Sun Icon */}
      <div 
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-sage-400 via-olive to-terracotta p-0.5 shadow-md shadow-sage-200/50 ${
          animated ? 'hover:scale-105 active:scale-95 transition-transform duration-300' : ''
        }`}
      >
        <div className={`flex items-center justify-center rounded-[14px] bg-ivory-50 ${sizeClasses}`}>
          {/* Eye with radiating sunbeams / iris */}
          <svg 
            className="w-3/4 h-3/4 text-sage-600 animate-pulse-subtle" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Outer Eye contour */}
            <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
            {/* Inner Iris */}
            <circle cx="12" cy="12" r="3.5" className="fill-terracotta/20 stroke-terracotta" />
            {/* Radiant Pupil & Light reflection */}
            <circle cx="12" cy="12" r="1.5" className="fill-earth-700" />
            <path d="M12 4V2" className="stroke-terracotta" strokeWidth="2" />
            <path d="M12 22V20" className="stroke-terracotta" strokeWidth="2" />
            <path d="M4.9 4.9L3.5 3.5" className="stroke-olive" strokeWidth="1.5" />
            <path d="M20.5 20.5l-1.4-1.4" className="stroke-olive" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold tracking-tight text-earth-700 text-2xl font-serif">
            ROSHNI
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-700 border border-sage-200">
            AI DR
          </span>
        </div>
        {showTagline && (
          <p className="text-xs font-medium text-earth-400 italic">
            "Brightening Futures Through Clear Vision."
          </p>
        )}
      </div>
    </div>
  );
};

export default RoshniLogo;
