export interface MoneyPersonality {
  id: string;
  title: string;
  emoji: string;
  descriptionTemplate: string;
}

export const moneyPersonalities: MoneyPersonality[] = [
  {
    id: 'streak_royalty',
    title: 'The Streak Royalty',
    emoji: '👑',
    descriptionTemplate: 'With a {streak}-day daily streak, you are absolute royalty! As a {role}, your dedication to tracking is literally elite behavior. Keep cooking! 🍳✨'
  },
  {
    id: 'quiet_stacker',
    title: 'The Quiet Stacker',
    emoji: '🧘💰',
    descriptionTemplate: 'You saved a massive {savingsPercent}% of your pocket money! No showing off, just silent luxury. As a {role} of {age} years, you are securing the future fr fr.'
  },
  {
    id: 'plot_twist',
    title: 'The Plot Twist Saver',
    emoji: '📈',
    descriptionTemplate: 'Your {savingsPercent}% surplus is an absolute plot twist! Going from casual spends to disciplined stacks. The vibes are immaculate! ✨💸'
  },
  {
    id: 'vibes_budgeter',
    title: 'The Vibes-Based Budgeter',
    emoji: '✨',
    descriptionTemplate: 'You kept a steady {savingsPercent}% surplus. Inconsistent? Maybe. Aesthetic? Always. Keeping the vibe balanced as a {role}! 💅☕'
  },
  {
    id: 'comeback_era',
    title: 'The Comeback Era',
    emoji: '🔁',
    descriptionTemplate: 'A small {savingsPercent}% surplus, but this is literally your comeback arc! Starting small means the growth is going to be exponential. We believe in you! 🚀'
  },
  {
    id: 'miser_mode',
    title: 'Miser Mode Activated',
    emoji: '🎚️',
    descriptionTemplate: 'Saving over 50% is crazy! You saved {savingsPercent}% of your allowance! Are you eating air for dinner? Share the cheat codes, genius! 🌪️👑'
  },
  {
    id: 'fast_tracker',
    title: 'The Fast-Track Gen-Z',
    emoji: '🏎️💨',
    descriptionTemplate: 'Saving {savingsPercent}% at {age} years old? You are speedrunning financial independence. Your future self is cheering so loud!'
  },
  {
    id: 'chaos_coordinator',
    title: 'The Chaos Coordinator',
    emoji: '🌪️',
    descriptionTemplate: 'Saving exactly 0% but coordination is key! Live fast, budget chaotic. Let\'s make sure we save at least one coin next month! 🪙🔒'
  }
];

export function getMoneyPersonality(savingsPercent: number, role: string, age: number, streak: number): MoneyPersonality {
  const normalizedRole = role ? role.toLowerCase() : 'student';

  // 1. Streak Royalty (high priority if streak >= 7)
  if (streak >= 7) {
    const p = moneyPersonalities.find(x => x.id === 'streak_royalty')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{streak}', String(streak))
        .replace('{role}', normalizedRole)
    };
  }

  // 2. High/Extreme Savings (>= 50%)
  if (savingsPercent >= 50) {
    const p = moneyPersonalities.find(x => x.id === 'miser_mode')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', savingsPercent.toFixed(0))
        .replace('{role}', normalizedRole)
    };
  }

  // 3. Excellent Savings (30% to 50%)
  if (savingsPercent >= 30) {
    const p = moneyPersonalities.find(x => x.id === 'quiet_stacker')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', savingsPercent.toFixed(0))
        .replace('{role}', normalizedRole)
        .replace('{age}', String(age))
    };
  }

  // 4. Young Fast Tracker (age < 18, savingsPercent >= 15)
  if (age < 18 && savingsPercent >= 15) {
    const p = moneyPersonalities.find(x => x.id === 'fast_tracker')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', savingsPercent.toFixed(0))
        .replace('{age}', String(age))
    };
  }

  // 5. Moderate Savings (10% to 30%)
  if (savingsPercent >= 10) {
    const p = moneyPersonalities.find(x => x.id === 'vibes_budgeter')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', savingsPercent.toFixed(0))
        .replace('{role}', normalizedRole)
    };
  }

  // 6. Plot Twist (some savings but low, 1% to 10%)
  if (savingsPercent > 0 && savingsPercent < 10) {
    const p = moneyPersonalities.find(x => x.id === 'plot_twist') || moneyPersonalities.find(x => x.id === 'comeback_era')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', savingsPercent.toFixed(0))
        .replace('{role}', normalizedRole)
    };
  }

  // 7. Comeback era (negative or 0, with active streak or just starting)
  if (savingsPercent <= 0) {
    const p = moneyPersonalities.find(x => x.id === 'chaos_coordinator')!;
    return {
      ...p,
      descriptionTemplate: p.descriptionTemplate
        .replace('{savingsPercent}', '0')
        .replace('{role}', normalizedRole)
    };
  }

  // Fallback
  const fallback = moneyPersonalities.find(x => x.id === 'comeback_era')!;
  return {
    ...fallback,
    descriptionTemplate: fallback.descriptionTemplate
      .replace('{savingsPercent}', savingsPercent.toFixed(0))
      .replace('{role}', normalizedRole)
  };
}
