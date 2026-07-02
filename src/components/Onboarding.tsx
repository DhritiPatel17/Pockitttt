import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PiggyBank } from './Mascot';
import { Confetti } from './Confetti';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(15);
  const [gender, setGender] = useState('Rather Not Say');
  const [role, setRole] = useState<'Student' | 'Employed' | 'Other'>('Student');
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("We need your name, bestie! Or a cool nickname!");
      return;
    }
    if (!age || age <= 0 || age > 120) {
      setError("Please enter a valid age, bestie!");
      return;
    }
    setError('');
    setShowConfetti(true);
    setTimeout(() => {
      onComplete({ name: name.trim(), age, gender, role });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      className="w-full max-w-xl mx-auto sticker-card p-8 md:p-10 relative overflow-hidden"
      id="onboarding-card"
    >
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <div className="absolute top-4 right-4">
        <PiggyBank className="w-14 h-14" />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-display font-bold text-xs bg-[#C6FF00] text-[#09090B] border-2 border-[#09090B] px-3 py-1 rounded-full shadow-[2px_2px_0px_#09090B] uppercase tracking-wide">
            Step 1 of 2
          </span>
          <span className="flex gap-1 text-sm text-[#09090B]/75 font-mono">
            <Sparkles className="w-4 h-4 fill-[#FEF08A] stroke-[#09090B] stroke-[2px]" /> vibe check
          </span>
        </div>
        <h2 className="text-3xl font-display font-bold text-[#09090B] leading-tight select-none">
          quick intro,<br />
          <span className="text-[#FF2A85]">no cap.</span>
        </h2>
        <p className="text-xs font-sans font-medium text-[#09090B]/85 mt-2">
          just so we don't talk to you like a stranger. Ready to stop being broke? Let's check who you are.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <label className="block text-sm font-display font-bold text-[#09090B]" htmlFor="teen-name">
            what should we call you? *
          </label>
          <input
            id="teen-name"
            type="text"
            placeholder="e.g. ananya, dev, sam..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value) setError('');
            }}
            maxLength={18}
            className="w-full bg-white border-4 border-[#09090B] rounded-2xl p-4 font-sans text-lg text-[#09090B] placeholder:text-[#09090B]/40 focus:outline-none focus:ring-4 focus:ring-[#FF2A85]/20 focus:border-[#FF2A85] transition-all shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)]"
          />
          {error && (
            <p className="text-xs text-red-500 font-bold font-mono">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Age - Let user enter their age (no maximum of 19) */}
        <div className="space-y-2">
          <label className="block text-sm font-display font-bold text-[#09090B]" htmlFor="teen-age">
            how old are you? *
          </label>
          <input
            id="teen-age"
            type="number"
            placeholder="e.g. 16, 20, 25..."
            value={age || ''}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseInt(e.target.value);
              setAge(val === '' ? 0 : val);
              if (val !== '') setError('');
            }}
            min="1"
            max="120"
            className="w-full bg-white border-4 border-[#09090B] rounded-2xl p-4 font-sans text-lg text-[#09090B] placeholder:text-[#09090B]/40 focus:outline-none focus:ring-4 focus:ring-[#FF2A85]/20 focus:border-[#FF2A85] transition-all shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)]"
          />
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-display font-bold text-[#09090B]">
            pronouns (optional vibe):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'she/her', val: 'Female' },
              { label: 'he/him', val: 'Male' },
              { label: 'they/them', val: 'Nonbinary' },
              { label: 'skip this', val: 'Rather Not Say' }
            ].map((g) => (
              <button
                key={g.val}
                type="button"
                onClick={() => setGender(g.val)}
                className={`inline-flex items-center justify-center font-display text-xs font-bold border-4 border-[#09090B] rounded-full py-2 px-3 shadow-[4px_4px_0px_0px_#09090B] transition-all cursor-pointer ${
                  gender === g.val
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-[#FFFDF0] text-[#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#09090B]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role Selectable Cards */}
        <div className="space-y-2">
          <label className="block text-sm font-display font-bold text-[#09090B]">
            are you currently...
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Student', label: 'Student 🎒', sub: 'School/College' },
              { id: 'Employed', label: 'Earning 💼', sub: 'Part-time/Job' },
              { id: 'Other', label: 'Other 🛸', sub: '' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id as any)}
                className={`p-3 text-left border-4 border-[#09090B] rounded-2xl transition-all h-full flex flex-col justify-between cursor-pointer ${
                  role === item.id
                    ? 'bg-[#FEF08A] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] font-bold'
                    : 'bg-white text-[#09090B]/90 hover:bg-stone-50'
                }`}
              >
                <span className="text-xs font-display font-bold tracking-tight">{item.label}</span>
                <span className="text-[9px] text-[#09090B]/50 font-mono mt-1.5 mt-auto block leading-none">
                  {item.sub || <span className="opacity-0">placeholder</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sticker button for submit */}
        <button
          type="submit"
          className="sticker-btn w-full py-4 mt-2 flex items-center justify-center gap-2 cursor-pointer text-base bg-[#FAF8ED]"
          id="submit-onboarding"
        >
          <span>let's get your bag</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
        </button>
      </form>
    </motion.div>
  );
};
