import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  // Map preset sizes to parent styling heights / widths
  const sizeClasses = {
    sm: 'h-8 md:h-10 w-auto max-w-full',
    md: 'h-10 md:h-16 w-auto max-w-full',
    lg: 'h-16 md:h-28 w-auto max-w-full',
    xl: 'h-20 md:h-40 w-auto max-w-full'
  };

  const containerPadding = {
    sm: 'px-3 py-1 border-2 shadow-[2px_2px_0px_#09090B]',
    md: 'px-5 py-2 border-4 shadow-[4px_4px_0px_#09090B]',
    lg: 'px-7 py-3 border-4 shadow-[5px_5px_0px_#09090B]',
    xl: 'px-10 py-5 border-4 shadow-[6px_6px_0px_#09090B]'
  };

  return (
    <div 
      className={`inline-flex items-center justify-center bg-[#FFFDF0] border-[#09090B] rounded-3xl rotate-[-1deg] select-none ${containerPadding[size]} ${className}`} 
      data-testid="logo-lockup"
    >
      <svg 
        className={`${sizeClasses[size]} pointer-events-none`} 
        viewBox="0 0 465 155" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            .logo-green-stroke { stroke: #A0CC00; stroke-width: 17; stroke-linecap: round; stroke-linejoin: round; }
            .logo-pink-stroke { stroke: #FF2A85; stroke-width: 17; stroke-linecap: round; stroke-linejoin: round; }
            .logo-olive-stroke { stroke: #8FAF13; stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
            .logo-olive-thin { stroke: #8FAF13; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
            .logo-olive-fill { fill: #8FAF13; }
            .logo-blend-mode { mix-blend-mode: multiply; opacity: 0.92; }
          `}</style>
        </defs>

        {/* Group with mix-blend-mode for the translucent overlapping sticker coloring */}
        <g className="logo-blend-mode">
          
          {/* Ltr 'P' (Pink stem + Lime green bowl circle - Capitalized form) */}
          <path 
            d="M 32 36 L 32 119" 
            className="logo-pink-stroke" 
          />
          <circle 
            cx="58" 
            cy="64" 
            r="20" 
            className="logo-green-stroke" 
          />

          {/* Ltr 'o' - Custom Tech Olive Computer Monitor with Connected Node-Circuit Coin */}
          <g>
            {/* Monitor Outer Screen Outline */}
            <rect 
              x="94" 
              y="56" 
              width="71" 
              height="49" 
              rx="9" 
              fill="none" 
              className="logo-olive-stroke" 
            />
            {/* Stand/Neck */}
            <path 
              d="M 130 105 L 130 119" 
              className="logo-olive-stroke" 
            />
            {/* Stand Flat support base */}
            <rect 
              x="113" 
              y="119" 
              width="33" 
              height="5.5" 
              rx="2.5" 
              className="logo-olive-fill" 
            />
            <path 
              d="M 119 124.5 L 140 124.5" 
              className="logo-olive-stroke" 
            />

            {/* Central Circle representing the dollar Coin on-screen */}
            <circle 
              cx="130" 
              cy="80.5" 
              r="12.5" 
              fill="none" 
              className="logo-olive-stroke" 
            />
            {/* Rupee Currency symbol inside coin */}
            <text 
              x="130" 
              y="85.5" 
              fontFamily="Fredoka, sans-serif" 
              fontWeight="900" 
              fontSize="15" 
              fill="#8FAF13" 
              textAnchor="middle"
            >
              ₹
            </text>

            {/* Micro Connection Nodes & Circuit rays */}
            {/* Node 1: Top-Left */}
            <circle cx="102" cy="68" r="3.5" className="logo-olive-fill" />
            <path d="M 118 76 L 102 68" className="logo-olive-thin" />

            {/* Node 2: Mid-Left */}
            <circle cx="98" cy="80.5" r="3.5" className="logo-olive-fill" />
            <path d="M 117 80.5 L 98 80.5" className="logo-olive-thin" />

            {/* Node 3: Bottom-Left */}
            <circle cx="102" cy="93" r="3.5" className="logo-olive-fill" />
            <path d="M 118 85 L 102 93" className="logo-olive-thin" />

            {/* Node 4: Top-Right */}
            <circle cx="157" cy="68" r="3.5" className="logo-olive-fill" />
            <path d="M 141 76 L 157 68" className="logo-olive-thin" />

            {/* Node 5: Mid-Right */}
            <circle cx="162" cy="80.5" r="3.5" className="logo-olive-fill" />
            <path d="M 142 80.5 L 162 80.5" className="logo-olive-thin" />

            {/* Node 6: Bottom-Right */}
            <circle cx="157" cy="93" r="3.5" className="logo-olive-fill" />
            <path d="M 141 85 L 157 93" className="logo-olive-thin" />
          </g>

          {/* Ltr 'c' (Lime-green bubble curve) */}
          <path 
            d="M 235 64 C 223 47 198 47 186 64 C 173 79 173 103 186 118 C 198 135 223 135 235 118" 
            className="logo-green-stroke" 
          />

          {/* Ltr 'k' (Pink tall stem + Lime green joints) */}
          <path 
            d="M 258 36 L 258 119" 
            className="logo-pink-stroke" 
          />
          <path 
            d="M 295 55 L 264 82 L 295 119" 
            className="logo-green-stroke" 
          />

          {/* Ltr 'i' (Pink low stem + Lime green dot) */}
          <path 
            d="M 320 72 L 320 119" 
            className="logo-pink-stroke" 
          />
          <path 
            d="M 320 46 L 320 46" 
            className="logo-green-stroke" 
          />

          {/* Ltr 't' #1 (Lime green stem + Pink crossbar) */}
          <path 
            d="M 355 45 L 355 119" 
            className="logo-green-stroke" 
          />
          <path 
            d="M 340 66 L 370 66" 
            className="logo-pink-stroke" 
          />

          {/* Ltr 't' #2 (Pink stem + Lime green crossbar) */}
          <path 
            d="M 395 45 L 395 119" 
            className="logo-pink-stroke" 
          />
          <path 
            d="M 380 66 L 410 66" 
            className="logo-green-stroke" 
          />

          {/* Ltr 't' #3 (Lime green stem + Pink crossbar) */}
          <path 
            d="M 435 45 L 435 119" 
            className="logo-green-stroke" 
          />
          <path 
            d="M 420 66 L 450 66" 
            className="logo-pink-stroke" 
          />

        </g>
      </svg>
    </div>
  );
};
