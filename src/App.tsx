import React, { useState, useEffect, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { WelcomeOnboarding } from './components/WelcomeOnboarding';
import { CheckIn } from './components/CheckIn';
import { EditProfile } from './components/EditProfile';
import { AIPlanner } from './components/AIPlanner';
import { MoneyLingo } from './components/MoneyLingo';
import { FinanceTimes } from './components/FinanceTimes';
import { VirtualWallet } from './components/VirtualWallet';
import { Logo } from './components/Logo';
import { ConfettiShapes, PiggyBank } from './components/Mascot';
import { UserProfile, MoneyCheckIn } from './types';
import { Wallet, LogOut, Settings2, Sparkles, TrendingUp, Newspaper, BookOpenText, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Confetti } from './components/Confetti';
import { PockittWrapped } from './components/PockittWrapped';
import { moneyFacts } from './data/moneyFacts';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIn, setCheckIn] = useState<MoneyCheckIn | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'wallet' | 'moneylingo' | 'finance-times'>('planner');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [editSubTab, setEditSubTab] = useState<'metrics' | 'profile'>('metrics');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState<number>(1);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * moneyFacts.length));
  const [showWrapped, setShowWrapped] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(true); // Default to true to prevent flash

  // Load from local storage on startup
  useEffect(() => {
    const savedHasSeenWelcome = localStorage.getItem('pockittt_has_seen_welcome');
    if (!savedHasSeenWelcome) {
      setHasSeenWelcome(false);
    }

    const savedProfile = localStorage.getItem('pockittt_profile') || localStorage.getItem('cashbox_profile');

    const savedCheckIn = localStorage.getItem('pockittt_check_in') || localStorage.getItem('cashbox_check_in');
    
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Error parsing saved profile:", e);
      }
    }
    if (savedCheckIn) {
      try {
        setCheckIn(JSON.parse(savedCheckIn));
      } catch (e) {
        console.error("Error parsing saved check-in:", e);
      }
    }

    // Daily Streak Logic
    const getLocalDateString = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const today = new Date();
    const todayStr = getLocalDateString(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const savedLastActive = localStorage.getItem('pockittt_last_active_date');
    const savedStreak = localStorage.getItem('pockittt_streak_count');
    let currentStreak = savedStreak ? parseInt(savedStreak) : 1;

    console.log("[Paisa Coach Debug] Daily Streak calculation details:", {
      todayStr,
      yesterdayStr,
      savedLastActive,
      savedStreak,
      parsedSavedStreak: savedStreak ? parseInt(savedStreak) : null
    });

    if (!savedLastActive) {
      console.log("[Paisa Coach Debug] Branch: First open ever. Setting currentStreak = 1");
      currentStreak = 1;
    } else if (savedLastActive === todayStr) {
      console.log("[Paisa Coach Debug] Branch: Today already opened. No change to streak. currentStreak =", currentStreak);
      // Already active today, do nothing
    } else if (savedLastActive === yesterdayStr) {
      currentStreak += 1;
      console.log("[Paisa Coach Debug] Branch: Consecutive day open (yesterday). Incrementing streak to:", currentStreak);
    } else {
      console.log(`[Paisa Coach Debug] Branch: Break in streak (last active on ${savedLastActive} is older than yesterday ${yesterdayStr}). Resetting currentStreak = 1`);
      currentStreak = 1;
    }

    setStreakCount(currentStreak);
    localStorage.setItem('pockittt_streak_count', String(currentStreak));
    localStorage.setItem('pockittt_last_active_date', todayStr);

    // Milestone detection logic
    const notifiedMilestone = localStorage.getItem('pockittt_milestone_notified_streak');
    if (notifiedMilestone !== String(currentStreak) && [3, 7, 14, 30].includes(currentStreak)) {
      setStreakMilestone(currentStreak);
      setShowConfetti(true);
      localStorage.setItem('pockittt_milestone_notified_streak', String(currentStreak));
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setStreakMilestone(null);
      }, 4000);
    }
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('pockittt_profile', JSON.stringify(newProfile));
  };

  const handleCheckInComplete = (newCheckIn: MoneyCheckIn) => {
    if (!checkIn) {
      setShowConfetti(true);
    }
    setCheckIn(newCheckIn);
    localStorage.setItem('pockittt_check_in', JSON.stringify(newCheckIn));
    setIsEditingMetrics(false);
  };

  const handleReset = () => {
    setShowLogoutConfirm(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('pockittt_profile');
    localStorage.removeItem('pockittt_check_in');
    localStorage.removeItem('pockittt_active_challenges');
    localStorage.removeItem('pockittt_wishlist_items');
    localStorage.removeItem('cashbox_profile');
    localStorage.removeItem('cashbox_check_in');
    localStorage.removeItem('cashbox_active_challenges');
    localStorage.removeItem('cashbox_wishlist_items');
    setProfile(null);
    setCheckIn(null);
    setActiveTab('planner');
    setIsEditingMetrics(false);
    setShowLogoutConfirm(false);
  };

  // Determine saving buffer
  const savings = checkIn ? Math.max(0, checkIn.monthlyIncome - checkIn.monthlySpend) : 0;
  const savingsPercent = checkIn && checkIn.monthlyIncome > 0 ? (savings / checkIn.monthlyIncome) * 100 : 0;

  const mascotMood = useMemo<'happy' | 'neutral' | 'worried'>(() => {
    if (!checkIn) return 'happy';
    if (checkIn.monthlySpend > checkIn.monthlyIncome || savingsPercent < 10) {
      return 'worried';
    } else if (savingsPercent >= 10 && savingsPercent <= 30) {
      return 'neutral';
    } else {
      return 'happy';
    }
  }, [checkIn, savingsPercent]);

  const greetingText = useMemo(() => {
    if (!profile) return '';
    const hour = new Date().getHours();
    let bucket: string[] = [];
    if (hour >= 5 && hour < 11) {
      bucket = [`early bird energy, ${profile.name} 🌅`, `rise and grind, ${profile.name} ☀️`];
    } else if (hour >= 11 && hour < 17) {
      bucket = [`what's up, ${profile.name}! 👋`, `midday money check, ${profile.name} 💸`];
    } else if (hour >= 17 && hour < 21) {
      bucket = [`evening vibes, ${profile.name} 🌆`, `chillin' and savin', ${profile.name} ☕`];
    } else {
      bucket = [`3am savings grind? respect 🌙`, `night owl budgeting, ${profile.name} 🦉`];
    }
    const idx = (profile.name.length + hour) % bucket.length;
    return bucket[idx];
  }, [profile?.name]);

  if (!hasSeenWelcome) {
    return (
      <WelcomeOnboarding 
        onComplete={() => {
          setHasSeenWelcome(true);
          localStorage.setItem('pockittt_has_seen_welcome', 'true');
        }} 
      />
    );
  }

  if (activeTab === 'finance-times') {
    return <FinanceTimes onClose={() => setActiveTab('planner')} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#C6FF00] to-[#FEF08A] bg-fixed bg-cover relative pt-6 sm:pt-12 pb-16 sm:pb-20 px-3 sm:px-6 flex flex-col justify-between font-sans overflow-x-hidden text-[#09090B]">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      
      {/* Streak Milestone Celebration Toast */}
      <AnimatePresence>
        {streakMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4"
          >
            <div className="bg-[#FFE853] border-4 border-[#09090B] rounded-2xl p-4 shadow-[6px_6px_0px_#09090B] text-center flex flex-col items-center gap-1">
              <span className="text-2xl">🔥👑🏆</span>
              <h4 className="font-display font-black text-sm text-[#09090B] uppercase tracking-tight">
                🔥 {streakMilestone}-day streak!
              </h4>
              <p className="text-xs font-sans text-[#09090B] font-bold">
                you're literally cooking, bestie. keep it up! 🍳✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Absolute Bottom Line Ribbon (Decorative Active Ticker) */}
      <div className="absolute bottom-0 left-0 w-full bg-[#FFE853] text-[#09090B] font-mono text-[10px] md:text-xs py-2 overflow-hidden border-t-4 border-[#09090B] z-40 select-none">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-black uppercase tracking-widest">
          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>
          
          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>

          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>
        </div>
      </div>
      
      {/* Scattered background elements handpicked by Mascot config without congestion */}
      <ConfettiShapes />
      
      {/* Main Content Stage */}
      <main className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto flex-1 flex flex-col justify-start items-center relative z-10 py-6 sm:py-12 space-y-8 sm:space-y-16">
        
        {/* Step 1: Onboarding Flow */}
        {!profile && (
          <div className="w-full max-w-xl flex flex-col items-center gap-10 py-6">
            <div className="flex flex-col items-center justify-center gap-3">
              <Logo size="lg" />
              <p className="text-[#09090B] font-mono text-sm uppercase tracking-widest font-black mt-2">
                your pocket-money bestie ✨
              </p>
            </div>
            <Onboarding onComplete={handleProfileComplete} />
          </div>
        )}

        {/* Step 2: Money Check-In Flow (right after onboarding/login) */}
        {profile && !checkIn && (
          <div className="w-full max-w-xl flex flex-col items-center gap-10 py-6">
            <div className="flex items-center gap-2 bg-[#FFFDF0] border-4 border-[#09090B] px-5 py-2.5 rounded-full shadow-[3px_3px_0px_#09090B]">
              <span className="font-mono text-xs text-[#09090B]/80 font-bold">Logged in: </span>
              <span className="font-display font-bold text-xs bg-[#FEF08A] px-2.5 py-0.5 border-2 border-[#09090B] rounded-full">
                {profile.name} ({profile.age}yo)
              </span>
            </div>
            <CheckIn
              profile={profile}
              onComplete={handleCheckInComplete}
              onBack={() => {
                setProfile(null);
                localStorage.removeItem('pockittt_profile');
                localStorage.removeItem('cashbox_profile');
              }}
            />
          </div>
        )}

        {/* Main Dashboard (Onboarding & Check-in Completed!) */}
        {profile && checkIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-6 sm:space-y-10 pb-16 sm:pb-24"
              id="pockittt-dashboard-screen"
            >
              {/* Elegant Unified Pockittt Summary Hub Card (All-in-One Command Center) */}
              <div className="sticker-card p-4 sm:p-5 bg-[#FFFDF0] border-4 border-[#09090B] rounded-3xl shadow-[6px_6px_0px_#09090B] flex flex-col xl:flex-row items-center justify-between gap-5 w-full">
                
                {/* Left Section: Logo + Divider + Greeting */}
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full xl:w-auto shrink-0 pb-4 xl:pb-0 border-b-4 xl:border-b-0 border-[#09090B]/10 xl:border-r-4 xl:border-[#09090B]/10 xl:pr-6">
                  <Logo size="md" className="shrink-0" />
                  <div className="h-10 w-1 bg-[#09090B] hidden sm:block rounded-full shrink-0" />
                  <div>
                    <h1 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#09090B] leading-tight flex items-center justify-center sm:justify-start gap-1">
                      <span>{greetingText} 👋</span>
                    </h1>
                    <span className="text-[10px] text-[#09090B]/60 font-mono font-black uppercase tracking-wider block mt-1">
                      Let's stack that bag • {profile.role}
                    </span>
                  </div>
                </div>

                {/* Right Section: Core Widgets (Allowance, Savings Target) + Streak Row with Edit & Logout + Downside Pockittt Wrapped */}
                <div className="flex flex-col gap-3.5 w-full xl:max-w-xl">
                  
                  {/* Row 1: Allowance & Savings Target side-by-side */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    
                    {/* Allowance Card */}
                    <div className="border-4 border-[#09090B] rounded-2xl px-3 py-2 bg-[#FFFDF0] flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#09090B] shrink-0 hover:translate-y-[-1px] transition-transform">
                      <Wallet className="w-4 h-4 text-[#FF2A85] stroke-[2.5px] shrink-0" />
                      <div className="leading-tight text-left min-w-0">
                        <span className="block text-[8px] font-mono text-[#09090B]/50 font-black uppercase leading-none mb-0.5 truncate">ALLOWANCE:</span>
                        <span className="font-display font-bold text-xs sm:text-sm text-[#09090B] block truncate">₹{checkIn.monthlyIncome.toLocaleString('en-IN')}/mo</span>
                      </div>
                    </div>

                    {/* Savings Target Card */}
                    <div className="border-4 border-[#09090B] rounded-2xl px-3 py-2 bg-[#C6FF00] flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#09090B] shrink-0 hover:translate-y-[-1px] transition-transform">
                      <TrendingUp className="w-4 h-4 text-[#09090B] stroke-[2.5px] shrink-0" />
                      <div className="leading-tight text-left min-w-0">
                        <span className="block text-[8px] font-mono text-[#09090B]/60 font-black uppercase leading-none mb-0.5 truncate">SAVINGS TARGET:</span>
                        <span className="font-display font-bold text-xs sm:text-sm text-[#09090B] block truncate">₹{savings.toLocaleString('en-IN')}/mo</span>
                      </div>
                    </div>

                  </div>

                  {/* Row 2: Streak Card + Edit Settings + Logout in one line! */}
                  <div className="flex items-center gap-3 w-full">
                    
                    {/* Savings Streak Card */}
                    <div className="flex-1 border-4 border-[#09090B] rounded-2xl px-3.5 py-2 bg-[#FFF9E6] flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#FFE853] hover:translate-y-[-1px] transition-transform min-w-0">
                      {streakCount >= 3 ? (
                        <motion.span
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="text-sm leading-none select-none inline-block shrink-0"
                        >
                          🔥
                        </motion.span>
                      ) : (
                        <span className="text-sm leading-none select-none shrink-0">🔥</span>
                      )}
                      <div className="leading-tight text-left min-w-0">
                        <span className="block text-[8px] font-mono text-[#09090B]/60 font-black uppercase tracking-wider mb-0.5 truncate">STREAK:</span>
                        <span className="font-display font-bold text-xs sm:text-sm text-[#09090B] block truncate">{streakCount} {streakCount === 1 ? 'day' : 'days'}</span>
                      </div>
                    </div>

                    {/* Settings Edit Parameter Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingMetrics(prev => !prev);
                        if (!isEditingMetrics) {
                          setEditSubTab('metrics');
                        }
                      }}
                      className={`w-11 h-11 border-4 border-[#09090B] rounded-2xl transition-all shadow-[3px_3px_0px_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer text-[#09090B] flex items-center justify-center shrink-0 ${
                        isEditingMetrics ? 'bg-[#FEF08A]' : 'bg-white hover:bg-[#FEF08A]'
                      }`}
                      title="Change financial metrics or profile parameters"
                      id="edit-metrics-trigger"
                    >
                      <Settings2 className="w-5 h-5 stroke-[2.5px]" />
                    </button>

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-11 h-11 border-4 border-[#09090B] rounded-2xl bg-[#FF2A85]/10 text-[#FF2A85] hover:bg-[#FF2A85] hover:text-white transition-all shadow-[3px_3px_0px_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center justify-center shrink-0"
                      title="Reset / Logout from Pockittt"
                      id="reset-state-trigger"
                    >
                      <LogOut className="w-5 h-5 stroke-[2.5px]" />
                    </button>

                  </div>

                  {/* Row 3 (Downside wrapped feature): "Pockittt Wrapped" */}
                  <div className="w-full pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowWrapped(true)}
                      className="w-full inline-flex items-center justify-center gap-2 border-4 border-[#09090B] rounded-2xl py-2.5 px-4 bg-gradient-to-r from-[#FF2A85] via-[#C6FF00] to-[#FEF08A] hover:opacity-95 text-[#09090B] font-display font-black text-xs md:text-sm shadow-[3px_3px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#09090B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer min-h-[44px]"
                      title="See your Pockittt Wrapped!"
                      id="see-wrapped-trigger"
                    >
                      <Sparkles className="w-4 h-4 text-[#FF2A85] fill-[#FF2A85]" />
                      <span>Pockittt Wrapped 🎧</span>
                    </button>
                  </div>

                </div>

              </div>

            {/* Dynamic Editing Panel for Check-in Parameters */}
            <AnimatePresence>
              {isEditingMetrics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full max-w-md mx-auto"
                >
                  <div className="sticker-card p-5 bg-[#FFFDF0] space-y-4 my-2">
                    <div className="flex justify-between items-center pb-2 border-b-4 border-[#09090B]/10">
                      <span className="font-display font-bold text-base text-[#09090B]">
                        {editSubTab === 'metrics' ? '✏️ Edit Cash Metrics' : '👤 Edit My Profile'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingMetrics(false)}
                        className="text-[#09090B]/40 hover:text-[#09090B] text-sm font-bold font-display"
                      >
                        ✕ close
                      </button>
                    </div>

                    {/* Sub-tab segmented selectors for metrics and profile */}
                    <div className="flex border-4 border-[#09090B] rounded-xl overflow-hidden bg-white p-0.5 shadow-[2px_2px_0px_#09090B]">
                      <button
                        type="button"
                        onClick={() => setEditSubTab('metrics')}
                        className={`flex-1 py-1.5 font-display text-xs font-bold rounded-lg transition-all ${
                          editSubTab === 'metrics' ? 'bg-[#FF2A85] text-white' : 'hover:bg-neutral-50 text-[#09090B]'
                        }`}
                      >
                        💸 Cash Metrics
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSubTab('profile')}
                        className={`flex-1 py-1.5 font-display text-xs font-bold rounded-lg transition-all ${
                          editSubTab === 'profile' ? 'bg-[#FF2A85] text-white' : 'hover:bg-neutral-50 text-[#09090B]'
                        }`}
                      >
                        👤 Edit Profile
                      </button>
                    </div>

                    {editSubTab === 'metrics' ? (
                      <CheckIn
                        profile={profile}
                        initialData={checkIn}
                        onComplete={handleCheckInComplete}
                        onBack={() => setIsEditingMetrics(false)}
                      />
                    ) : (
                      <EditProfile
                        profile={profile}
                        onSave={(updatedProfile) => {
                          handleProfileComplete(updatedProfile);
                          setEditSubTab('metrics');
                        }}
                        onCancel={() => setIsEditingMetrics(false)}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rotating Fact Card */}
            <div className="sticker-card p-4 bg-[#FFFDF0] border-4 border-[#09090B] rounded-2xl shadow-[4px_4px_0px_#09090B] flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">💡</span>
                <div>
                  <span className="block text-[8px] font-mono text-[#09090B]/60 font-bold uppercase leading-none mb-1">
                    {moneyFacts[factIndex].isMyth ? 'MYTH VS FACT 🧠' : 'DID YOU KNOW? ⚡'}
                  </span>
                  <p className="text-xs font-sans text-[#09090B] font-bold leading-relaxed">
                    {moneyFacts[factIndex].text}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  let nextIdx;
                  do {
                    nextIdx = Math.floor(Math.random() * moneyFacts.length);
                  } while (nextIdx === factIndex && moneyFacts.length > 1);
                  setFactIndex(nextIdx);
                }}
                className="p-1.5 border-2 border-[#09090B] rounded-xl bg-[#C6FF00] hover:bg-[#FFE853] shadow-[2px_2px_0px_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer text-[#09090B] transition-all shrink-0"
                title="Shuffle fact"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            </div>
 
            <div className="w-full flex flex-row overflow-x-auto scrollbar-none items-center justify-start sm:justify-center gap-2.5 sm:gap-3 px-2 sm:px-1 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className={`inline-flex items-center justify-center font-display text-xs sm:text-sm font-black border-4 rounded-full py-2.5 px-3 sm:px-4.5 transition-all cursor-pointer shrink-0 whitespace-nowrap bg-[#FFF2D0] hover:bg-[#FFEAD2] ${
                  activeTab === 'planner'
                    ? 'border-[#FF2A85] text-[#FF2A85] shadow-[4px_4px_0px_0px_#FF2A85] translate-x-[1px] translate-y-[1px]'
                    : 'border-[#09090B] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#09090B]'
                }`}
                id="tab-select-planner"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5px] mr-1.5 shrink-0" />
                <span>Goal Planner ⭐</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('moneylingo')}
                className={`inline-flex items-center justify-center font-display text-xs sm:text-sm font-black border-4 rounded-full py-2.5 px-3 sm:px-4.5 transition-all cursor-pointer shrink-0 whitespace-nowrap bg-[#FFF2D0] hover:bg-[#FFEAD2] ${
                  activeTab === 'moneylingo'
                    ? 'border-[#FF2A85] text-[#FF2A85] shadow-[4px_4px_0px_0px_#FF2A85] translate-x-[1px] translate-y-[1px]'
                    : 'border-[#09090B] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#09090B]'
                }`}
                id="tab-select-moneylingo"
              >
                <BookOpenText className="w-4 h-4 stroke-[2.5px] mr-1.5 shrink-0" />
                <span>MoneyLingo 💸</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`inline-flex items-center justify-center font-display text-xs sm:text-sm font-black border-4 rounded-full py-2.5 px-3 sm:px-4.5 transition-all cursor-pointer shrink-0 whitespace-nowrap bg-[#FFF2D0] hover:bg-[#FFEAD2] ${
                  activeTab === 'wallet'
                    ? 'border-[#FF2A85] text-[#FF2A85] shadow-[4px_4px_0px_0px_#FF2A85] translate-x-[1px] translate-y-[1px]'
                    : 'border-[#09090B] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#09090B]'
                }`}
                id="tab-select-wallet"
              >
                <Wallet className="w-4 h-4 stroke-[2.5px] mr-1.5 shrink-0" />
                <span>My Wallet 👛</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('finance-times')}
                className={`inline-flex items-center justify-center font-display text-xs sm:text-sm font-black border-4 rounded-full py-2.5 px-3 sm:px-4.5 transition-all cursor-pointer shrink-0 whitespace-nowrap bg-[#FFF2D0] hover:bg-[#FFEAD2] ${
                  // @ts-expect-error TypeScript narrows activeTab, but styling still maps this way
                  activeTab === 'finance-times'
                    ? 'border-[#FF2A85] text-[#FF2A85] shadow-[4px_4px_0px_0px_#FF2A85] translate-x-[1px] translate-y-[1px]'
                    : 'border-[#09090B] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#09090B]'
                }`}
                id="tab-select-finance-times"
              >
                <Newspaper className="w-4 h-4 stroke-[2.5px] mr-1.5 shrink-0" />
                <span>Finance Times 📰</span>
              </button>
            </div>

            {/* Main Viewport Content mapping */}
            <AnimatePresence mode="wait">
              {activeTab === 'planner' ? (
                <motion.div
                  key="planner-tab-content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <AIPlanner profile={profile} checkIn={checkIn} />
                </motion.div>
              ) : activeTab === 'wallet' ? (
                <motion.div
                  key="wallet-tab-content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <VirtualWallet profile={profile} checkIn={checkIn} />
                </motion.div>
              ) : activeTab === 'moneylingo' ? (
                <motion.div
                  key="moneylingo-tab-content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <MoneyLingo />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Custom Logout Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            id="logout-confirmation-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#FFFDF0] border-4 border-[#09090B] rounded-3xl p-6 shadow-[8px_8px_0px_#09090B] relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 pointer-events-none opacity-25">
                <PiggyBank className="w-24 h-24 rotate-[15deg]" />
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-4xl">👋🥺</div>
                <h3 className="font-display font-bold text-xl text-[#09090B] tracking-tight">
                  Leaving already, bestie?
                </h3>
                <p className="text-xs text-[#09090B]/75 leading-relaxed font-semibold">
                  Logging out will safely delete your profile, money statistics, and active pocket challenges. Are you absolutely sure?
                </p>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-2.5 px-4 bg-white border-4 border-[#09090B] rounded-2xl font-display text-xs font-bold text-[#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#09090B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shadow-[3px_3px_0px_#09090B] transition-all cursor-pointer"
                    id="cancel-logout-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmReset}
                    className="py-2.5 px-4 bg-[#FF2A85] text-white border-4 border-[#09090B] rounded-2xl font-display text-xs font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#09090B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shadow-[3px_3px_0px_#09090B] transition-all cursor-pointer"
                    id="confirm-logout-btn"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWrapped && profile && (
          <PockittWrapped
            profile={profile}
            checkIn={checkIn}
            streakCount={streakCount}
            onClose={() => setShowWrapped(false)}
          />
        )}
      </AnimatePresence>

      {/* Simple, humbling Footer line */}
      <footer className="text-center font-mono text-[10px] text-[#09090B]/50 mt-6 border-t-4 border-[#09090B]/5 pt-4 w-full max-w-4xl mx-auto z-10 relative font-bold">
        <span className="block">your money bestie • designed with absolute ❤️ for teens • {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
