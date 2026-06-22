import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoneyCheckIn, UserProfile } from '../types';
import { ArrowLeft, Wallet, TrendingUp, Sparkles, Smile, Frown, ShieldAlert } from 'lucide-react';

interface CheckInProps {
  profile: UserProfile;
  initialData?: MoneyCheckIn;
  onComplete: (data: MoneyCheckIn) => void;
  onBack: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ profile, initialData, onComplete, onBack }) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialData?.monthlyIncome ?? 2500);
  const [monthlySpend, setMonthlySpend] = useState<number>(initialData?.monthlySpend ?? 1500);
  const [customIncome, setCustomIncome] = useState<string>(String(initialData?.monthlyIncome ?? 2500));
  const [customSpend, setCustomSpend] = useState<string>(String(initialData?.monthlySpend ?? 1500));

  const handleIncomeSliderChange = (val: number) => {
    setMonthlyIncome(val);
    setCustomIncome(String(val));
  };

  const handleSpendSliderChange = (val: number) => {
    setMonthlySpend(val);
    setCustomSpend(String(val));
  };

  const handleIncomeTextChange = (text: string) => {
    setCustomIncome(text);
    const parsed = parseInt(text);
    if (!isNaN(parsed) && parsed >= 0) {
      setMonthlyIncome(parsed);
    }
  };

  const handleSpendTextChange = (text: string) => {
    setCustomSpend(text);
    const parsed = parseInt(text);
    if (!isNaN(parsed) && parsed >= 0) {
      setMonthlySpend(parsed);
    }
  };

  const savings = Math.max(0, monthlyIncome - monthlySpend);
  const savingsPercent = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  // Witty Gen Z personalized feedback based on allowance state
  const getSavingsFeedback = () => {
    if (monthlyIncome === 0) {
      return {
        text: "Allowance is zero? No stress! You can still play pockittt to master the concepts before getting your bag!",
        color: "text-[#FF2A85]",
        icon: <Smile className="w-5 h-5 text-[#FF2A85] shrink-0" />,
        bg: "bg-[#FEF08A]/30 border-[#09090B]"
      };
    }
    if (monthlySpend > monthlyIncome) {
      return {
        text: "Whoops, you are spending more than you get! Highkey in the danger zone, bestie. Let's fix this cycle!",
        color: "text-[#FF2A85]",
        icon: <ShieldAlert className="w-5 h-5 text-[#FF2A85] shrink-0" />,
        bg: "bg-[#FF2A85]/10 border-[#FF2A85]"
      };
    }
    if (monthlySpend === monthlyIncome) {
      return {
        text: "You are spending 100% of your allowance! Zero savings left for gaming skins or bubble tea. Lowkey scary!",
        color: "text-orange-500",
        icon: <Frown className="w-5 h-5 text-orange-500 shrink-0" />,
        bg: "bg-orange-50 border-[#09090B]"
      };
    }
    if (savingsPercent > 50) {
      return {
        text: `Whoa! Saving ${Math.round(savingsPercent)}%? You are literally a pocket-money legend, ${profile.name}! Teach us your ways!`,
        color: "text-lime-700",
        icon: <Sparkles className="w-5 h-5 text-lime-700 shrink-0 fill-lime-100" />,
        bg: "bg-[#C6FF00]/20 border-[#C6FF00]"
      };
    }
    return {
      text: `Nice! You're saving ₹${savings.toLocaleString('en-IN')} a month (${Math.round(savingsPercent)}%). A super solid foundation to grow your stacks!`,
      color: "text-emerald-700",
      icon: <Smile className="w-5 h-5 text-emerald-700 shrink-0" />,
      bg: "bg-emerald-50 border-emerald-200"
    };
  };

  const feedback = getSavingsFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ monthlyIncome, monthlySpend });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto sticker-card p-6 md:p-8 bg-[#FFFDF0]"
      id="checkin-card"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#09090B] font-display font-bold hover:translate-x-[2px] hover:translate-y-[2px] bg-[#FFFDF0] border-4 border-[#09090B] px-3 py-1.5 rounded-full shadow-[3px_3px_0px_#09090B] cursor-pointer"
          id="back-to-onboarding"
        >
          <ArrowLeft className="w-4 h-4 text-[#09090B] stroke-[3px]" /> back
        </button>
        <span className="bg-[#C6FF00] text-[#09090B] text-xs px-3 py-1.5 rounded-full border-2 border-[#09090B] font-bold uppercase tracking-wider font-display shadow-[2px_2px_0px_#09090B]">
          Step 2 of 2
        </span>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#09090B] leading-tight">
          money <br /><span className="text-[#FF2A85]">check-in</span>
        </h2>
        <p className="text-xs text-[#09090B]/80 mt-1.5 font-sans font-semibold">
          no judgement zone, {profile.name}. just rough numbers. Be 100% honest!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Income Block */}
        <div className="space-y-3 border-4 border-[#09090B] rounded-2xl p-4 bg-[#FFFDF0] shadow-[4px_4px_0px_0px_#09090B]">
          <div className="flex justify-between items-center gap-2">
            <label className="text-sm font-display font-bold text-[#09090B] flex items-center gap-1.5" htmlFor="monthly-income-text">
              <Wallet className="w-4 h-4 text-[#FF2A85] stroke-[2.5px]" /> Monthly allowance / Income
            </label>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-[#09090B] text-sm">₹</span>
              <input
                id="monthly-income-text"
                type="number"
                value={customIncome}
                onChange={(e) => handleIncomeTextChange(e.target.value)}
                onBlur={() => {
                  if (!customIncome || parseInt(customIncome) < 0) {
                    setCustomIncome(String(monthlyIncome));
                  }
                }}
                className="w-24 bg-white border-4 border-[#09090B] rounded-xl px-2 py-1 text-center font-display font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A85] shadow-[2px_2px_0px_#09090B]"
                placeholder="Type here"
              />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-[#FF2A85]" data-testid="income-value">
            ₹{monthlyIncome.toLocaleString('en-IN')}
          </div>
          <input
            id="monthly-income-slider"
            type="range"
            min="100"
            max="100000"
            step="500"
            value={monthlyIncome > 100000 ? 100000 : monthlyIncome}
            onChange={(e) => handleIncomeSliderChange(parseInt(e.target.value))}
            className="cb-range"
          />
          <div className="flex justify-between text-[10px] text-[#09090B]/60 font-mono font-bold">
            <span>₹100</span>
            <span>₹1,00,000+</span>
          </div>
          <p className="text-[10px] text-[#09090B]/65 font-sans font-semibold italic">
            💡 Making more than ₹1,00,000? Use the text box above to type in any custom amount!
          </p>
        </div>

        {/* Expenses Block */}
        <div className="space-y-3 border-4 border-[#09090B] rounded-2xl p-4 bg-[#FFFDF0] shadow-[4px_4px_0px_0px_#09090B]">
          <div className="flex justify-between items-center gap-2">
            <label className="text-sm font-display font-bold text-[#09090B] flex items-center gap-1.5" htmlFor="monthly-spend-text">
              <TrendingUp className="w-4 h-4 text-[#FF2A85] stroke-[2.5px]" /> Roughly, monthly spending
            </label>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-[#09090B] text-sm">₹</span>
              <input
                id="monthly-spend-text"
                type="number"
                value={customSpend}
                onChange={(e) => handleSpendTextChange(e.target.value)}
                onBlur={() => {
                  if (!customSpend || parseInt(customSpend) < 0) {
                    setCustomSpend(String(monthlySpend));
                  }
                }}
                className="w-24 bg-white border-4 border-[#09090B] rounded-xl px-2 py-1 text-center font-display font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A85] shadow-[2px_2px_0px_#09090B]"
                placeholder="Type here"
              />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-[#7A1B6E]" data-testid="spending-value">
            ₹{monthlySpend.toLocaleString('en-IN')}
          </div>
          <input
            id="monthly-spend-slider"
            type="range"
            min="0"
            max={Math.max(100000, monthlyIncome)}
            step="500"
            value={monthlySpend > Math.max(100000, monthlyIncome) ? Math.max(100000, monthlyIncome) : monthlySpend}
            onChange={(e) => handleSpendSliderChange(parseInt(e.target.value))}
            className="cb-range"
          />
          <div className="flex justify-between text-[10px] text-[#09090B]/65 font-mono font-bold">
            <span>₹0</span>
            <span>₹1,00,000+</span>
          </div>
          <p className="text-[10px] text-[#09090B]/65 font-sans font-semibold italic">
            💡 Spending more than ₹1,00,000? Use the text box above to type in any custom spend!
          </p>
        </div>

        {/* Live Saving Math Display */}
        <div className="bg-[#C6FF00] border-4 border-[#09090B] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#09090B]">
          <div className="text-xs font-display font-bold uppercase opacity-80 mb-0.5">left over / could save</div>
          <div className="text-3xl font-display font-bold text-[#09090B]" data-testid="savings-estimate">
            ₹{savings.toLocaleString('en-IN')} <span className="text-sm opacity-80">/ month</span>
          </div>
        </div>

        {/* Real-time Bestie Response */}
        <AnimatePresence mode="wait">
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border-4 border-[#09090B] rounded-2xl p-4 flex gap-2.5 items-start ${feedback.bg} shadow-[4px_4px_0px_#09090B]`}
          >
            {feedback.icon}
            <p className="text-xs font-sans text-[#09090B] leading-relaxed font-semibold">
              {feedback.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Sticker button for complete */}
        <button
          type="submit"
          className="sticker-btn w-full py-4 flex items-center justify-center gap-1.5 cursor-pointer text-lg"
          id="complete-check-in"
        >
          <span>take me to the planner 🚀</span>
        </button>
      </form>
    </motion.div>
  );
};
