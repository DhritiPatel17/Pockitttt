import React, { useState, useEffect } from 'react';
import { UserProfile, MoneyCheckIn, GoalAnalysisPlay, SavedConversation } from '../types';
import { Clock, TrendingUp, RefreshCw, Send, Sparkles, Loader2, AlertCircle, Bookmark, BookmarkCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Confetti } from './Confetti';
import { ShareButton } from './ShareCard';

interface AIPlannerProps {
  profile: UserProfile;
  checkIn: MoneyCheckIn;
}

const renderCardDescription = (text: string) => {
  if (!text) return null;
  // Replace literal '\n' and '\\n' with actual newlines
  const unescapedText = text.replace(/\\n/g, '\n');
  const paragraphs = unescapedText.split('\n\n');
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
                const isLabel = /^(THE PLAN|THE MATH|REAL LIFE EXAMPLE|PRO TIP|HONEST FINANCIAL CHECK):?$/i.test(trimmed);
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
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

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

    const savedList = localStorage.getItem('pockittt_saved_conversations');
    if (savedList) {
      try {
        setSavedConversations(JSON.parse(savedList));
      } catch (e) {
        console.error("Error reading saved conversations:", e);
      }
    }
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

  const handleSaveConversation = () => {
    if (!goalText.trim() || (!isTypeB && plays.length === 0)) return;

    // Check if we already saved this specific goalText (avoid duplicates)
    const isAlreadySaved = savedConversations.some(
      (c) => c.goalText.trim().toLowerCase() === goalText.trim().toLowerCase()
    );

    if (isAlreadySaved) return;

    const newSaved: SavedConversation = {
      id: 'conv_' + Date.now(),
      timestamp: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      goalText,
      goalSummary,
      plays,
      isTypeB,
      typeBResponse,
      closingSummary,
      targetAmount,
      timeframeMonths,
    };

    const updated = [newSaved, ...savedConversations];
    setSavedConversations(updated);
    localStorage.setItem('pockittt_saved_conversations', JSON.stringify(updated));
    setShowSavedList(true); // Open the list to give direct user feedback
    setShowConfetti(true);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering loading the conversation
    const updated = savedConversations.filter((c) => c.id !== id);
    setSavedConversations(updated);
    localStorage.setItem('pockittt_saved_conversations', JSON.stringify(updated));
  };

  const handleLoadConversation = (conv: SavedConversation) => {
    setGoalText(conv.goalText);
    setGoalSummary(conv.goalSummary);
    setPlays(conv.plays);
    setIsTypeB(conv.isTypeB);
    setTypeBResponse(conv.typeBResponse);
    setClosingSummary(conv.closingSummary);
    setTargetAmount(conv.targetAmount);
    setTimeframeMonths(conv.timeframeMonths);

    // Set individual current items in cache
    localStorage.setItem('pockittt_current_plays', JSON.stringify(conv.plays));
    localStorage.setItem('pockittt_current_summary', conv.goalSummary);
    localStorage.setItem('pockittt_current_target', String(conv.targetAmount || 0));
    localStorage.setItem('pockittt_current_timeframe', String(conv.timeframeMonths || 0));
    localStorage.setItem('pockittt_current_input_text', conv.goalText);
    localStorage.setItem('pockittt_current_istypeb', String(conv.isTypeB));
    localStorage.setItem('pockittt_current_typebresponse', conv.typeBResponse);
    localStorage.setItem('pockittt_current_closingsummary', conv.closingSummary);

    // Scroll to the active layout smoothly
    setTimeout(() => {
      const outputEl = document.getElementById('planner-results-title');
      if (outputEl) {
        outputEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      


      {/* Primary Goal Input Form Card */}
      <div className="w-full sticker-card p-4 xs:p-5 sm:p-6 md:p-8 bg-[#FFFDF0]">
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
                Reset
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
              className="w-full h-40 xs:h-36 sm:h-28 p-3 sm:p-4 pr-14 sm:pr-16 bg-white border-4 border-[#09090B] rounded-2xl font-sans text-xs sm:text-sm md:text-base font-semibold text-[#09090B] focus:outline-none focus:ring-4 focus:ring-[#C6FF00]/40 transition-shadow resize-none"
              maxLength={1000}
              disabled={loading}
            />
            {/* Custom Overlay Demo Placeholder (vanishes on focus or when there's text) */}
            {!isFocused && !goalText && (
              <div className="absolute inset-0 p-3 sm:p-4 pr-14 sm:pr-16 pointer-events-none select-none flex flex-col justify-start text-left leading-normal sm:leading-snug overflow-hidden">
                <span className="font-sans font-semibold text-[#09090B]/60 text-[11px] xs:text-xs sm:text-sm md:text-base break-words whitespace-normal leading-normal sm:leading-snug">
                  starting a SIP, lump sum investing, saving for a goal, or budgeting income — ask away!
                </span>
                <span className="font-sans font-normal text-[#09090B]/40 text-[10px] xs:text-[11px] sm:text-xs mt-1 leading-normal break-words whitespace-normal">
                  e.g., "I earn ₹40k freelancing, how do I split it?"
                </span>
              </div>
            )}
            {/* Character counter bottom-right */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-[9px] sm:text-xs font-mono font-bold text-[#09090B]/55 bg-[#FFFDF0] border-2 border-[#09090B]/15 px-1.5 py-0.5 sm:px-2 rounded-full pointer-events-none z-10">
              {goalText.length}/1000
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-1 w-full">
            <div className="text-[10px] md:text-xs font-mono font-bold text-[#09090B]/60 max-w-full md:max-w-sm text-center md:text-left break-words whitespace-normal leading-normal">
              Turn "I wish I had saved" into "look how far I've come." Let's start.📈
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

      {/* Saved Conversations Section */}
      {savedConversations.length > 0 && (
        <div className="w-full bg-[#FFFDF0] border-4 border-[#09090B] rounded-[24px] p-5 shadow-[4px_4px_0px_#09090B] space-y-3">
          <button
            onClick={() => setShowSavedList(!showSavedList)}
            className="w-full flex justify-between items-center text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎒</span>
              <h3 className="font-display font-black text-sm md:text-base text-[#09090B] uppercase tracking-wider">
                My Saved Roadmaps ({savedConversations.length})
              </h3>
            </div>
            <div className="p-1 border-2 border-[#09090B] rounded-full bg-white shadow-[1.5px_1.5px_0px_#09090B]">
              {showSavedList ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#09090B]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#09090B]" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showSavedList && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {savedConversations.map((conv) => {
                    const isActive = goalText.trim().toLowerCase() === conv.goalText.trim().toLowerCase() && (plays.length > 0 || isTypeB);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleLoadConversation(conv)}
                        className={`p-3 border-2 rounded-xl flex justify-between items-center gap-4 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#C6FF00]/10 border-[#FF2A85] shadow-[2px_2px_0px_#FF2A85]'
                            : 'bg-white border-[#09090B]/10 hover:border-[#09090B] hover:shadow-[2px_2px_0px_#09090B]'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#09090B] truncate pr-2">
                            {conv.goalText}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-[#09090B]/50 uppercase">
                              {conv.timestamp}
                            </span>
                            {conv.isTypeB ? (
                              <span className="text-[8px] font-display font-black uppercase bg-blue-100 text-[#0369A1] px-1.5 py-0.5 rounded border border-[#09090B]/10">
                                general roadmap 💡
                              </span>
                            ) : (
                              <span className="text-[8px] font-display font-black uppercase bg-[#D4F542] text-[#FF2A85] px-1.5 py-0.5 rounded border border-[#09090B]/15">
                                ₹{(conv.targetAmount || 0).toLocaleString('en-IN')} • {conv.timeframeMonths}m 🎯
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          title="Delete saved roadmap"
                          className="p-1 border-2 border-transparent hover:border-[#FF2A85] rounded-lg hover:bg-[#FF2A85]/10 text-[#09090B]/40 hover:text-[#FF2A85] transition-all shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
            {/* Output Header banner with Remix & Save Button */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="space-y-1">
                <h3 id="planner-results-title" className="font-display font-black text-2xl md:text-3xl text-[#09090B] uppercase tracking-tight flex items-center gap-2">
                  <span>{isTypeB ? "paisa coach roadmap" : "your plays"}</span>
                  <span className="text-[#FF2A85]">💰</span>
                </h3>
                {goalSummary && (
                  <p className="text-xs md:text-sm font-sans font-bold text-[#09090B]/75 italic">
                    "{goalSummary}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveConversation}
                  disabled={savedConversations.some(c => c.goalText.trim().toLowerCase() === goalText.trim().toLowerCase())}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#09090B] rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_#09090B] transition-all cursor-pointer disabled:opacity-75 disabled:shadow-none disabled:translate-none ${
                    savedConversations.some(c => c.goalText.trim().toLowerCase() === goalText.trim().toLowerCase())
                      ? 'bg-[#C6FF00] text-[#09090B]'
                      : 'bg-[#FFFDF0] hover:bg-[#FFD1DC] text-[#09090B] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                  }`}
                >
                  {savedConversations.some(c => c.goalText.trim().toLowerCase() === goalText.trim().toLowerCase()) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>saved! 💚</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>save chat 💾</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRemix}
                  title="Whip up a new variation of plays"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF0] hover:bg-[#FEF08A] border-2 border-[#09090B] rounded-full text-xs font-black uppercase text-[#09090B] shadow-[2px_2px_0px_#09090B] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>remix</span>
                </button>
              </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                          <h4 className="font-display font-black text-base md:text-lg text-[#09090B] leading-snug line-clamp-2 sm:max-w-[65%]">
                            {play.title}
                          </h4>
                          <span className={`px-2.5 py-1 text-[10px] md:text-xs font-black uppercase border-2 border-[#09090B] rounded-xl sm:rounded-full shrink-0 ${badgeBg} text-[#FF2A85] shadow-[2px_2px_0px_#09090B] w-fit max-w-full sm:max-w-[35%] whitespace-normal break-words text-left sm:text-center`}>
                            {play.risk}
                          </span>
                        </div>

                        {/* Body content - either structured sections or fallback description */}
                        {play.the_plan || play.the_math || play.real_life_example || play.pro_tip ? (
                          <div className="space-y-4 mb-4 text-left">
                            {play.the_plan && (
                              <div className="font-sans text-xs md:text-sm font-medium text-[#09090B]/80 leading-relaxed">
                                <strong className="inline-block font-display font-black text-[#09090B] bg-[#FFF2D0] px-2 py-0.5 rounded-md border-2 border-[#09090B] mr-2 text-[10px] md:text-xs shadow-[1.5px_1.5px_0px_#09090B] tracking-wide uppercase select-none">
                                  THE PLAN
                                </strong>
                                <span className="align-middle">{play.the_plan.replace(/^the plan:?\s*/i, '')}</span>
                              </div>
                            )}
                            {play.the_math && (
                              <div className="font-sans text-xs md:text-sm font-medium text-[#09090B]/80 leading-relaxed">
                                <strong className="inline-block font-display font-black text-[#09090B] bg-[#FFF2D0] px-2 py-0.5 rounded-md border-2 border-[#09090B] mr-2 text-[10px] md:text-xs shadow-[1.5px_1.5px_0px_#09090B] tracking-wide uppercase select-none">
                                  THE MATH
                                </strong>
                                <span className="align-middle whitespace-pre-wrap block mt-2">{play.the_math.replace(/^the math:?\s*/i, '')}</span>
                              </div>
                            )}
                            {play.real_life_example && (
                              <div className="font-sans text-xs md:text-sm font-medium text-[#09090B]/80 leading-relaxed">
                                <strong className="inline-block font-display font-black text-[#09090B] bg-[#FFF2D0] px-2 py-0.5 rounded-md border-2 border-[#09090B] mr-2 text-[10px] md:text-xs shadow-[1.5px_1.5px_0px_#09090B] tracking-wide uppercase select-none">
                                  REAL LIFE EXAMPLE
                                </strong>
                                <span className="align-middle">{play.real_life_example.replace(/^real life example:?\s*/i, '')}</span>
                              </div>
                            )}
                            {play.pro_tip && (
                              <div className="font-sans text-xs md:text-sm font-medium text-[#09090B]/80 leading-relaxed">
                                <strong className="inline-block font-display font-black text-[#09090B] bg-[#FFF2D0] px-2 py-0.5 rounded-md border-2 border-[#09090B] mr-2 text-[10px] md:text-xs shadow-[1.5px_1.5px_0px_#09090B] tracking-wide uppercase select-none">
                                  PRO TIP
                                </strong>
                                <span className="align-middle">{play.pro_tip.replace(/^pro tip:?\s*/i, '')}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          renderCardDescription(play.description)
                        )}

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

            {closingSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFFDF0] border-4 border-[#09090B] rounded-[24px] p-6 shadow-[4px_4px_0px_#09090B]"
                id="closing-summary-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎒</span>
                  <h4 className="font-display font-black text-sm md:text-base text-[#09090B] uppercase tracking-wider">
                    Paisa Coach Recommendation & Summary
                  </h4>
                </div>
                {renderCardDescription(closingSummary)}
              </motion.div>
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
