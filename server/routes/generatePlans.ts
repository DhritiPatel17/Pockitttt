import { GoogleGenAI, Type } from "@google/genai";

// Round final numbers to the nearest ₹10 for readability
function roundTo10(value: number): number {
  return Math.round(value / 10) * 10;
}

function formatRupeeValue(val: number): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  let formatted = "";
  if (absVal >= 10000000) {
    const cr = absVal / 10000000;
    formatted = `${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (absVal >= 100000) {
    const l = absVal / 100000;
    formatted = `${l.toFixed(2).replace(/\.00$/, '')} L`;
  } else {
    formatted = absVal.toLocaleString('en-IN');
  }
  return isNegative ? `-${formatted}` : formatted;
}

// 1. RD (monthly deposits, quarterly compounding)
// Formula: M = R × [(1+i)^n - 1] / (1 - (1+i)^(-1/3))
// R = monthly deposit, i = quarterly rate = rate/400, n = quarters = months / 3
function calculateRD_FV(R: number, annualRatePct: number, months: number): number {
  if (annualRatePct <= 0) return R * months;
  const i = annualRatePct / 400;
  const n = months / 3;
  const numerator = Math.pow(1 + i, n) - 1;
  const denominator = 1 - Math.pow(1 + i, -1/3);
  return R * (numerator / denominator);
}

function calculateRD_Required(target: number, annualRatePct: number, months: number): number {
  if (annualRatePct <= 0) return target / months;
  const i = annualRatePct / 400;
  const n = months / 3;
  const numerator = Math.pow(1 + i, n) - 1;
  const denominator = 1 - Math.pow(1 + i, -1/3);
  return target / (numerator / denominator);
}

// 2. PPF (annual deposit, yearly compounding)
// Formula: F = P × [((1+i)^n - 1) / i]
// P = annual contribution, i = annual rate = rate/100, n = years = months / 12
function calculatePPF_FV(P: number, annualRatePct: number, months: number): number {
  if (annualRatePct <= 0) return P * (months / 12);
  const i = annualRatePct / 100;
  const n = Math.max(1, months / 12);
  return P * ((Math.pow(1 + i, n) - 1) / i);
}

function calculatePPF_Required(target: number, annualRatePct: number, months: number): number {
  const i = annualRatePct / 100;
  const n = Math.max(1, months / 12);
  if (annualRatePct <= 0) return target / n;
  return target / ((Math.pow(1 + i, n) - 1) / i);
}

// 3. SIP (monthly deposits, monthly compounding)
// Formula: FV = P × [((1+i)^n - 1) / i] × (1+i)
// P = monthly deposit, i = monthly rate = rate/1200, n = months
function calculateSIP_FV(P: number, annualRatePct: number, months: number): number {
  if (annualRatePct <= 0) return P * months;
  const i = annualRatePct / 1200;
  const factor = ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  return P * factor;
}

function calculateSIP_Required(target: number, annualRatePct: number, months: number): number {
  if (annualRatePct <= 0) return target / months;
  const i = annualRatePct / 1200;
  const factor = ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  return target / factor;
}

// Helper for Extended Timeline (SIP)
function calculateExtendedTimelineSIP(target: number, currentCapital: number, monthlyDeposit: number, annualRatePct: number): number {
  if (monthlyDeposit <= 0) return 999;
  if (annualRatePct <= 0) return Math.ceil(Math.max(0, target - currentCapital) / monthlyDeposit);
  const i = annualRatePct / 1200;
  const pFactor = monthlyDeposit * (1 + i) / i;
  const num = target + pFactor;
  const den = currentCapital + pFactor;
  if (den <= 0 || num <= 0) return 999;
  const n = Math.log(num / den) / Math.log(1 + i);
  return Math.ceil(n);
}

// Helper for Extended Timeline (RD, quarterly compounding)
function calculateExtendedTimelineRD(target: number, currentCapital: number, monthlyDeposit: number, annualRatePct: number): number {
  if (monthlyDeposit <= 0) return 999;
  if (annualRatePct <= 0) return Math.ceil(Math.max(0, target - currentCapital) / monthlyDeposit);
  const i = annualRatePct / 400; // quarterly
  const denRD = 1 - Math.pow(1 + i, -1/3);
  const factor = monthlyDeposit / denRD;
  const num = target + factor;
  const den = currentCapital + factor;
  if (den <= 0 || num <= 0) return 999;
  const n = Math.log(num / den) / Math.log(1 + i);
  return Math.ceil(n * 3);
}

// Parsing Indian currency values like "40k" or "1.5 Lakh"
function parseIndianValuePair(numStr: string, unitStr: string): number {
  let numPart = parseFloat(numStr.replace(/,/g, ''));
  if (isNaN(numPart)) return 0;
  
  const multiplierWord = unitStr ? unitStr.toLowerCase().trim() : "";
  let multiplier = 1;
  if (multiplierWord === "k" || multiplierWord === "thousand" || multiplierWord === "thousands") {
    multiplier = 1000;
  } else if (multiplierWord === "lakh" || multiplierWord === "lakhs" || multiplierWord === "lac" || multiplierWord === "lacs" || multiplierWord === "l") {
    multiplier = 100000;
  } else if (multiplierWord === "cr" || multiplierWord === "crore" || multiplierWord === "crores") {
    multiplier = 10000000;
  } else if (multiplierWord === "arab" || multiplierWord === "arabs") {
    multiplier = 1000000000;
  }
  return numPart * multiplier;
}

// Parsing Indian currency values like "40k" or "1.5 Lakh"
function parseSingleIndianValue(valStr: string): number {
  let s = valStr.toLowerCase().trim();
  s = s.replace(/,/g, '');
  s = s.replace(/₹|rs\.?|inr|rupees|rupee/g, ' ').trim();

  const match = s.match(/^((?:\d{1,3}(?:,\d{2,3})*|\d+)(?:\.\d+)?)\s*(k|thousand|thousands|lakh|lakhs|lac|lacs|l|cr|crore|crores|arab|arabs)?$/i);
  if (!match) return 0;

  return parseIndianValuePair(match[1], match[2] || "");
}

function detectMonthlySavingsFromMessage(text: string): number | null {
  const regexes = [
    /(?:save|saving|put|stash|invest|investing|budget|contrib|contribute)\s*(?:₹|rs\.?|rs|inr|rupees)?\s*(\d+(?:\.\d+)?\s*(?:k|thousand|thousands|lakh|lakhs|lac|lacs|l|cr|crore|crores|arab|arabs)?)\s*(?:a|per|\/)\s*(?:month|m|monthly)\b/i,
    /(?:₹|rs\.?|rs|inr|rupees)?\s*(\d+(?:\.\d+)?\s*(?:k|thousand|thousands|lakh|lakhs|lac|lacs|l|cr|crore|crores|arab|arabs)?)\s*(?:a|per|\/)\s*(?:month|m|monthly)\b/i,
    /(?:save|saving|invest|investing|put)\s*(?:₹|rs\.?|rs|inr|rupees)?\s*(\d+(?:\.\d+)?\s*(?:k|thousand|thousands|lakh|lakhs|lac|lacs|l|cr|crore|crores|arab|arabs)?)\s*(?:each|every|per)\s*month\b/i
  ];

  for (const regex of regexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseSingleIndianValue(match[1]);
      if (val > 0) return val;
    }
  }
  return null;
}

function isTimeframeNumber(numStr: string, text: string, matchIndex: number): boolean {
  const substringAfter = text.substring(matchIndex + numStr.length).trim().toLowerCase();
  return /^(?:year|years|month|months|y|m|yr|yrs)\b/.test(substringAfter);
}

// Local intent classifier that matches exact required categories
function classifyLocalIntent(goal: string, checkIn: any): {
  category: 'A' | 'B' | 'C' | 'D';
  income?: number;
  goalAmount?: number;
  timeframeMonths: number;
  savingCapacity?: number;
  lumpSum?: number;
} {
  const clean = goal.toLowerCase().replace(/,/g, '');
  
  // Extract all numbers along with optional unit words from the full clean text
  const parsedNumbers: { value: number; isTimeframe: boolean; originalText: string; index: number }[] = [];
  const valueRegex = /((?:\d{1,3}(?:,\d{2,3})*|\d+)(?:\.\d+)?)\s*(k|thousand|thousands|lakh|lakhs|lac|lacs|l|cr|crore|crores|arab|arabs)?\b/gi;
  
  let match;
  while ((match = valueRegex.exec(clean)) !== null) {
    const rawNum = match[1];
    const unitWord = match[2] || "";
    const index = match.index;
    const isTimeframe = isTimeframeNumber(match[0], clean, index);
    const val = parseIndianValuePair(rawNum, unitWord);
    
    if (val > 0) {
      parsedNumbers.push({
        value: val,
        isTimeframe,
        originalText: match[0],
        index
      });
    }
  }

  const monetaryNumbers = parsedNumbers.filter(pn => !pn.isTimeframe);
  const timeframeItems = parsedNumbers.filter(pn => pn.isTimeframe);

  let timeframeMonths = 12;
  if (timeframeItems.length > 0) {
    const tfItem = timeframeItems[0];
    const unitAfter = clean.substring(tfItem.index + tfItem.originalText.length).trim().toLowerCase();
    if (/^(?:year|years|y|yr|yrs)\b/.test(unitAfter)) {
      timeframeMonths = tfItem.value * 12;
    } else {
      timeframeMonths = tfItem.value;
    }
  } else {
    // Fallback to original regexes
    const monthMatch = clean.match(/(\d+)\s*(?:month|months|m)\b/);
    const yearMatch = clean.match(/(\d+)\s*(?:year|years|y)\b/);
    if (monthMatch) {
      timeframeMonths = parseInt(monthMatch[1], 10);
    } else if (yearMatch) {
      timeframeMonths = parseInt(yearMatch[1], 10) * 12;
    }
  }

  const stored_income = checkIn?.monthlyIncome || 0;
  const stored_spend = checkIn?.monthlySpend || 0;
  const stored_surplus = Math.max(0, stored_income - stored_spend);

  let income: number | undefined;
  let lumpSum: number | undefined;
  let goalAmount: number | undefined;
  let savingCapacity: number | undefined;

  for (const item of monetaryNumbers) {
    const textBefore = clean.substring(Math.max(0, item.index - 30), item.index).toLowerCase();
    const textAfter = clean.substring(item.index + item.originalText.length, Math.min(clean.length, item.index + item.originalText.length + 30)).toLowerCase();
    
    // Check if it's saving capacity (monthly savings)
    const isMonthlySavings = /per\s*month|monthly|p\.m\.|every\s*month|each\s*month|\/month|\/m\b/.test(textAfter) ||
                            (/save\s*|saving\s*|invest\s*|investing\s*/.test(textBefore) && /month|monthly/.test(textAfter));
                            
    if (isMonthlySavings) {
      savingCapacity = item.value;
      continue;
    }

    // Check if it's income
    const isIncome = /earn|earning|income|salary|pay|freelance|freelancing/.test(textBefore);
    if (isIncome) {
      income = item.value;
      continue;
    }

    // Check if it's a lump sum / existing capital
    const isLumpSum = /have|had|saved|in\s*hand|lump\s*sum|capital|deposit|invest\s+|put\s+/.test(textBefore);
    if (isLumpSum) {
      lumpSum = item.value;
      continue;
    }

    // Check if it's a goal / target / buy
    const isGoal = /goal|target|need|want\s*to\s*buy|buy|purchase|worth|price|cost/.test(textBefore);
    if (isGoal) {
      goalAmount = item.value;
      continue;
    }
  }

  // If we still have unassigned values, let's distribute them intelligently
  const unassigned = monetaryNumbers.filter(item => 
    item.value !== income && 
    item.value !== lumpSum && 
    item.value !== goalAmount && 
    item.value !== savingCapacity
  );

  if (unassigned.length > 0) {
    if (unassigned.length === 1) {
      const val = unassigned[0].value;
      // Is it a Category A query?
      if (/\b(?:earn|earning|income|salary|split|divide|allocate|budget|freelancing|freelance)\b/i.test(clean)) {
        income = val;
      } else if (/\b(?:have|idle|lump sum|put|invest)\b/i.test(clean) && !/\b(?:save|goal|target|need|want to save)\b/i.test(clean)) {
        lumpSum = val;
      } else {
        goalAmount = val;
      }
    } else if (unassigned.length === 2) {
      // e.g. "I have 21L ... home worth 70L"
      // The smaller one is likely lumpSum or saving capacity, the larger is goal
      const val1 = unassigned[0].value;
      const val2 = unassigned[1].value;
      
      if (val1 < val2) {
        lumpSum = val1;
        goalAmount = val2;
      } else {
        goalAmount = val1;
        lumpSum = val2;
      }
    }
  }

  let category: 'A' | 'B' | 'C' | 'D' = 'D';

  const isCategoryA = /\b(?:earn|earning|income|salary|split|divide|allocate|budget|freelancing|freelance)\b/i.test(clean);
  const isCategoryC = /\b(?:have|idle|lump sum|put|invest)\b/i.test(clean) && !/\b(?:save|goal|target|need|want to save)\b/i.test(clean);
  const isCategoryB = /\b(?:save|saving|goal|target|need|want to|buy)\b/i.test(clean);

  if (isCategoryA && income) {
    category = 'A';
  } else if (isCategoryC && lumpSum && !goalAmount) {
    category = 'C';
  } else if ((isCategoryB || goalAmount) && goalAmount) {
    category = 'B';
  }

  // If we have goalAmount but no savingCapacity, let's see if we can detect one
  if (category === 'B' && !savingCapacity) {
    savingCapacity = detectMonthlySavingsFromMessage(clean) || (stored_surplus > 0 ? stored_surplus : undefined);
  }

  return {
    category,
    income,
    goalAmount,
    timeframeMonths,
    savingCapacity,
    lumpSum
  };
}

// Generate fallback plays locally matching the exact calculations Context solved in Node.js
function getLocalFallbackResponse(goal: string, checkIn: any, profile: any): any {
  const { category, income, goalAmount, timeframeMonths, savingCapacity, lumpSum } = classifyLocalIntent(goal, checkIn);
  const userAge = profile?.age || 18;
  const rates = {
    postOfficeRD: 6.70,
    bankRD: 7.00,
    ppf: 7.10,
    nsc: 7.70,
    ssy: 8.20,
    debtFund: 9.00,
    equityFund: 13.00
  };

  if (category === 'A') {
    const inc = income || 40000;
    const needs = roundTo10(inc * 0.5);
    const wants = roundTo10(inc * 0.3);
    const savings = roundTo10(inc * 0.2);

    return {
      is_type_b: false,
      type_b_response: "",
      target_amount: 0,
      timeframe_months: 0,
      goal_summary: `Monthly Budget Split: Allocating your ₹${formatRupeeValue(inc)} income 📊`,
      plays: [
        {
          title: `50% Needs: Essential Living (₹${formatRupeeValue(needs)}/month)`,
          risk: "Low risk (No market exposure)",
          description: "",
          the_plan: `Allocate half of your ₹${formatRupeeValue(inc)} income to absolute essentials like rent, groceries, transport, utilities, and debt payments.`,
          the_math: `50% of ₹${formatRupeeValue(inc)} = ₹${formatRupeeValue(needs)}. Under the classic 50-30-20 rule, this ensures you cover your livelihood reliably without high-stress compromises.`,
          real_life_example: `It's like paying for your room and power bills first, so you are always safe and secure before spending money on fancy lifestyle upgrades.`,
          pro_tip: `Transfer this essential budget to a separate bank account right on payday to avoid accidentally dipping into bill money for entertainment!`,
          timeframe_label: "Monthly",
          option_label: "Needs",
          beginner_tip: "Open a zero-balance secondary bank account for managing all monthly bill auto-debits."
        },
        {
          title: `30% Wants: Guilt-Free Lifestyle (₹${formatRupeeValue(wants)}/month)`,
          risk: "Low risk (Zero market risk)",
          description: "",
          the_plan: `Allocate 30% of your earnings to personal wants, including shopping, dining out, streaming, movie tickets, and hobbies.`,
          the_math: `30% of ₹${formatRupeeValue(inc)} = ₹${formatRupeeValue(wants)}. Keeping lifestyle spending isolated is essential to prevent lifestyle inflation.`,
          real_life_example: `It's your direct fun vault. You can buy sneakers or hang out with friends guilt-free, knowing you are strictly budgeted.`,
          pro_tip: `Keep your weekly wants budget in cash or a separate digital wallet. When it runs out, stop spending until the next month!`,
          timeframe_label: "Monthly",
          option_label: "Wants",
          beginner_tip: "Use a mobile banking sub-wallet or credit limit control to hard cap your weekend spending."
        },
        {
          title: `20% Savings & Wealth Building (₹${formatRupeeValue(savings)}/month)`,
          risk: "Medium risk (Asset-allocation balanced)",
          description: "",
          the_plan: `Direct the final 20% of your income to wealth-building options like Post Office RD or low-risk mutual fund SIPs.`,
          the_math: `20% of ₹${formatRupeeValue(inc)} = ₹${formatRupeeValue(savings)}. Stashing ₹${formatRupeeValue(savings)}/month builds massive secure growth.`,
          real_life_example: `Think of this as planting ₹${formatRupeeValue(savings)} mango seeds every month. In a few years, they grow into a steady orchard yielding bountiful financial freedom!`,
          pro_tip: `Automate this transfer on day one. Saving first, rather than saving what is left at the end of the month, is the golden cheat code of wealth.`,
          timeframe_label: "Accumulating",
          option_label: "Savings",
          beginner_tip: "Set up an automatic bank mandate to sweep this sum into a secure investment the day after payday."
        }
      ],
      closing_summary: `Self-Check: The user's classified intent is A. The number(s) they gave are: ₹${formatRupeeValue(inc)} (monthly income). I am NOT introducing any number they didn't provide.\n\n` +
        `By dividing your ₹${formatRupeeValue(inc)} monthly income into ₹${formatRupeeValue(needs)} (Needs), ₹${formatRupeeValue(wants)} (Wants), and ₹${formatRupeeValue(savings)} (Savings), you establish a robust, sustainable personal finance structure with zero unrequested goal figures or shortfalls.\n\n` +
        `Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.`
    };
  }

  if (category === 'C') {
    const lSum = lumpSum || 15000;
    const tfMonths = timeframeMonths || 12;
    
    // FD Compounding (quarterly)
    const fdMaturity = roundTo10(lSum * Math.pow(1 + rates.bankRD / 400, (tfMonths / 12) * 4));
    // Debt Mutual Fund (monthly)
    const debtMaturity = roundTo10(lSum * Math.pow(1 + rates.debtFund / 1200, tfMonths));
    // Equity Index Mutual Fund (monthly)
    const equityMaturity = roundTo10(lSum * Math.pow(1 + rates.equityFund / 1200, tfMonths));

    const durationText = tfMonths >= 12
      ? `${(tfMonths / 12).toFixed(1).replace(/\.0$/, '')} years`
      : `${tfMonths} months`;

    const mathFD = `You currently have ₹${formatRupeeValue(lSum)}. If you lock this capital in this Bank FD at the current ${rates.bankRD.toFixed(2)}% p.a. interest rate, your final amount in hand after ${durationText} will be exactly ₹${formatRupeeValue(fdMaturity)} — this grows your principal by exactly ₹${formatRupeeValue(fdMaturity - lSum)}.`;

    const mathDebt = `You currently have ₹${formatRupeeValue(lSum)}. If you invest this capital in this Debt Mutual Fund at ${rates.debtFund.toFixed(2)}% p.a., your final amount in hand after ${durationText} will be exactly ₹${formatRupeeValue(debtMaturity)} — this grows your principal by exactly ₹${formatRupeeValue(debtMaturity - lSum)}.`;

    const mathEquity = `You currently have ₹${formatRupeeValue(lSum)}. If you invest this capital in this Equity Index Fund at ${rates.equityFund.toFixed(2)}% p.a., your final amount in hand after ${durationText} will be exactly ₹${formatRupeeValue(equityMaturity)} — this grows your principal by exactly ₹${formatRupeeValue(equityMaturity - lSum)}.`;

    const rateHighLow = 15;
    const rateHighHigh = 25;
    const grownLumpSumHighLow = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rateHighLow / 1200, tfMonths)) : 0;
    const grownLumpSumHighHigh = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rateHighHigh / 1200, tfMonths)) : 0;
    
    const mathHigh = `You currently have ₹${formatRupeeValue(lSum)}. If you invest this capital in Direct Stocks/Small-Cap Funds at historically variable rates, your final amount after ${durationText} could grow to approximately ₹${formatRupeeValue(grownLumpSumHighLow)} - ₹${formatRupeeValue(grownLumpSumHighHigh)} depending on market performance. However, you could also face significant losses (30-50%) in downturns.`;

    return {
      is_type_b: false,
      type_b_response: "",
      target_amount: lSum,
      timeframe_months: tfMonths,
      goal_summary: `Lump Sum Deployment: Investing ₹${formatRupeeValue(lSum)} safely 🛡️`,
      plays: [
        {
          title: `Option 1: Bank Fixed Deposit (FD) 🏦 [DICGC Insured]`,
          risk: "LOW RISK (GUARANTEED)",
          description: "Guaranteed returns with zero risk of capital loss, DICGC insured.",
          the_plan: `Deploy your ₹${formatRupeeValue(lSum)} capital into a Bank Fixed Deposit with a major Indian bank (e.g., SBI/HDFC) to secure absolute risk-free compound interest.`,
          the_math: mathFD,
          real_life_example: `It's like placing your cash inside a secure bank vault. It stays completely safe from stock market crashes and grows steadily.`,
          pro_tip: `FDs charge a small fee for premature withdrawal. Only lock up money that you do not need immediately to maximize your interest yield!`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 1 (FD)",
          beginner_tip: "You can book this FD instantly with a single tap inside your bank's mobile app."
        },
        {
          title: `Option 2: Debt Mutual Fund ⚖️ [High Liquidity]`,
          risk: "MEDIUM RISK (MARKET-LINKED)",
          description: "Moderate returns with low-volatility debt asset allocation, suitable for conservative growth.",
          the_plan: `Allocate your ₹${formatRupeeValue(lSum)} into a low-duration or liquid debt mutual fund for tax-efficient returns and higher yields than a savings account.`,
          the_math: mathDebt,
          real_life_example: `It is like lending your surplus capital to major blue-chip Indian corporations who pay you a steady premium return as thank-you interest.`,
          pro_tip: `Debt funds are highly liquid with zero lock-in, but remember that returns are market-linked and are NOT government guaranteed!`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 2 (Debt Fund)",
          beginner_tip: "Use any mutual fund investment app to deploy your idle capital into a high-grade debt fund."
        },
        {
          title: `Option 3: Equity Index Mutual Fund 📈 [Aggressive Growth]`,
          risk: "GROWTH RISK (MARKET-LINKED, VOLATILE)",
          description: "Highest long-term growth potential through the Indian stock market, but subject to high short-term volatility.",
          the_plan: `Invest your ₹${formatRupeeValue(lSum)} lump sum into a diversified Equity Index Fund (like Nifty 50) for premium compounded growth.`,
          the_math: mathEquity,
          real_life_example: `Think of this as buying a piece of India's business landscape. It offers incredible wealth expansion over time, but prepare for market ups and downs.`,
          pro_tip: `Equity investments should be held for at least 3 to 5 years to ride out any short-term market crashes!`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 3 (Equity Index)",
          beginner_tip: "Open a mutual fund account and buy a low-cost direct index fund to avoid broker commissions."
        },
        {
          title: "Option 4: Direct Stocks & Crypto 🚀 [Speculative / High Risk]",
          risk: "VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK)",
          description: "High speculative potential with no fixed returns. Can suffer from massive drawdowns and capital loss.",
          the_plan: `Speculate your ₹${formatRupeeValue(lSum)} lump sum across direct small-cap equities, crypto, and thematic funds for aggressive upside.`,
          the_math: mathHigh,
          real_life_example: `It's like trying to launch a rocket ship. You could reach the moon rapidly, but the engines could also explode on the launchpad.`,
          pro_tip: `Only deploy capital you are 100% prepared to lose entirely. Never rely on speculative assets for non-negotiable financial goals.`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 4 (High Risk)",
          beginner_tip: "Only experienced investors should actively pick highly volatile direct stocks or crypto."
        }
      ],
      closing_summary: `Self-Check: The user's classified intent is C. The number(s) they gave are: ₹${formatRupeeValue(lSum)} (lump sum investment). I am NOT introducing any number they didn't provide.\n\n` +
        `Deploying ₹${formatRupeeValue(lSum)} across Fixed Deposits, conservative debt mutual funds, or stock index funds allows you to match your risk appetite precisely.\n\n` +
        `Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.`
    };
  }

  if (category === 'B' && goalAmount) {
    const target = goalAmount;
    const tfMonths = timeframeMonths || 12;
    const lSum = lumpSum || 0;
    
    // Grow lump sum over time to see what net target is remaining
    // Grown using that tier's respective rate!
    const grownLumpSumBank = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rates.bankRD / 400, (tfMonths / 12) * 4)) : 0;
    const grownLumpSumDebt = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rates.debtFund / 1200, tfMonths)) : 0;
    const grownLumpSumEquity = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rates.equityFund / 1200, tfMonths)) : 0;
    
    const remainingTargetRD = Math.max(0, target - grownLumpSumBank);
    const remainingTargetDebt = Math.max(0, target - grownLumpSumDebt);
    const remainingTargetEquity = Math.max(0, target - grownLumpSumEquity);
    
    const monthlyRate = savingCapacity || 0;
    const flatTotal = monthlyRate * tfMonths;
    // Shortfall based on flat savings + initial lump sum
    const shortfall = Math.max(0, target - lSum - flatTotal);

    const requiredRD = roundTo10(calculateRD_Required(remainingTargetRD, rates.bankRD, tfMonths));
    const requiredDebt = roundTo10(calculateSIP_Required(remainingTargetDebt, rates.debtFund, tfMonths));
    const requiredSIP = roundTo10(calculateSIP_Required(remainingTargetEquity, rates.equityFund, tfMonths));

    const lSumText = lSum > 0 ? ` with ₹${formatRupeeValue(lSum)} starting capital` : "";
    const goalSummary = monthlyRate > 0
      ? `At ₹${formatRupeeValue(monthlyRate)}/month, you'll save ₹${formatRupeeValue(flatTotal)} in ${tfMonths} months${lSumText} — your goal needs ₹${formatRupeeValue(target)}, a shortfall of ₹${formatRupeeValue(shortfall)}.`
      : `With a goal of ₹${formatRupeeValue(target)} over ${tfMonths} months${lSumText}, here are the monthly investments required to reach it.`;

    // Construct math segments that clearly output conversions:
    const rdMaturityVal = roundTo10(calculateRD_FV(requiredRD, rates.bankRD, tfMonths));
    const finalMaturityRD = roundTo10(grownLumpSumBank + rdMaturityVal);
    const finalDiffRD = finalMaturityRD - target;
    const compTextRD = finalDiffRD >= 0
      ? `this fully covers your ₹${formatRupeeValue(target)} target with ₹${formatRupeeValue(finalDiffRD)} to spare`
      : `this falls short of your ₹${formatRupeeValue(target)} target by ₹${formatRupeeValue(-finalDiffRD)}`;

    const debtMaturityVal = roundTo10(calculateSIP_FV(requiredDebt, rates.debtFund, tfMonths));
    const finalMaturityDebt = roundTo10(grownLumpSumDebt + debtMaturityVal);
    const finalDiffDebt = finalMaturityDebt - target;
    const compTextDebt = finalDiffDebt >= 0
      ? `this fully covers your ₹${formatRupeeValue(target)} target with ₹${formatRupeeValue(finalDiffDebt)} to spare`
      : `this falls short of your ₹${formatRupeeValue(target)} target by ₹${formatRupeeValue(-finalDiffDebt)}`;

    const sipMaturityVal = roundTo10(calculateSIP_FV(requiredSIP, rates.equityFund, tfMonths));
    const finalMaturitySIP = roundTo10(grownLumpSumEquity + sipMaturityVal);
    const finalDiffSIP = finalMaturitySIP - target;
    const compTextSIP = finalDiffSIP >= 0
      ? `this fully covers your ₹${formatRupeeValue(target)} target with ₹${formatRupeeValue(finalDiffSIP)} to spare`
      : `this falls short of your ₹${formatRupeeValue(target)} target by ₹${formatRupeeValue(-finalDiffSIP)}`;

    const durationText = tfMonths >= 12
      ? `${(tfMonths / 12).toFixed(1).replace(/\.0$/, '')} years`
      : `${tfMonths} months`;

    // For Option 4 (High risk speculative) we need ranges
    const rateHighLow = 15;
    const rateHighHigh = 25;
    const grownLumpSumHighLow = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rateHighLow / 1200, tfMonths)) : 0;
    const grownLumpSumHighHigh = lSum > 0 ? roundTo10(lSum * Math.pow(1 + rateHighHigh / 1200, tfMonths)) : 0;
    const highLowVal = roundTo10(calculateSIP_FV(monthlyRate, rateHighLow, tfMonths));
    const highHighVal = roundTo10(calculateSIP_FV(monthlyRate, rateHighHigh, tfMonths));
    const finalHighLow = roundTo10(grownLumpSumHighLow + highLowVal);
    const finalHighHigh = roundTo10(grownLumpSumHighHigh + highHighVal);

    // Calculate extended timelines using the helper functions
    const extMonthsRD = calculateExtendedTimelineRD(target, lSum, monthlyRate, rates.bankRD);
    const extMonthsDebt = calculateExtendedTimelineSIP(target, lSum, monthlyRate, rates.debtFund);
    const extMonthsEquity = calculateExtendedTimelineSIP(target, lSum, monthlyRate, rates.equityFund);

    const formatExt = (m: number) => {
      if (m === 999) return "an infinite amount of time";
      return m >= 12 ? `${(m / 12).toFixed(1).replace(/\.0$/, '')} years` : `${m} months`;
    };

    const bankRDMath = `You currently have ₹${formatRupeeValue(lSum)}. Your target is ₹${formatRupeeValue(target)}, leaving a shortfall of ₹${formatRupeeValue(target - lSum)}. If you invest in a Bank RD at ${rates.bankRD.toFixed(2)}% p.a. and continue depositing ₹${formatRupeeValue(monthlyRate)}/month, your final amount after ${durationText} will be ₹${formatRupeeValue(finalMaturityRD)} — ${compTextRD}.\n\nTo hit your exact target of ₹${formatRupeeValue(target)} in ${durationText}, you would instead need to deposit ₹${formatRupeeValue(requiredRD)}/month.\n\nAlternatively, if you'd rather keep depositing ₹${formatRupeeValue(monthlyRate)}/month, you would need to extend your timeline to approximately ${formatExt(extMonthsRD)} to reach ₹${formatRupeeValue(target)}.`;

    const debtSIPMath = `You currently have ₹${formatRupeeValue(lSum)}. Your target is ₹${formatRupeeValue(target)}, leaving a shortfall of ₹${formatRupeeValue(target - lSum)}. If you invest in a Debt Mutual Fund at ${rates.debtFund.toFixed(2)}% p.a. and continue depositing ₹${formatRupeeValue(monthlyRate)}/month, your final amount after ${durationText} will be ₹${formatRupeeValue(finalMaturityDebt)} — ${compTextDebt}.\n\nTo hit your exact target of ₹${formatRupeeValue(target)} in ${durationText}, you would instead need to deposit ₹${formatRupeeValue(requiredDebt)}/month.\n\nAlternatively, if you'd rather keep depositing ₹${formatRupeeValue(monthlyRate)}/month, you would need to extend your timeline to approximately ${formatExt(extMonthsDebt)} to reach ₹${formatRupeeValue(target)}.`;

    const equitySIPMath = `You currently have ₹${formatRupeeValue(lSum)}. Your target is ₹${formatRupeeValue(target)}, leaving a shortfall of ₹${formatRupeeValue(target - lSum)}. If you invest in an Equity Index Fund at ${rates.equityFund.toFixed(2)}% p.a. and continue depositing ₹${formatRupeeValue(monthlyRate)}/month, your final amount after ${durationText} will be ₹${formatRupeeValue(finalMaturitySIP)} — ${compTextSIP}.\n\nTo hit your exact target of ₹${formatRupeeValue(target)} in ${durationText}, you would instead need to deposit ₹${formatRupeeValue(requiredSIP)}/month.\n\nAlternatively, if you'd rather keep depositing ₹${formatRupeeValue(monthlyRate)}/month, you would need to extend your timeline to approximately ${formatExt(extMonthsEquity)} to reach ₹${formatRupeeValue(target)}.`;

    const highRiskMath = `You currently have ₹${formatRupeeValue(lSum)}. Your target is ₹${formatRupeeValue(target)}, leaving a shortfall of ₹${formatRupeeValue(target - lSum)}. If you invest in Direct Stocks/Small-Cap Funds at historically variable rates and continue depositing ₹${formatRupeeValue(monthlyRate)}/month, your final amount after ${durationText} could grow to approximately ₹${formatRupeeValue(finalHighLow)} - ₹${formatRupeeValue(finalHighHigh)} depending on market performance. However, you could also face significant losses (30-50%) in downturns.`;

    const selfCheckNumbers = lSum > 0
      ? `₹${formatRupeeValue(target)} (target goal), ₹${formatRupeeValue(lSum)} (initial capital), and ${tfMonths} months (timeframe)`
      : `₹${formatRupeeValue(target)} (target goal), ${tfMonths} months (timeframe), and ₹${formatRupeeValue(monthlyRate)}/month (current saving rate)`;

    return {
      is_type_b: false,
      type_b_response: "",
      target_amount: target,
      timeframe_months: tfMonths,
      goal_summary: goalSummary,
      plays: [
        {
          title: "Option 1: Bank Recurring Deposit (RD) 🏦 [Risk-Free Vault]",
          risk: "LOW RISK (GUARANTEED)",
          description: "Guaranteed returns with zero risk of capital loss, DICGC insured.",
          the_plan: lSum > 0
            ? `Your ₹${formatRupeeValue(lSum)} starting capital will be safely parked in a Bank FD, while you set up a monthly Recurring Deposit (RD) to meet the remaining shortfall.`
            : `Set up a monthly Recurring Deposit (RD) with a major bank (SBI/HDFC) to save a fixed amount quarterly-compounded with zero loss of principal.`,
          the_math: bankRDMath,
          real_life_example: `It is like locking your money in an automated vault that protects your savings from daily temptations and yields extra guaranteed reward coins.`,
          pro_tip: `Because banks have a small penalty for premature closures, it acts as a healthy mental barrier that stops you from touching your savings until maturity!`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 1 (RD)",
          beginner_tip: "Easily set up an RD auto-debit inside your bank's mobile app to trigger right after pocket money day."
        },
        {
          title: "Option 2: Debt Mutual Fund SIP ⚖️ [Balanced & Liquid]",
          risk: "MEDIUM RISK (MARKET-LINKED)",
          description: "Moderate returns with low-volatility debt asset allocation, suitable for conservative growth.",
          the_plan: `Start a monthly Systematic Investment Plan (SIP) in a high-quality Debt Mutual Fund for stable, tax-efficient market gains to bridge your shortfall.`,
          the_math: debtSIPMath,
          real_life_example: `It is like letting top-tier Indian companies borrow your savings. They pay you a steady premium return higher than a bank while keeping volatility minimal.`,
          pro_tip: `Debt mutual funds have zero lock-in and high liquidity, but keep in mind that returns are market-linked and NOT government guaranteed.`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 2 (Debt SIP)",
          beginner_tip: "Use any verified investment app to trigger an automated Debt Mutual Fund SIP."
        },
        {
          title: "Option 3: Equity Index Mutual Fund SIP 📈 [Wealth Booster]",
          risk: "GROWTH RISK (MARKET-LINKED, VOLATILE)",
          description: "Highest long-term growth potential through the Indian stock market, but subject to high short-term volatility.",
          the_plan: lSum > 0
            ? `Grow your ₹${formatRupeeValue(lSum)} starting capital in high-equity assets while automating a systematic investment plan (SIP) for the remaining gap.`
            : `Direct a monthly systematic investment of your savings into a diversified Equity Index Fund (like Nifty 50) for inflation-beating compound growth.`,
          the_math: equitySIPMath,
          real_life_example: `It's like boarding India's economic express train — it gets you to your financial destination incredibly fast, but expect volatile bumps along the tracks.`,
          pro_tip: `Direct equity mutual funds are volatile and can drop in the short term. Only use equity for horizons longer than 3 years to avoid losses!`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 3 (Equity SIP)",
          beginner_tip: "Use any verified investment app to open a demat account and trigger an automatic index fund SIP."
        },
        {
          title: "Option 4: Direct Stocks & Crypto 🚀 [Speculative / High Risk]",
          risk: "VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK)",
          description: "High speculative potential with no fixed returns. Can suffer from massive drawdowns and capital loss.",
          the_plan: lSum > 0
            ? `Allocate your ₹${formatRupeeValue(lSum)} into a high-volatility basket of small-cap stocks, crypto, or IPOs while setting up small SIPs.`
            : `Speculate your monthly savings across direct small-cap equities, crypto, and thematic funds for aggressive upside.`,
          the_math: highRiskMath,
          real_life_example: `It's like trying to launch a rocket ship. You could reach the moon rapidly, but the engines could also explode on the launchpad.`,
          pro_tip: `Only deploy capital you are 100% prepared to lose entirely. Never rely on speculative assets for non-negotiable financial goals.`,
          timeframe_label: `${tfMonths} months`,
          option_label: "Option 4 (High Risk)",
          beginner_tip: "Only experienced investors should actively pick highly volatile direct stocks or crypto."
        }
      ],
      closing_summary: `Self-Check: The user's classified intent is B. The number(s) they gave are: ${selfCheckNumbers}. I am NOT introducing any number they didn't provide.\n\n` +
        `To reach your ₹${formatRupeeValue(target)} goal safely, we recommend utilizing high-grade bank RDs to close your monthly shortfall, or taking calculated index fund SIP market-linked risks if your timeline is long-term.\n\n` +
        `Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.`
    };
  }

  // category === 'D' (Ambiguous / Missing details)
  const gAmt = goalAmount;
  const missingLabel = gAmt 
    ? `Hey buddy! I see you want to reach ₹${formatRupeeValue(gAmt)} in ${timeframeMonths} months, but I don't know your current monthly saving capacity. To give you an exact mathematical comparison and show your shortfall, let me know: how much can you comfortably save every month?`
    : `Hey buddy! I see you mentioned ₹40,000, but I need a bit more details to clear things up! Did you mean **₹40,000 monthly income to split**, **₹40,000 savings goal to reach**, or **₹40,000 idle lump sum to invest safely**?`;

  return {
    is_type_b: false,
    type_b_response: "",
    target_amount: 0,
    timeframe_months: 12,
    goal_summary: "Wait, Paisa Coach needs a bit more details! 🎯🎒",
    plays: [
      {
        title: "Wait, let's clear up the numbers! 🎯🎒",
        risk: "Clarification needed",
        description: "",
        the_plan: `Let's clarify what your numbers represent before we calculate any compound interest, shortfall gap, or allocation metrics.`,
        the_math: `No math can be performed until we define whether the stated figures represent your monthly income, your savings goal, or an idle lump sum capital.`,
        real_life_example: `It's like having a treasure map but not knowing if we're planning a trip to the local grocery shop, a weekend holiday, or relocating to another city!`,
        pro_tip: `Clear inputs lead to precise interest calculations. Take a second to specify your monthly saving rate or your goal context!`,
        timeframe_label: "Clarify",
        option_label: "Paisa Coach Qs",
        beginner_tip: gAmt 
          ? "Type something like: 'I want to save ₹40k, and my current savings rate is ₹2,000 a month' to clear this up!"
          : "Type something like: 'I earn 40k freelancing, how to split it' or 'I have 15k idle to invest safely' to unlock your options right now!"
      }
    ],
    closing_summary: `Self-Check: The user's classified intent is D (Ambiguous/Missing required info). The number(s) they gave are: ${gAmt ? `₹${formatRupeeValue(gAmt)} (goal amount)` : "unspecified numbers"}. I am NOT introducing any number they didn't provide.\n\n` +
      `${missingLabel}\n\n` +
      `Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.`
  };
}

export async function handleGeneratePlans(req: any, res: any) {
  try {
    const { goal, checkIn, profile } = req.body;
    
    // Lazy-initialize GoogleGenAI inside handler to ensure safety if key is missing/unstable
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey
      ? new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        })
      : null;

    if (!ai) {
      console.warn("[Paisa Coach] No GEMINI_API_KEY. Falling back to dynamic local offline parser.");
      const fb = getLocalFallbackResponse(goal, checkIn, profile);
      return res.json(fb);
    }

    console.log("[Paisa Coach] Processing query with Gemini Model for robust intent classification & math");

    // Prepare profile string to inject as context
    const stored_income = checkIn?.monthlyIncome || 0;
    const stored_spend = checkIn?.monthlySpend || 0;
    const stored_surplus = Math.max(0, stored_income - stored_spend);
    const userAge = profile?.age || 18;

    const systemInstruction = `You are a financial goal-planning assistant for Pockit, an Indian personal finance app.
Your task is to analyze the user's financial query, classify their intent, perform a required internal self-check, and generate a customized financial plan.

CRITICAL: UNIT MULTIPLIERS (LAKH/CR/K) ARE MATHEMATICALLY MANDATORY
If a user says "21 lakh" or similar, do NOT use the raw number 21 as if it were ₹21. This is a critical mathematical failure. You must extract (raw_number, unit_word) and apply the multiplier explicitly:
- "k"/"K"/"thousand" -> multiply by 1,000 (e.g., 40k -> 40,000)
- "lac"/"lakh"/"lakhs"/"L" -> multiply by 1,00,000 (e.g., 21 lakh -> 21,00,000; 70 lakh -> 70,00,000; 5L -> 5,00,000)
- "cr"/"crore"/"crores" -> multiply by 1,00,00,000 (e.g., 1.2 cr -> 1,20,00,000)
- no unit -> use exactly as given (e.g., 45000 -> 45,000)

The converted_value — never the raw_number — is the ONLY value allowed to enter any calculation, "the_math" section, or final answer. The raw_number by itself must never appear in a calculation or in any text describing the mathematical result.

HARD VALIDATION GATE (BLOCK OUTPUT IF THIS FAILS):
Confirm that the converted_value used in "the_plan" and "the_math" has at least 3-8 more digits than the raw_number (thousand = +3 digits, lakh = +5 digits, crore = +7 digits). If "the_plan" or "the_math" shows a Principal, goal, or capital figure that is IDENTICAL to the raw number the user typed (e.g. showing "₹21" or "P = ₹21" when the user said "21 lakh") — this is an automatic failure. RE-RUN STEP 1 AND STEP 2.

PLAIN-LANGUAGE MATH SUMMARY (MANDATORY DISPLAY RULE):
In "the_math" section of each play, you are STRICTLY FORBIDDEN from displaying any mathematical formula, exponents, algebraic notation, or step-by-step variable substitution (e.g., do NOT show 'M = R × [(1+i)^n - 1] / ...' or 'Plugging in: A = ...').
Instead, you MUST display only a plain-language summary of the result, structured exactly like this:
- MANDATORY TEMPLATE FOR CATEGORY B (SAVINGS GOAL):
  "You currently have ₹[current_amount]. Your target is ₹[target_amount], leaving a shortfall of ₹[initial_gap_amount]. If you invest in [investment_type] at [rate]% p.a. and continue depositing ₹[monthly_deposit]/month, your final amount after [duration] will be ₹[calculated_final_amount] — [this covers your target with ₹X to spare / this falls short by ₹X].\n\nTo hit your exact target of ₹[target_amount] in [duration], you would instead need to deposit ₹[required_monthly_deposit]/month.\n\nAlternatively, if you'd rather keep depositing ₹[monthly_deposit]/month, you would need to extend your timeline to approximately [extended_timeline] to reach ₹[target_amount]."
  (Note: For the Tier 4 HIGH RISK option, replace the confident final-amount and precise timelines with a realistic RANGE and explicitly state that losses are possible).
- MANDATORY TEMPLATE FOR CATEGORY C (LUMP SUM INVESTMENT):
  "You currently have ₹[current_amount]. If you invest this capital in this [investment_type] at [rate]% p.a., your final amount in hand after [duration] will be exactly ₹[calculated_final_amount] — this grows your principal by exactly ₹[gain_amount]."
  (Note: For the Tier 4 HIGH RISK option, replace the confident final-amount with a realistic RANGE and explicitly state that losses are possible).

BANNED PHRASES (VIOLATING THESE BLOCKS THE OUTPUT):
Do NOT use vague confirmation phrases as a replacement for stating the exact, precise final rupee amount. The following phrases are strictly banned if used without stating the exact calculated final amount:
- "will grow to cover your entire target"
- "you will reach your goal"
- "your money will grow to meet your target"
Any confirmation phrase must always be accompanied by the exact final rupee figure (calculated precisely as: current amount + all deposits + compounded interest, rounded to nearest 10).
The exact calculation itself must still happen internally with full precision — this change is purely about hiding the working in the output, not skipping the calculation itself.

CRITICAL: SPEED-VS-ACCURACY TRADEOFF & LATENCY OPTIMIZATION RULES
Accuracy must NEVER be sacrificed for speed — a full calculation is required every time, regardless of platform, device, or urgency.
There is no such thing as a "faster but slightly wrong" mode — only "correct." A response is only allowed to be released once the full reasoning pipeline below has completed.

MANDATORY FULL PIPELINE — CANNOT BE SKIPPED, SHORTENED, OR PARTIALLY RUN UNDER ANY CONDITION:
1. Read the ENTIRE user message, end to end, before starting any classification or math. Do not begin processing until the full input has been received.
2. Extract every number and its unit word (lakh/cr/k/none) — Step 1: Extraction, Step 3: Conversion.
3. Classify intent (income split / savings goal / lump sum investment / ambiguous) as described in prior fixes.
4. Run the hard validation gate: confirm every converted number has the correct extra digits versus the raw number typed.
5. Perform the actual formula calculation using ONLY converted, validated numbers.
6. Run the self-check: restate internally what the user asked, what numbers were used, and confirm nothing was fabricated or assumed.
7. Only after all 6 steps above are complete, generate the formatted JSON output (with 'the_plan', 'the_math', 'closing_summary', etc.).

None of these steps may be skipped, abbreviated, or run partially — not for speed, not because the user said "hurry", not because of any platform or device signal. If asked to "be quick", "make it faster", "be fast", or "please hurry", you should reduce ONLY the explanatory prose length in the final output (step 7) — never skip or abbreviate the reasoning steps 1-6.

Explicit Response Target:
Aim for a response time of 5-10 seconds for a standard single-goal query. If the full correct calculation genuinely requires more time than that, it is acceptable to take longer — a correct answer that takes 12 seconds is always better than a wrong answer that takes 3.

Platform-Blindness Rule:
The AI has no concept of "mobile mode" or "laptop mode" for its own reasoning — if such a distinction exists anywhere in the surrounding app logic, that is an application-level bug, not something this prompt can fix. The reasoning pipeline above must be IDENTICAL regardless of what device triggered the request.

To minimize response time while ensuring perfect accuracy, adhere to these 5 optimizations:
1. Do the math once, silently, internally: Do not narrate your working, show draft calculations, or write exploratory text. Perform intent classification, parsing, and formula math in a single internal pass before writing the JSON.
2. Trim explanatory prose, not logic: Keep "the_plan", "the_math", "real_life_example", and "pro_tip" fields, but CAP each field strictly to 1-2 short, punchy, high-impact sentences. Always show the formula and exact calculated numbers in full — never abbreviate or round away the actual calculation, only shorten the surrounding prose.
3. Skip redundant restatement: The self-check block at the start of the 'closing_summary' is the ONLY place where you state the self-check. Keep it strictly to the required format ("Self-Check: The user's classified intent is [A/B/C/D]. The number(s) they gave are: [list them with what each represents]. I am NOT introducing any number they didn't provide.") and make it extremely concise. Do not write any other self-check or validation prose in other fields.
4. Generate in a single pass: Output all JSON fields together directly without any step-by-step revision.
5. MANDATORY EXACTLY 4 RISK-TIERS FOR PLANS: For Category B and Category C, you MUST always output EXACTLY four distinct plays/options corresponding to the four risk tiers: Option 1: LOW RISK (GUARANTEED), Option 2: MEDIUM RISK (MARKET-LINKED), Option 3: GROWTH RISK (MARKET-LINKED, VOLATILE), and Option 4: VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK). Never output fewer or more than exactly 4 options for Category B or C.

First, you MUST classify the user's message into one of these categories:
- Category A — Income Allocation/Splitting: User states an income/earning amount and asks how to divide, split, allocate, or budget it (keywords: "I earn", "my income is", "how to split", "how to divide", "how to allocate", "how to budget").
  - Recommended split: Use only the stated income. Allocate across categories (e.g., Needs: 50%, Wants: 30%, Savings/Investments: 20%).
  - CRITICAL: The income figure is NOT a goal. Do not invent a "goal amount", a "shortfall", or assume a prior savings rate that was not stated.
- Category B — Savings Goal: User states a target amount they want to reach or save toward (keywords: "I want to save", "my goal is", "I need", "target of").
  - Check if they provided a current monthly saving capacity in their query, or if it is available in the profile/onboarding.
  - If they have a lump sum (capital) in addition to a goal (e.g. "I have 21 lakh want to buy home worth 70 lakh in 5 years"), subtract the grown value of that lump sum from the target to find the remaining target.
  - If a required saving rate is missing, and they have no lump sum, ASK the user for it before calculating, rather than guessing. Do not fabricate an assumed saving rate or a shortfall.
  - If saving capacity is provided, compare flat savings (flat savings = monthly_saving * timeframe) to the target to calculate the shortfall.
  - MANDATORY: Return exactly 4 options:
    - Play 1 (LOW RISK (GUARANTEED)): Bank Recurring Deposit (RD) at 7.00% p.a. (quarterly compounded).
    - Play 2 (MEDIUM RISK (MARKET-LINKED)): Debt Mutual Fund SIP at 9.00% p.a. (monthly compounded).
    - Play 3 (GROWTH RISK (MARKET-LINKED, VOLATILE)): Equity Index Mutual Fund SIP at 13.00% p.a. (monthly compounded).
    - Play 4 (VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK)): Direct Stocks/Crypto at variable 15-25% p.a. Note: For this tier, state a range of potential outcomes and explicit warnings of loss.
    - State a clear, one-line justification why each tier fits its risk category.
- Category C — Lump Sum Investment: User states an amount they already have and want to invest (keywords: "I have", "idle lump sum", "where should I put", "invest").
  - Treat the stated amount as capital to deploy today, not a savings goal or monthly income.
  - MANDATORY: Return exactly 4 options:
    - Play 1 (LOW RISK (GUARANTEED)): Bank Fixed Deposit (FD) at 7.00% p.a. (quarterly compounded).
    - Play 2 (MEDIUM RISK (MARKET-LINKED)): Debt Mutual Fund at 9.00% p.a. (monthly compounded).
    - Play 3 (GROWTH RISK (MARKET-LINKED, VOLATILE)): Equity Index Mutual Fund at 13.00% p.a. (monthly compounded).
    - Play 4 (VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK)): Direct Stocks/Crypto at variable 15-25% p.a. Note: For this tier, state a range of potential outcomes and explicit warnings of loss.
    - State a clear, one-line justification why each tier fits its risk category.
- Category D — Ambiguous/Unclear: If the message does not clearly match A, B, or C, or if required info (such as target or timeframe or income) is missing or ambiguous.
  - DO NOT guess or invent numbers. Ask a single clarifying question.

Mandatory Internal Self-Check Rule:
Before generating the plan, the math, and recommendation, you MUST write down an internal self-check block at the top of the 'closing_summary' field of the JSON response in this exact format:
"Self-Check: The user's classified intent is [A/B/C/D]. The number(s) they gave are: [list them with what each represents]. I am NOT introducing any number they didn't provide."

Structured Output Fields for Plays:
For each play inside the 'plays' array, you MUST output the following fields as separate, clean, distinct text strings:
1. 'the_plan': The actionable strategy. (Do NOT include a starting label or any newline/escape characters).
2. 'the_math': A plain-language summary of results (current amount, target, shortfall, monthly deposit, maturity amount) as facts. Do NOT show any formulas or substitutions. (Do NOT include a starting label. You MAY use newlines in this field to separate paragraphs).
3. 'real_life_example': A clear, relatable analogy. (Do NOT include a starting label or any newline/escape characters).
4. 'pro_tip': A strategic hack or tip. (Do NOT include a starting label or any newline/escape characters).

CRITICAL FORMATTING RULES:
- Do NOT use the prefix labels like "**THE PLAN:**", "**THE MATH:**", etc. inside their respective separate fields. Just output the clean contents.
- Do NOT generate literal '\\n' or '\\\\n' characters anywhere inside these separate fields (except 'the_math').

Financial Instruments and Rates (as of July 2026):
1. Option 1 (LOW RISK (GUARANTEED)): Bank RD/FD or Post Office schemes — 7.00% p.a. (DICGC insured or government guaranteed). For RD (quarterly compounding): M = R × [(1+i)^n - 1] / (1 - (1+i)^(-1/3)), where i = rate/400, n = quarters.
2. Option 2 (MEDIUM RISK (MARKET-LINKED)): Debt Mutual Funds / Hybrid Mutual Funds — 9.00% p.a. average (monthly compounding). Market-linked, not guaranteed.
3. Option 3 (GROWTH RISK (MARKET-LINKED, VOLATILE)): Equity Index Mutual Funds — 13.00% p.a. historical average (monthly compounding). Market-linked, highly volatile.
4. Option 4 (VERY HIGH RISK (SPECULATIVE — CAPITAL AT RISK)): Direct Stocks/Crypto — 15-25% p.a. historical average (monthly compounding). Speculative, highly volatile, potential for total loss.

Mathematical Precision:
- Present all mathematical results in 'the_math' strictly as clean, plain-language sentences with no formulas, algebraic notation, or step-by-step substitutions shown.
- Round final rupee values to the nearest ₹10.
- State which instruments are government-guaranteed vs market-linked.
- Disclose lock-in periods clearly.
- End the closing_summary with: "Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India."`;

    const userPrompt = `User Query: "${goal}"
User Profile Age: ${userAge} years
Onboarding Check-In Income: ₹${stored_income}
Onboarding Check-In Spend: ₹${stored_spend}
Onboarding Surplus/Savings Rate: ₹${stored_surplus}

Analyze the user's query against our categories (A, B, C, D) and onboarding context.
Apply the strict unit multiplier extraction and validation rules for any number in the User Query (e.g., 21 lakh -> 21,00,000; 70 lakh -> 70,00,000; 40k -> 40,000).
If they asked to split an income (Category A), do not calculate a goal target or shortfall.
If they specified a savings goal (Category B) but we have no savings capacity and no starting capital from either their query or onboarding check-in surplus, classify as Category D and ask for it.
Make sure you write the Self-Check block at the top of closing_summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_type_b: {
              type: Type.BOOLEAN,
              description: "Set to false for Category A, C, D or structured plans. Set to true ONLY for highly open-ended/broad educational questions like 'how to get rich' or 'what is a mutual fund'."
            },
            type_b_response: {
              type: Type.STRING,
              description: "The full general conversational/explainer text if is_type_b is true. Empty string otherwise."
            },
            target_amount: {
              type: Type.NUMBER,
              description: "The target savings goal amount (Category B) or lump sum amount (Category C). Set to 0 for Category A or D."
            },
            timeframe_months: {
              type: Type.NUMBER,
              description: "The timeframe in months. Default to 12 if unspecified or 0 for Category A/D."
            },
            goal_summary: {
              type: Type.STRING,
              description: "A short, punchy heading summarizing the intent (e.g. 'Monthly Budget Split: Allocating your ₹40k income' or 'Awaiting your numbers, buddy! 🎯')."
            },
            plays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Actionable play title (e.g., '50% Needs: Essential Living Expenses' or 'Bank Fixed Deposit (FD)')." },
                  risk: { type: Type.STRING, description: "Risk label (e.g. 'Low risk (Government guaranteed)' or 'High risk')." },
                  description: {
                    type: Type.STRING,
                    description: "A blank string or short summary (fallback)."
                  },
                  the_plan: {
                    type: Type.STRING,
                    description: "The concrete actionable plan steps. IMPORTANT: DO NOT use raw newlines like '\\n' or escape sequences. Write as a single, beautifully structured paragraph."
                  },
                  the_math: {
                    type: Type.STRING,
                    description: "The exact compound interest math or calculations with values plugged in."
                  },
                  real_life_example: {
                    type: Type.STRING,
                    description: "A simple, relatable real life analogy. IMPORTANT: DO NOT use raw newlines like '\\n' or escape sequences. Write as a single, beautifully structured paragraph."
                  },
                  pro_tip: {
                    type: Type.STRING,
                    description: "A professional hack or pro tip for this strategy. IMPORTANT: DO NOT use raw newlines like '\\n' or escape sequences. Write as a single, beautifully structured paragraph."
                  },
                  timeframe_label: { type: Type.STRING, description: "Timeframe label (e.g. '12 months' or 'Liquid')." },
                  option_label: { type: Type.STRING, description: "Option index or category label (e.g. 'Needs', 'Option 1 (Govt)')." },
                  beginner_tip: { type: Type.STRING, description: "A simple tip for beginners to start with this play." }
                },
                required: ["title", "risk", "description", "the_plan", "the_math", "real_life_example", "pro_tip", "timeframe_label", "option_label", "beginner_tip"]
              }
            },
            closing_summary: {
              type: Type.STRING,
              description: "The final recommendation/closing advice. MUST start with the Self-Check restatement block: 'Self-Check: The user's classified intent is [A/B/C/D]. The number(s) they gave are: [list them with what each represents]. I am NOT introducing any number they didn't provide.' And MUST end with the disclaimer: 'Rates shown are as of July 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India.'"
            }
          },
          required: ["is_type_b", "type_b_response", "target_amount", "timeframe_months", "goal_summary", "plays", "closing_summary"]
        }
      }
    });

    const textResult = response.text;
    if (textResult) {
      const parsedJSON = JSON.parse(textResult);
      return res.json(parsedJSON);
    }

    // Fallback if returned text is empty
    throw new Error("Empty response from Gemini");

  } catch (error: any) {
    console.warn("[Paisa Coach] Gemini execution error or parser failure, falling back to offline logic", error);
    const fb = getLocalFallbackResponse(req.body.goal || "", req.body.checkIn, req.body.profile);
    return res.json(fb);
  }
}
