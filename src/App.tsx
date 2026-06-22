import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { CheckIn } from './components/CheckIn';
import { EditProfile } from './components/EditProfile';
import { AIPlanner } from './components/AIPlanner';
import { MoneyLingo } from './components/MoneyLingo';
import { FinanceTimes } from './components/FinanceTimes';
import { VirtualWallet } from './components/VirtualWallet';
import { Logo } from './components/Logo';
import { ConfettiShapes, PiggyBank } from './components/Mascot';
import { CoinkieChat } from './components/CoinkieChat';
import { UserProfile, MoneyCheckIn } from './types';
import { Wallet, LogOut, Settings2, Sparkles, TrendingUp, Newspaper, BookOpenText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIn, setCheckIn] = useState<MoneyCheckIn | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'wallet' | 'moneylingo' | 'finance-times'>('planner');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [editSubTab, setEditSubTab] = useState<'metrics' | 'profile'>('metrics');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load from local storage on startup
  useEffect(() => {
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
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('pockittt_profile', JSON.stringify(newProfile));
  };

  const handleCheckInComplete = (newCheckIn: MoneyCheckIn) => {
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

  if (activeTab === 'finance-times') {
    return <FinanceTimes onClose={() => setActiveTab('planner')} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#C6FF00] to-[#FEF08A] bg-fixed bg-cover relative pt-12 pb-20 px-6 flex flex-col justify-between font-sans overflow-x-hidden text-[#09090B]">
      
      {/* Absolute Bottom Line Ribbon (Decorative Active Ticker) */}
      <div className="absolute bottom-0 left-0 w-full bg-[#FFE853] text-[#09090B] font-mono text-[10px] md:text-xs py-2 overflow-hidden border-t-4 border-[#09090B] z-40 select-none">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-black uppercase tracking-widest">
          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🚀 LEVEL UP: COMPLETE 3 CHALLENGES IN A ROW TO EARN THE GURU BADGE</span>
          <span>🎯 TARGET ACHIEVED: VISUAL STATISTICS AUTOMATICALLY UPDATE ON CHECK-IN</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>
          
          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🚀 LEVEL UP: COMPLETE 3 CHALLENGES IN A ROW TO EARN THE GURU BADGE</span>
          <span>🎯 TARGET ACHIEVED: VISUAL STATISTICS AUTOMATICALLY UPDATE ON CHECK-IN</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>

          <span>💖 DESIGNED WITH ULTIMATE SAVINGS LOVE FOR THE NEXT GENERATION</span>
          <span>🐷 POCKIT SAYS: "A rupee saved is ten rupees compound-grown!"</span>
          <span>🚀 LEVEL UP: COMPLETE 3 CHALLENGES IN A ROW TO EARN THE GURU BADGE</span>
          <span>🎯 TARGET ACHIEVED: VISUAL STATISTICS AUTOMATICALLY UPDATE ON CHECK-IN</span>
          <span>🔮 DYNAMIC AI STRATEGY AND SIP CALCULATION PRE-BUILT</span>
        </div>
      </div>
      
      {/* Scattered background elements handpicked by Mascot config without congestion */}
      <ConfettiShapes />
      
      {/* Main Content Stage */}
      <main className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto flex-1 flex flex-col justify-start items-center relative z-10 py-12 space-y-16">
        
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
            className="w-full space-y-12 pb-24"
            id="pockittt-dashboard-screen"
          >
            {/* Elegant Sticker Header banner */}
            <div className="sticker-card p-5 bg-[#FFFDF0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Logo / Greeting Block */}
              <div className="flex items-center gap-4">
                <Logo size="md" className="shrink-0" />
                <div className="h-10 w-1.5 bg-[#09090B] hidden md:block rounded-full" />
                <div>
                  <h1 className="text-xl font-display font-bold text-[#09090B] leading-tight flex items-center gap-1">
                    What's up, {profile.name}! 👋
                  </h1>
                  <span className="text-[10px] text-[#09090B]/60 font-mono font-black uppercase tracking-wider block mt-0.5">
                    Let's stack that bag • {profile.role}
                  </span>
                </div>
              </div>

              {/* Statistics Sticker Badge */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Allowance Widget */}
                <div className="border-4 border-[#09090B] rounded-2xl px-3.5 py-2 bg-[#FFFDF0] flex items-center gap-2 shadow-[4px_4px_0px_0px_#09090B]">
                  <Wallet className="w-4 h-4 text-[#FF2A85] stroke-[2.5px]" />
                  <div className="leading-tight">
                    <span className="block text-[8px] font-mono text-[#09090B]/50 font-bold uppercase leading-none">ALLOWANCE:</span>
                    <span className="font-display font-bold text-sm text-[#09090B]">₹{checkIn.monthlyIncome.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                {/* Savings Widget */}
                <div className="border-4 border-[#09090B] rounded-2xl px-3.5 py-2 bg-[#C6FF00] flex items-center gap-2 shadow-[4px_4px_0px_0px_#09090B]">
                  <TrendingUp className="w-4 h-4 text-[#09090B] stroke-[2.5px]" />
                  <div className="leading-tight">
                    <span className="block text-[8px] font-mono text-[#09090B]/60 font-bold uppercase leading-none">SAVINGS TARGET:</span>
                    <span className="font-display font-bold text-sm text-[#09090B]">₹{savings.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                {/* Actions Button Panel */}
                <div className="flex gap-1.5 ml-auto md:ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingMetrics(prev => !prev);
                      if (!isEditingMetrics) {
                        setEditSubTab('metrics');
                      }
                    }}
                    className="p-2 border-4 border-[#09090B] rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF08A] transition-all shadow-[3px_3px_0px_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer text-[#09090B] focus:outline-none"
                    title="Change financial metrics"
                    id="edit-metrics-trigger"
                  >
                    <Settings2 className="w-5 h-5 stroke-[2.5px]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 border-4 border-[#09090B] rounded-2xl bg-[#FF2A85]/10 text-[#FF2A85] hover:bg-[#FF2A85] hover:text-white transition-all shadow-[3px_3px_0px_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer focus:outline-none"
                    title="Reset App"
                    id="reset-state-trigger"
                  >
                    <LogOut className="w-5 h-5 stroke-[2.5px]" />
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

            {/* Main Tabs Selection (AI Budget Guru vs Glossary vs Finance Times) */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className={`inline-flex items-center justify-center font-display text-sm font-bold border-4 border-[#09090B] rounded-full py-3 px-5 shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer ${
                  activeTab === 'planner'
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-[#FFFDF0] text-[#09090B]'
                }`}
                id="tab-select-planner"
              >
                <Sparkles className="w-4.5 h-4.5 stroke-[2.5px]" />
                <span>Goal Planner ⭐</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`inline-flex items-center justify-center font-display text-sm font-bold border-4 border-[#09090B] rounded-full py-3 px-5 shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-[#FFFDF0] text-[#09090B]'
                }`}
                id="tab-select-wallet"
              >
                <Wallet className="w-4.5 h-4.5 stroke-[2.5px] mr-1.5" />
                <span>My Wallet 👛</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('finance-times')}
                className={`inline-flex items-center justify-center font-display text-sm font-bold border-4 border-[#09090B] rounded-full py-3 px-5 shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer ${
                  // @ts-expect-error TypeScript narrows the type of activeTab above, but we still need this for styling structure
                  activeTab === 'finance-times'
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-[#FFFDF0] text-[#09090B]'
                }`}
                id="tab-select-finance-times"
              >
                <Newspaper className="w-4.5 h-4.5 stroke-[2.5px] mr-1.5" />
                <span>Finance Times 📰</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('moneylingo')}
                className={`inline-flex items-center justify-center font-display text-sm font-bold border-4 border-[#09090B] rounded-full py-3 px-5 shadow-[4px_4px_0px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer ${
                  activeTab === 'moneylingo'
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-[#FFFDF0] text-[#09090B]'
                }`}
                id="tab-select-moneylingo"
              >
                <BookOpenText className="w-4.5 h-4.5 stroke-[2.5px] mr-1.5" />
                <span>MoneyLingo 💸</span>
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

      {/* Simple, humbling Footer line */}
      <footer className="text-center font-mono text-[10px] text-[#09090B]/50 mt-6 border-t-4 border-[#09090B]/5 pt-4 w-full max-w-4xl mx-auto z-10 relative font-bold">
        <span className="block">your money bestie • designed with absolute ❤️ for teens • {new Date().getFullYear()}</span>
      </footer>

      <CoinkieChat />
    </div>
  );
}
