import React from 'react';

export const PiggyBank: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`${className} opacity-95 filter drop-shadow-[3px_3px_0px_#09090B]`}
    width="80"
    height="80"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ground Shadow underneath the jumping cute pig */}
    <ellipse cx="44" cy="88" rx="20" ry="3.5" fill="#09090B" opacity="0.12" />

    {/* Back Legs (Darker pink because of shadow layer) */}
    <rect x="25" y="66" width="12" height="15" rx="6" fill="#F472B6" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="54" y="66" width="12" height="15" rx="6" fill="#F472B6" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />

    {/* Tiny Curly Tail */}
    <path d="M16 54 C10 52, 11 40, 6 43" stroke="#09090B" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Elegant chubby Body (soft bubblegum pink) */}
    <ellipse cx="44" cy="48" rx="30" ry="26" fill="#FBCFE8" stroke="#09090B" strokeWidth="3.5" />

    {/* Glossy highlight on back (white pill shape) */}
    <path d="M21 40 C 21 31, 28 25, 36 25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

    {/* Front Legs (Closest to the viewer - cute peachy pink) */}
    <rect x="31" y="68" width="12" height="14" rx="6" fill="#FBCFE8" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="48" y="68" width="12" height="14" rx="6" fill="#FBCFE8" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />

    {/* Ears */}
    {/* Left Ear */}
    <path d="M48 24 L54 13 L58 23 Z" fill="#FBCFE8" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />
    {/* Right Ear */}
    <path d="M58 22 L66 9 L70 23 Z" fill="#FBCFE8" stroke="#09090B" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M61 21 L66 12 L68 22 Z" fill="#F472B6" />

    {/* Snout with small cute oval nostrils */}
    <ellipse cx="73" cy="51" rx="9" ry="7.5" fill="#F472B6" stroke="#09090B" strokeWidth="3.5" />
    <ellipse cx="70.5" cy="51" rx="1.8" ry="2.2" fill="#09090B" />
    <ellipse cx="75.5" cy="51" rx="1.8" ry="2.2" fill="#09090B" />

    {/* Coin Slot on the back */}
    <rect x="36" y="21" width="16" height="4.5" rx="2" fill="#78350F" stroke="#09090B" strokeWidth="1.5" />

    {/* Shiny Chibi Eyes with sparkles precisely like the photo */}
    {/* Left Eye */}
    <circle cx="56" cy="41" r="3.8" fill="#09090B" />
    <circle cx="54.8" cy="39.8" r="1.3" fill="#FFFFFF" />
    <circle cx="57.2" cy="42.2" r="0.6" fill="#FFFFFF" />

    {/* Right Eye */}
    <circle cx="67" cy="41" r="3.8" fill="#09090B" />
    <circle cx="65.8" cy="39.8" r="1.3" fill="#FFFFFF" />
    <circle cx="68.2" cy="42.2" r="0.6" fill="#FFFFFF" />

    {/* Adorable blush marks */}
    <ellipse cx="54" cy="45.5" rx="3" ry="1.2" fill="#FF8DA1" opacity="0.9" />
    <ellipse cx="70" cy="45.5" rx="3" ry="1.2" fill="#FF8DA1" opacity="0.9" />
  </svg>
);

export const CuteWallet: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`${className} opacity-95 filter drop-shadow-[3px_3px_0px_#09090B]`}
    width="80"
    height="70"
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cash peeking out from the pocket */}
    <rect x="25" y="4" width="26" height="18" rx="3" fill="#10B981" stroke="#09090B" strokeWidth="3.5" />
    {/* Small Rupee symbol on peeking cash */}
    <path d="M33 9 H39 M33 13 H39 M36 9 C39 9, 39 15, 36 15" stroke="#09090B" strokeWidth="1.8" strokeLinecap="round" />
    
    {/* Wallet fold/body - super cute light blue */}
    <rect x="6" y="16" width="88" height="56" rx="12" fill="#93C5FD" stroke="#09090B" strokeWidth="4" />
    {/* Horizontal wallet pocket seam */}
    <path d="M6 38 H94" stroke="#09090B" strokeWidth="4" />
    
    {/* Cute closure strap - slightly darker matching blue */}
    <rect x="74" y="28" width="22" height="22" rx="6" fill="#3B82F6" stroke="#09090B" strokeWidth="4" />
    {/* Little yellow snap button on the strap */}
    <circle cx="85" cy="39" r="3" fill="#FFE853" stroke="#09090B" strokeWidth="1.5" />
  </svg>
);

export const RupeeCoin: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`${className} opacity-95 filter drop-shadow-[3px_3px_0px_#09090B]`}
    width="70"
    height="70"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer golden coin ring */}
    <circle cx="50" cy="50" r="40" fill="#FFD700" stroke="#09090B" strokeWidth="4.5" />
    {/* Inner dashed ring */}
    <circle cx="50" cy="50" r="31" fill="#FFE853" stroke="#09090B" strokeWidth="3" strokeDasharray="5 3" />
    {/* Rupee Symbol ₹ */}
    <path
      d="M36 34 H64 M36 44 H64 M48 34 C58 34, 58 54, 46 54 L34 54 M44 54 L58 72"
      stroke="#09090B"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Direct shiny reflections */}
    <rect x="34" y="22" width="6" height="6" rx="3" fill="#FFFFFF" />
  </svg>
);

export const CashStack: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`${className} opacity-95 filter drop-shadow-[3px_3px_0px_#09090B]`}
    width="80"
    height="60"
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom slightly offset green note */}
    <rect x="14" y="24" width="72" height="42" rx="6" fill="#8AE79C" stroke="#09090B" strokeWidth="4" />
    {/* Middle note */}
    <rect x="9" y="17" width="72" height="42" rx="6" fill="#A7F3D0" stroke="#09090B" strokeWidth="4" />
    {/* Top main green note */}
    <rect x="4" y="10" width="72" height="42" rx="6" fill="#10B981" stroke="#09090B" strokeWidth="4" />
    {/* Inner decorative oval */}
    <ellipse cx="40" cy="31" rx="14" ry="10" fill="#34D399" stroke="#09090B" strokeWidth="3" />
    {/* Tiny Rupee mark in the center of note */}
    <path
      d="M34 27 H43 M34 31 H43 M39 27 C43 27, 43 35, 37 35 L33 35 M36 35 L41 40"
      stroke="#09090B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Realistic currency wrap band */}
    <rect x="30" y="10" width="18" height="42" fill="#FEF08A" stroke="#09090B" strokeWidth="4" />
    {/* Fine realistic details on the band */}
    <line x1="30" y1="20" x2="48" y2="20" stroke="#09090B" strokeWidth="2" strokeDasharray="2 2" />
    <line x1="30" y1="42" x2="48" y2="42" stroke="#09090B" strokeWidth="2" strokeDasharray="2 2" />
  </svg>
);

// Backward-compatibility mapping aliases
export const PinkDevil = PiggyBank;
export const GreenTree = RupeeCoin;

export const ConfettiShapes: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. RupeeCoin (Gold, Left Top) */}
      <div className="absolute top-[5%] md:top-[12%] left-[4%] lg:left-[2%] xl:left-[4%] w-10 h-10 md:w-14 md:h-14 xl:w-16 xl:h-16 animate-coin-spin pointer-events-auto hover:scale-115 transition-all">
        <RupeeCoin className="w-full h-full" />
      </div>

      {/* 3. CuteWallet (Cute Blue, Left Mid) */}
      <div className="absolute top-[40%] md:top-[42%] left-[1%] lg:left-[1%] xl:left-[3%] w-12 h-10 md:w-16 md:h-14 xl:w-22 xl:h-20 animate-custom-float-delay pointer-events-auto hover:scale-115 transition-all">
        <CuteWallet className="w-full h-full" />
      </div>

      {/* 4. RupeeCoin (Gold, Right Mid) */}
      <div className="absolute top-[55%] md:top-[52%] right-[3%] lg:right-[1%] xl:right-[4%] w-8 h-8 md:w-12 md:h-12 xl:w-14 xl:h-14 animate-custom-float-fast pointer-events-auto hover:scale-115 transition-all">
        <RupeeCoin className="w-full h-full" />
      </div>

      {/* 5. CuteWallet (Cute Blue, Right Mid-Low) */}
      <div className="absolute top-[70%] md:top-[75%] right-[2%] lg:right-[1%] xl:right-[3%] w-12 h-10 md:w-16 md:h-14 xl:w-22 xl:h-20 animate-custom-float-fast pointer-events-auto hover:scale-115 transition-all">
        <CuteWallet className="w-full h-full" />
      </div>

      {/* 6. CashStack (Green, Left Low) */}
      <div className="absolute top-[82%] md:top-[78%] left-[2%] lg:left-[1%] xl:left-[4%] w-12 h-10 md:w-16 md:h-12 xl:w-20 xl:h-16 animate-custom-float pointer-events-auto hover:scale-115 transition-all">
        <CashStack className="w-full h-full" />
      </div>
    </div>
  );
};


