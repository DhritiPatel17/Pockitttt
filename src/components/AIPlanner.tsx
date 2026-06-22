import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MoneyCheckIn, GoalAnalysis } from '../types';
import { Sparkles, Loader2, Send, AlertCircle, RefreshCw, TrendingUp, Goal, Calculator, Briefcase, Handshake, Info, ShieldAlert } from 'lucide-react';

interface AIPlannerProps {
  profile: UserProfile;
  checkIn: MoneyCheckIn;
}

const GOAL_PRESETS = [
  { label: '🎮 Buy a PS5 or Console', text: 'I want to save up ₹45,000 to buy a gaming console, hoping to achieve this in about 12 months.' },
  { label: '🎓 College Laptop Stack', text: 'I get ₹2,500/month, I want to save ₹1,200/month to buy a solid coder laptop for college.' },
  { label: '🌟 Learn to compound', text: 'I have ₹500 leftover pocket money each month, I want to learn low-risk compounding and beginner SIP routes.' },
  { label: '🎁 Mom/Dad Gift Fund', text: 'I want to save up ₹5,000 in 3 months to buy an amazing surprise birthday gift for my family.' }
];

const LOADER_MESSAGES = [
  "asking the money spirits... 🔮",
  "consulting the vibes... ✨",
  "doing math so you don't have to... 🧮",
  "scanning the receipts... 🧾",
  "running the numbers, on god... 🚀"
];

const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-[#09090B] bg-[#FEF08A] px-1 rounded-md ml-[-2px]">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const AIPlanner: React.FC<AIPlannerProps> = ({ profile, checkIn }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderMsg, setLoaderMsg] = useState(LOADER_MESSAGES[0]);
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [error, setError] = useState('');

  // Rotate loading text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % LOADER_MESSAGES.length;
        setLoaderMsg(LOADER_MESSAGES[idx]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePresetClick = (presetText: string) => {
    setGoal(presetText);
    setError('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || goal.trim().length < 8) {
      setError("Give a tiny bit more detail so the AI can help! E.g. save for a console or compound ₹500.");
      return;
    }
    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, checkIn, goal })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.yourNumbers && data.yourOptions) {
        setAnalysis(data as GoalAnalysis);
      } else {
        throw new Error("Invalid analysis structure received from the engines.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact engines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-[#C6FF00] text-[#09090B] border-[#09090B]';
      case 'Medium':
        return 'bg-[#FEF08A] text-[#09090B] border-[#09090B]';
      case 'Higher':
      case 'High':
        return 'bg-[#FF2A85] text-white border-[#09090B]';
      default:
        return 'bg-[#FFFDF0] text-[#09090B] border-[#09090B]';
    }
  };

  return (
    <div className="space-y-10" id="ai-planner-module">
      {/* Search/Generate box */}
      <div className="sticker-card p-5 md:p-6 bg-[#FFFDF0] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#FF2A85] fill-[#FEF08A] stroke-[#09090B] stroke-[2.5px]" />
          <h3 className="text-xl font-display font-bold text-[#09090B]">
            goal mode <span className="text-[#FF2A85]">ON.</span>
          </h3>
        </div>

        <p className="text-xs text-[#09090B]/85 mb-4 leading-relaxed font-sans font-semibold">
          drop your situation in your own words — get 3 to 5 ways you could play it. No jargon, no lectures.
        </p>

        {/* Presets Row */}
        <div className="mb-4">
          <span className="block text-[11px] text-[#09090B]/60 font-mono mb-2 uppercase tracking-wide font-black">
            Tap a quick goal preset to auto-type:
          </span>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetClick(p.text)}
                className="text-xs px-3 py-1.5 border-4 border-[#09090B] rounded-full bg-[#FFFDF0] text-[#09090B] font-display font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer shadow-[3px_3px_0px_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none bg-[#FFFDF0]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="relative">
            <textarea
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                if (e.target.value) setError('');
              }}
              rows={3}
              placeholder="e.g. i get ₹1000/month, i can save about ₹500, i want to buy a college laptop in a year."
              className="w-full bg-white border-4 border-[#09090B] rounded-2xl p-4 font-sans text-base text-[#09090B] placeholder:text-[#09090B]/40 focus:outline-none focus:ring-4 focus:ring-[#FF2A85]/20 focus:border-[#FF2A85] transition-all shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)] leading-relaxed"
              id="ai-goal-textarea"
            />
          </div>

          {error && (
            <div className="p-3.5 border-4 border-[#FF2A85] bg-[#FF2A85]/10 rounded-2xl flex items-center gap-2 text-xs text-[#FF2A85] font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[3px]" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sticker-btn w-full py-4 flex items-center justify-center gap-2 cursor-pointer text-lg bg-[#C6FF00]"
            id="generate-plans-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#09090B] stroke-[3px]" />
                <span className="font-display font-bold text-base">{loaderMsg}</span>
              </>
            ) : (
              <>
                <span className="font-display font-bold text-base">get my plays</span>
                <Send className="w-5 h-5 text-[#09090B] stroke-[3.5px] rotate-12" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Animation Box */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="sticker-card p-8 text-center bg-[#FFFDF0] border-dashed border-4 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 bg-[#FEF08A] border-4 border-[#09090B] rounded-full flex items-center justify-center animate-bounce shadow-[4px_4px_0px_#09090B]">
            <TrendingUp className="w-7 h-7 text-[#09090B] stroke-[3px]" />
          </div>
          <h4 className="font-display font-bold text-[#09090B] text-xl">Analyzing Your Money Profile</h4>
          <p className="text-[#09090B]/60 text-xs font-mono font-black">{loaderMsg}</p>
        </motion.div>
      )}

      {/* Generated Plans Renders */}
      <AnimatePresence mode="popLayout">
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="ai-plan-outputs"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
              <div>
                <h4 className="text-2xl font-display font-bold text-[#09090B]">
                  your goal breakdown 🗺️
                </h4>
                <p className="text-xs text-[#09090B]/60 font-mono font-black uppercase tracking-wider">
                  The brutal math & strategy behind your goal
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-1.5 text-sm text-[#09090B] bg-[#FFFDF0] border-4 border-[#09090B] py-2 px-4 rounded-full font-bold hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none shadow-[3px_3px_0px_#09090B] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5px]" /> remix
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="sticker-card p-6 bg-[#E0F2FE] relative">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-8 h-8 text-[#0284C7] stroke-[2.5px]" />
                  <h5 className="font-display font-bold text-xl text-[#09090B]">The Numbers</h5>
                </div>
                <p className="font-sans text-base text-[#09090B]/90 font-medium leading-relaxed whitespace-pre-line">
                  <FormattedText text={analysis.yourNumbers} />
                </p>
              </div>

              <div className="sticker-card p-6 bg-[#FEF08A] relative">
                <div className="flex items-center gap-3 mb-4">
                  <Goal className="w-8 h-8 text-[#A16207] stroke-[2.5px]" />
                  <h5 className="font-display font-bold text-xl text-[#09090B]">Reality Check</h5>
                </div>
                <p className="font-sans text-lg text-[#09090B] font-bold leading-relaxed whitespace-pre-line">
                  <FormattedText text={analysis.realityCheck} />
                </p>
              </div>

              <div className="sticker-card p-6 bg-[#C6FF00] relative">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-8 h-8 text-[#4D7C0F] stroke-[2.5px]" />
                  <h5 className="font-display font-bold text-xl text-[#09090B]">The Options</h5>
                </div>
                <p className="font-sans text-base text-[#09090B]/90 font-medium leading-relaxed whitespace-pre-line">
                  <FormattedText text={analysis.yourOptions} />
                </p>
              </div>

              <div className="sticker-card p-6 bg-[#FFFDF0] relative">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-8 h-8 text-[#09090B] stroke-[2.5px]" />
                  <h5 className="font-display font-bold text-xl text-[#09090B]">What This Could Look Like</h5>
                </div>
                <p className="font-sans text-base text-[#09090B]/90 font-medium leading-relaxed whitespace-pre-line">
                  <FormattedText text={analysis.whatThisCouldLookLike} />
                </p>
              </div>

              <div className="sticker-card p-6 bg-[#FFEDD5] relative">
                <div className="flex items-center gap-3 mb-4">
                  <Handshake className="w-8 h-8 text-[#C2410C] stroke-[2.5px]" />
                  <h5 className="font-display font-bold text-xl text-[#09090B]">If It Doesn't Fit Yet</h5>
                </div>
                <p className="font-sans text-base text-[#09090B]/90 font-medium leading-relaxed whitespace-pre-line">
                  <FormattedText text={analysis.ifItDoesntFitYet} />
                </p>
              </div>
            </div>

            {/* Persistent, required, hard-coded Disclaimer */}
            <div className="border-4 border-[#09090B] bg-[#FF2A85]/10 rounded-2xl p-6 flex gap-4 shadow-[6px_6px_0px_0px_#09090B] items-start" id="ai-disclaimer">
              <ShieldAlert className="w-8 h-8 text-[#FF2A85] shrink-0 stroke-[2.5px]" />
              <div className="space-y-2">
                <span className="block font-display font-bold text-lg text-[#09090B]">
                  Required Disclaimer
                </span>
                <p className="text-sm font-medium font-sans text-[#09090B]/90 leading-relaxed italic">
                  {analysis.disclaimer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
