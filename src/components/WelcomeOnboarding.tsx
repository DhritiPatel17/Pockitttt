import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Target, BookOpenText, Wallet, Newspaper } from 'lucide-react';
import { PiggyBank } from './Mascot';

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen w-full bg-[#E6F4F1] flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Skip button top right */}
      <button 
        onClick={onComplete}
        className="absolute top-6 right-6 font-display font-bold text-sm text-[#09090B]/60 hover:text-[#09090B] transition-colors z-20"
      >
        Skip
      </button>

      <div className="w-full max-w-lg sticker-card bg-white border-4 border-[#09090B] rounded-3xl p-8 sm:p-10 shadow-[8px_8px_0px_#09090B] relative z-10">
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full border-2 border-[#09090B] transition-colors ${slide === 1 ? 'bg-[#FF2A85]' : 'bg-transparent'}`} />
          <div className={`w-3 h-3 rounded-full border-2 border-[#09090B] transition-colors ${slide === 2 ? 'bg-[#FF2A85]' : 'bg-transparent'}`} />
        </div>

        <AnimatePresence mode="wait">
          {slide === 1 ? (
            <motion.div 
              key="slide1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col items-center text-center gap-6"
            >
              <div className="bg-[#FFF2D0] p-4 rounded-full border-4 border-[#09090B] shadow-[4px_4px_0px_#09090B] mb-2">
                <PiggyBank className="w-16 h-16" />
              </div>
              
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#09090B] leading-tight">
                Why saving matters
              </h1>
              
              <p className="font-sans font-medium text-base sm:text-lg text-[#09090B]/80 leading-relaxed">
                Hey! 👋 Ever wish you had more money in your 30s without even trying? It starts now. The habits you build with money today — saving, spending smart, understanding basic finance — decide how stress-free your future actually is. Pockitt is here to make that part easy, and honestly, kind of fun.
              </p>

              <button 
                onClick={() => setSlide(2)}
                className="mt-4 sticker-btn w-full py-4 text-lg bg-[#C6FF00] flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="slide2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col items-stretch gap-6"
            >
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#09090B] leading-tight text-center mb-2">
                What Pockitt does
              </h1>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 bg-[#FFFDF0] border-2 border-[#09090B] p-4 rounded-2xl shadow-[2px_2px_0px_#09090B]">
                  <Target className="w-6 h-6 text-[#FF2A85] shrink-0" />
                  <p className="font-sans text-sm sm:text-base font-semibold leading-tight">
                    <span className="font-bold font-display uppercase tracking-wider text-xs block mb-0.5">Goal Planner</span>
                    Tell us what you want, we'll build the exact plan to get you there.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-[#FFFDF0] border-2 border-[#09090B] p-4 rounded-2xl shadow-[2px_2px_0px_#09090B]">
                  <BookOpenText className="w-6 h-6 text-[#8B5CF6] shrink-0" />
                  <p className="font-sans text-sm sm:text-base font-semibold leading-tight">
                    <span className="font-bold font-display uppercase tracking-wider text-xs block mb-0.5">MoneyLingo</span>
                    Confusing finance words, explained like a friend would.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#FFFDF0] border-2 border-[#09090B] p-4 rounded-2xl shadow-[2px_2px_0px_#09090B]">
                  <Wallet className="w-6 h-6 text-[#10B981] shrink-0" />
                  <p className="font-sans text-sm sm:text-base font-semibold leading-tight">
                    <span className="font-bold font-display uppercase tracking-wider text-xs block mb-0.5">Wallet</span>
                    Your own virtual wallet — track cash, save memories, set reminders.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#FFFDF0] border-2 border-[#09090B] p-4 rounded-2xl shadow-[2px_2px_0px_#09090B]">
                  <Newspaper className="w-6 h-6 text-[#F59E0B] shrink-0" />
                  <p className="font-sans text-sm sm:text-base font-semibold leading-tight">
                    <span className="font-bold font-display uppercase tracking-wider text-xs block mb-0.5">Newspaper</span>
                    Quick updates on what's happening in the market, made simple.
                  </p>
                </div>
              </div>

              <p className="font-display font-bold text-center text-lg mt-2">
                All of it, right here, under one roof. Let's go. 🚀
              </p>

              <button 
                onClick={onComplete}
                className="mt-2 sticker-btn w-full py-4 text-lg bg-[#FF2A85] text-white flex items-center justify-center gap-2"
              >
                Get Started <Sparkles className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
