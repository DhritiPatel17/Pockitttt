import React, { useState, useEffect } from 'react';
import { UserProfile, MoneyCheckIn, GoalAnalysisPlay } from '../types';
import { Clock, TrendingUp, RefreshCw, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIPlannerProps {
  profile: UserProfile;
  checkIn: MoneyCheckIn;
}

const renderCardDescription = (text: string) => {
  if (!text) return null;
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-4 mb-4 text-left">
      {paragraphs.map((para, pIdx) => {
        const parts = para.split('**');
        return (
          <p
            key={pIdx}
            className="font-sans text-xs md:text-sm font-medium text-[#09090B]/80 leading-relaxed whitespace-pre-line"
          >
            {parts.map((part, index) => {
              if (index % 2 === 1) {
                const trimmed = part.trim();
                const isLabel = /^(THE PLAN|THE MATH|REAL LIFE EXAMPLE|PRO TIP):?$/i.test(trimmed);
                if (isLabel) {
                  return (
                    <strong
                      key={index}
                      className="inline-block font-display font-black text-[#09090B] bg-[#FFF2D0] px-2 py-0.5 rounded-md border-2 border-[#09090B] mr-1 text-[10px] md:text-xs shadow-[1.5px_1.5px_0px_#09090B] tracking-wide uppercase select-none"
                    >
                      {trimmed}
                    </strong>
                  );
                }
                return (
                  <strong key={index} className="font-display font-black text-[#09090B] bg-neutral-100 px-1 py-0.5 rounded border border-neutral-300">
                    {part}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const AIPlanner: React.FC<AIPlannerProps> = ({ profile, checkIn }) => {
  const [goalText, setGoalText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plays, setPlays] = useState<GoalAnalysisPlay[]>([]);
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [timeframeMonths, setTimeframeMonths] = useState<number | null>(null);
  const [goalSummary, setGoalSummary] = useState<string>('');
  const [isTypeB, setIsTypeB] = useState<boolean>(false);
  const [typeBResponse, setTypeBResponse] = useState<string>('');
  const [closingSummary, setClosingSummary] = useState<string>('');

  // Persists the last active plans locally so switching tabs doesn't wipe them
  useEffect(() => {
    const savedPlays = localStorage.getItem('pockittt_current_plays');
    const savedSummary = localStorage.getItem('pockittt_current_summary');
    const savedAmount = localStorage.getItem('pockittt_current_target');
    const savedMonths = localStorage.getItem('pockittt_current_timeframe');
    const savedInputText = localStorage.getItem('pockittt_current_input_text');
    const savedIsTypeB = localStorage.getItem('pockittt_current_istypeb');
    const savedTypeBResponse = localStorage.getItem('pockittt_current_typebresponse');
    const savedClosing = localStorage.getItem('pockittt_current_closingsummary');

    if (savedPlays) {
      try {
        setPlays(JSON.parse(savedPlays));
      } catch (e) {
        console.error("Error reading saved plays:", e);
      }
    }
    if (savedSummary) setGoalSummary(savedSummary);
    if (savedAmount) setTargetAmount(Number(savedAmount));
    if (savedMonths) setTimeframeMonths(Number(savedMonths));
    if (savedInputText) setGoalText(savedInputText);
    if (savedIsTypeB) setIsTypeB(savedIsTypeB === 'true');
    if (savedTypeBResponse) setTypeBResponse(savedTypeBResponse);
    if (savedClosing) setClosingSummary(savedClosing);
  }, []);

  const handleFetchPlays = async (overrideText?: string) => {
    const textToSubmit = overrideText || goalText;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: textToSubmit,
          profile,
          checkIn
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to money server.');
      }

      const data = await response.json();
      
      const isTypeBValue = data.is_type_b || false;
      const typeBResponseValue = data.type_b_response || '';

      setIsTypeB(isTypeBValue);
      setTypeBResponse(typeBResponseValue);

      localStorage.setItem('pockittt_current_istypeb', String(isTypeBValue));
      localStorage.setItem('pockittt_current_typebresponse', typeBResponseValue);

      if (isTypeBValue) {
        setPlays([]);
        setTargetAmount(0);
        setTimeframeMonths(0);
        setGoalSummary(data.goal_summary || "Real wealth building 🌱");
        setClosingSummary('');

        localStorage.setItem('pockittt_current_plays', JSON.stringify([]));
        localStorage.setItem('pockittt_current_summary', data.goal_summary || "Real wealth building 🌱");
        localStorage.setItem('pockittt_current_target', '0');
        localStorage.setItem('pockittt_current_timeframe', '0');
        localStorage.setItem('pockittt_current_input_text', textToSubmit);
        localStorage.setItem('pockittt_current_closingsummary', '');
      } else if (data.plays && Array.isArray(data.plays)) {
        setPlays(data.plays);
        setTargetAmount(data.target_amount || 15000);
        setTimeframeMonths(data.timeframe_months || 12);
        setGoalSummary(data.goal_summary || "Save money");
        
        const closingVal = data.closing_summary || '';
        setClosingSummary(closingVal);
        
        // Save to cache
        localStorage.setItem('pockittt_current_plays', JSON.stringify(data.plays));
        localStorage.setItem('pockittt_current_summary', data.goal_summary || "Save money");
        localStorage.setItem('pockittt_current_target', String(data.target_amount || 15000));
        localStorage.setItem('pockittt_current_timeframe', String(data.timeframe_months || 12));
        localStorage.setItem('pockittt_current_input_text', textToSubmit);
        localStorage.setItem('pockittt_current_closingsummary', closingVal);
      } else {
        throw new Error('Server returned invalid plays list.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Whoops, server went on a quick tea break. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentGoal = () => {
    setPlays([]);
    setTargetAmount(null);
    setTimeframeMonths(null);
    setGoalSummary('');
    setGoalText('');
    setIsTypeB(false);
    setTypeBResponse('');
    setClosingSummary('');
    localStorage.removeItem('pockittt_current_plays');
    localStorage.removeItem('pockittt_current_summary');
    localStorage.removeItem('pockittt_current_target');
    localStorage.removeItem('pockittt_current_timeframe');
    localStorage.removeItem('pockittt_current_input_text');
    localStorage.removeItem('pockittt_current_istypeb');
    localStorage.removeItem('pockittt_current_typebresponse');
    localStorage.removeItem('pockittt_current_closingsummary');
  };

  const handleRemix = () => {
    handleFetchPlays();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFetchPlays();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start space-y-8 select-none font-sans">
      


      {/* Primary Goal Input Form Card */}
      <div className="w-full sticker-card p-6 md:p-8 bg-[#FFFDF0]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="goal-input" className="font-display font-black text-lg md:text-xl text-[#09090B] flex items-center gap-2">
              <span>what's your goal !?</span>
            </label>
            {(plays.length > 0 || isTypeB) && (
              <button
                type="button"
                onClick={clearCurrentGoal}
                className="text-xs font-bold font-mono uppercase underline text-[#FF2A85] hover:text-[#09090B] transition-colors"
                id="reset-goal-btn"
              >
                [reset query]
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              id="goal-input"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value.slice(0, 1000))}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              className="w-full h-28 p-4 bg-white border-4 border-[#09090B] rounded-2xl font-sans text-sm md:text-base font-semibold text-[#09090B] focus:outline-none focus:ring-4 focus:ring-[#C6FF00]/40 transition-shadow resize-none"
              maxLength={1000}
              disabled={loading}
            />
            {/* Custom Overlay Demo Placeholder (vanishes on focus or when there's text) */}
            {!isFocused && !goalText && (
              <div className="absolute inset-0 p-4 pointer-events-none select-none flex flex-col justify-start text-left leading-snug">
                <span className="font-sans font-semibold text-[#09090B]/60 text-sm md:text-base">
                  starting a SIP, investing a lump sum, saving for a goal, or budgeting freelance/salary income — ask away!
                </span>
                <span className="font-sans font-normal text-[#09090B]/30 text-xs md:text-sm mt-1 leading-normal">
                  (e.g., "I earn ₹40k freelancing, how should I split it?" or "I have ₹15k idle lump sum, where should I put it safely?")
                </span>
              </div>
            )}
            {/* Character counter bottom-right */}
            <div className="absolute bottom-4 right-4 text-[10px] md:text-xs font-mono font-bold text-[#09090B]/55 bg-[#FFFDF0] border-2 border-[#09090B]/15 px-2 py-0.5 rounded-full pointer-events-none">
              {goalText.length}/1000
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-1">
            <div className="text-[10px] md:text-xs font-mono font-bold text-[#09090B]/60 max-w-sm text-center md:text-left">
              💡 Our Paisa Coach AI calculations engine maps out your compound math, interest rates, and allocation logic instantly!
            </div>
            
            <button
              onClick={() => handleFetchPlays()}
              disabled={loading || !goalText.trim()}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF2A85] text-white border-4 border-[#09090B] rounded-full font-display font-black text-sm uppercase shadow-[4px_4px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#09090B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Calculating Magic...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 shrink-0 stroke-[3px]" />
                  <span>get my plays</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[#FF2A85]/10 border-4 border-[#FF2A85] rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF2A85] shrink-0 mt-0.5 stroke-[2.5]" />
            <p className="text-xs md:text-sm font-bold text-[#09090B]">{error}</p>
          </div>
        )}
      </div>

      {/* LOADING SECTION OVERLAY / ANIMATION */}
      {loading && (
        <div className="w-full sticker-card p-12 bg-[#C6FF00]/20 flex flex-col items-center justify-center space-y-4 border-dashed animate-pulse duration-1000">
          <div className="p-4 bg-white border-4 border-[#09090B] rounded-full animate-spin">
            <RefreshCw className="w-8 h-8 text-[#09090B] stroke-[2.5]" />
          </div>
          <h4 className="font-display font-black text-lg md:text-xl text-[#09090B]">
            Calculating Coaching Plan... 🗺️
          </h4>
          <p className="font-mono text-xs text-[#09090B]/70 uppercase font-black text-center max-w-sm leading-relaxed">
            parsing financial values • researching safe government rates • structuring personalized path
          </p>
        </div>
      )}

      {/* OUTPUT plays sections */}
      <AnimatePresence mode="wait">
        {!loading && (plays.length > 0 || isTypeB) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-full space-y-6"
          >
            {/* Output Header banner with Remix Button */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-display font-black text-2xl md:text-3xl text-[#09090B] uppercase tracking-tight flex items-center gap-2">
                  <span>{isTypeB ? "paisa coach roadmap" : "your plays"}</span>
                  <span className="text-[#FF2A85]">💰</span>
                </h3>
                {goalSummary && (
                  <p className="text-xs md:text-sm font-sans font-bold text-[#09090B]/75 italic">
                    "{goalSummary}"
                  </p>
                )}
              </div>

              <button
                onClick={handleRemix}
                title="Whip up a new variation of plays"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF0] hover:bg-[#FEF08A] border-2 border-[#09090B] rounded-full text-xs font-black uppercase text-[#09090B] shadow-[2px_2px_0px_#09090B] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>remix</span>
              </button>
            </div>

            {/* Persistent Illustrative Estimates Disclaimer (Always Visible) */}
            <div className="p-3.5 bg-[#FFFDF0]/60 border-2 border-[#09090B] rounded-xl text-[10px] md:text-xs font-mono font-bold leading-relaxed text-[#09090B]/75">
              ⚠️ <span className="underline uppercase">Note to reader:</span> Supplying money-saving tips based on general/historical data, not guaranteed returns or guaranteed financial advice. Market investments are strictly subject to volatile shifts.
            </div>

            {isTypeB ? (
              <div className="bg-[#FFFDF0] border-4 border-[#09090B] rounded-[28px] p-6 md:p-8 shadow-[8px_8px_0px_#09090B] space-y-6">
                <div className="flex items-center gap-3 bg-[#E0F2FE] border-2 border-[#09090B] px-4 py-2 rounded-full w-fit shadow-[2px_2px_0px_#09090B]">
                  <span className="text-lg">🌱</span>
                  <span className="font-display font-black text-xs uppercase tracking-wider text-[#0369A1]">
                    BUILDING REAL WEALTH
                  </span>
                </div>
                
                {renderCardDescription(typeBResponse)}

                <div className="p-4 bg-yellow-100/60 border-2 border-dashed border-[#09090B]/30 rounded-2xl text-xs md:text-sm font-semibold leading-relaxed text-[#09090B]">
                  💡 <strong className="font-display font-black uppercase text-[#FF2A85]">Ready to build a specific mathematical plan?</strong> Just type a concrete purchase target and timeline in the input box, and Paisa Coach will instantly calculate your exact interest, monthly compounding, and shortfalls!
                </div>
              </div>
            ) : (
              /* Entire Screen custom layout: bright lime / yellow-green container with float cards in cream */
              <div className="bg-[#D4F542] border-4 border-[#09090B] rounded-[28px] p-4 md:p-6 shadow-[8px_8px_0px_#09090B] space-y-4">
                <div className="text-right text-[10px] font-mono font-black uppercase text-[#09090B]/60 pr-2">
                  low risk ↘ high risk
                </div>
                
                {/* Stack of Cards */}
                <div className="flex flex-col gap-4">
                  {plays.map((play, index) => {
                    // Determine risk colors
                    // Low risk = bright lime green fill
                    // Medium risk = warm yellow fill
                    // High risk = soft red/coral fill
                    let badgeBg = "bg-[#D4F542]";
                    if (play.risk.toLowerCase().includes("medium")) {
                      badgeBg = "bg-yellow-300";
                    } else if (play.risk.toLowerCase().includes("high")) {
                      badgeBg = "bg-rose-300";
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#FFFDF0] border-2 border-[#09090B] rounded-[20px] p-5 shadow-[4px_4px_0px_#09090B] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#09090B] transition-all"
                      >
                        {/* Top Row: title + risk badge */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h4 className="font-display font-black text-base md:text-lg text-[#09090B] leading-snug line-clamp-2 max-w-[70%]">
                            {play.title}
                          </h4>
                          <span className={`px-2.5 py-1 text-[10px] md:text-xs font-black uppercase border-2 border-[#09090B] rounded-full shrink-0 ${badgeBg} text-[#FF2A85] shadow-[2px_2px_0px_#09090B]`}>
                            {play.risk}
                          </span>
                        </div>

                        {/* Body paragraph - casual, informative, Gen-Z tone */}
                        {renderCardDescription(play.description)}

                        {/* Two small outlined pill tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {/* Tag 1 Timeframe */}
                          <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-[#09090B]/30 rounded-full text-[10px] md:text-xs font-mono font-black uppercase text-[#09090B]/70 bg-white/40">
                            <Clock className="w-3.5 h-3.5 text-[#09090B]/80 stroke-[2.5]" />
                            <span>{play.timeframe_label}</span>
                          </div>
                          {/* Tag 2 Option Label */}
                          <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-[#09090B]/30 rounded-full text-[10px] md:text-xs font-mono font-black uppercase text-[#09090B]/70 bg-white/40">
                            <TrendingUp className="w-3.5 h-3.5 text-[#09090B]/80 stroke-[2.5]" />
                            <span>{play.option_label}</span>
                          </div>
                        </div>

                        {/* Bottom Callout Box for Beginners */}
                        {play.beginner_tip && (
                          <div className="p-3.5 bg-yellow-100/60 border-2 border-dashed border-[#09090B]/20 rounded-xl text-xs font-semibold text-[#09090B] leading-relaxed">
                            <span className="font-display font-black text-[#FF2A85] mr-1 block md:inline">
                              👉 if you're brand new:
                            </span>
                            <span className="opacity-90 italic">
                              {play.beginner_tip.replace(/if you're brand new:\s*/i, '')}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}


                </div>
              </div>
            )}

            {/* Disclaimer at secondary status lines */}
            <div className="text-center">
              <p className="font-mono text-[9px] md:text-[10px] text-[#09090B]/40 font-bold uppercase tracking-wider">
                Rates shown are as of June 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
