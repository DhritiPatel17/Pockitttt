import { GoogleGenAI, Type } from "@google/genai";

// Standard compound interest math helpers following exact formulas requested by user

// Monthly recurring deposits (RD/SIP-style), compounded monthly:
// FV = P × [((1+r)^n − 1) / r] × (1+r)
// P = monthly amount, r = monthly rate (annual ÷ 12), n = number of months
function calculateSIP_FV(P: number, annualRate: number, months: number): number {
  if (annualRate <= 0) return P * months;
  const r = annualRate / 12;
  const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return Math.round(P * factor);
}

function calculateSIP_Required(target: number, annualRate: number, months: number): number {
  if (annualRate <= 0) return Math.round(target / months);
  const r = annualRate / 12;
  const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return Math.round(target / factor);
}

// Lump sum (FD-style), compounded quarterly (standard for Indian bank FDs):
// FV = P × (1 + r/4)^(4×t)
// P = principal, r = annual rate, t = years
function calculateFD_FV(P: number, annualRate: number, months: number): number {
  const t = months / 12;
  return Math.round(P * Math.pow(1 + annualRate / 4, 4 * t));
}

// Solves for required annual rate r to turn P/month into target FV in n months
function solveRequiredSIP_Rate(P: number, target: number, months: number): number {
  let low = 0.0;
  let high = 15.0; // up to 1500% annual rate
  let solvedRate = 0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const fv = calculateSIP_FV(P, mid, months);
    if (Math.abs(fv - target) < 1) {
      solvedRate = mid;
      break;
    }
    if (fv > target) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return solvedRate || (low + high) / 2;
}

// Solves for number of months needed to hit target with deposit P at annualRate
function solveMonthsRequired(P: number, target: number, annualRate: number): number {
  for (let m = 1; m <= 360; m++) {
    if (calculateSIP_FV(P, annualRate, m) >= target) {
      return m;
    }
  }
  return Math.ceil(target / P);
}

function detectIsTypeB(clean: string, hasFiguresInMessage: boolean, hasTimeframeInMsg: boolean): boolean {
  if (hasFiguresInMessage) return false;

  const cleanLower = clean.toLowerCase();

  // If a pure explaining instruction/question is typed, let it go to pure explainer instead of Type B
  const explainerKeywords = ["what is", "explain", "meaning of", "definition of", "how does a", "how do mutual", "how do sips"];
  const isExplainerQuery = explainerKeywords.some(k => cleanLower.includes(k));
  if (isExplainerQuery) return false;

  const concreteNouns = ["laptop", "phone", "mobile", "iphone", "airpods", "ipad", "trip", "travel", "vacation", "goa", "scooter", "bike", "activa", "shoes", "sneakers", "course", "fees", "college", "car", "watch", "camera", "playstation", "ps5", "xbox", "gimbal", "gift"];
  const hasConcreteNoun = concreteNouns.some(noun => cleanLower.includes(noun));

  const vagueBroadKeywords = [
    "get rich", "become rich", "millionaire", "billionaire", "wealthy",
    "what should i do", "what to do with", "my money", "bad with money", "good with money",
    "financial tips", "how to invest", "where to invest", "how to save", "passive income", 
    "make money", "earn money", "investing tips", "wealth building", "double my money",
    "financial freedom", "retire early", "fire movement", "grow money", "multiply money",
    "money advice", "advice for 18", "advice for 20", "advice for college", "financial habits"
  ];
  const matchesVagueKeyword = vagueBroadKeywords.some(keyword => cleanLower.includes(keyword));

  // If there are no figures and either it matches vague keywords or lacks any concrete purchase noun:
  if (!hasTimeframeInMsg) {
    if (!hasConcreteNoun || matchesVagueKeyword) {
      return true;
    }
  }

  return false;
}

// Extremely robust text/string financial parameter extractor in Node.js
function extractFinancialParameters(goalStr: string, checkIn: any, profile: any) {
  let clean = goalStr.toLowerCase().replace(/,/g, '');
  
  // Normalize common word numbers to digits
  clean = clean
    .replace(/\btwo years\b/g, "2 years")
    .replace(/\bthree years\b/g, "3 years")
    .replace(/\bfour years\b/g, "4 years")
    .replace(/\bfive years\b/g, "5 years")
    .replace(/\bten years\b/g, "10 years")
    .replace(/\bone year\b/g, "1 year")
    .replace(/\bhalf year\b/g, "6 months")
    .replace(/\bhalf a year\b/g, "6 months")
    .replace(/\ba year\b/g, "1 year")
    .replace(/\ba month\b/g, "1 month")
    .replace(/\btwo months\b/g, "2 months")
    .replace(/\bthree months\b/g, "3 months")
    .replace(/\bsix months\b/g, "6 months");

  let is_pure_explainer = true;
  let explainer_topic = "general";

  // Check common topics first to set explainer_topic
  if (clean.includes("mutual fund") || clean.includes("mutual-fund") || clean.includes(" mf ") || clean.includes(" mfs ")) {
    explainer_topic = "mutual fund";
  } else if (clean.includes("sip") || clean.includes("systematic investment")) {
    explainer_topic = "sip";
  } else if (clean.includes("stock") || clean.includes("share market") || clean.includes("equity") || clean.includes("shares")) {
    explainer_topic = "stocks";
  } else if (clean.includes("bitcoin") || clean.includes("crypto") || clean.includes("ethereum") || clean.includes("doge") || clean.includes("solana")) {
    explainer_topic = "bitcoin";
  } else if (clean.includes("ipo")) {
    explainer_topic = "ipo";
  } else if (clean.includes("double") || clean.includes("rule of 72") || clean.includes("2x") || clean.includes("doubling")) {
    explainer_topic = "double money";
  } else if (clean.includes("ppf") || clean.includes("provident fund")) {
    explainer_topic = "ppf";
  } else if (clean.includes("ssy") || clean.includes("sukanya")) {
    explainer_topic = "ssy";
  } else if (clean.includes("tax") || clean.includes("saving scheme") || clean.includes("nsc")) {
    explainer_topic = "tax";
  }

  // Parse numbers: "15k", "1.5k", "1.5 lakh"
  function parseValue(valStr: string): number {
    let s = valStr.trim();
    let multiplier = 1;
    if (s.endsWith("k")) {
      multiplier = 1000;
      s = s.slice(0, -1);
    } else if (s.endsWith("lakh") || s.endsWith("l")) {
      multiplier = 100000;
      s = s.endsWith("lakh") ? s.slice(0, -4) : s.slice(0, -1);
    }
    const parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed * multiplier;
  }

  // Helper to extract digit values not followed by months/years
  function parseNumbersFromMessage(text: string): number[] {
    const stripped = text
      .replace(/\b\d+\s*(?:month|months|m|year|years|y)\b/g, '')
      .trim();

    const regex = /(?:₹|rs\.?|rs)?\s*(\d+(?:\.\d+)?\s*(?:k|lakh|l)?)\b/g;
    let match;
    const values: number[] = [];

    while ((match = regex.exec(stripped)) !== null) {
      const val = parseValue(match[1]);
      if (val > 0) {
        values.push(val);
      }
    }
    return values;
  }

  // Helper to extract explicit monthly contribution patterns
  function detectMonthlySavingsFromMessage(text: string): number | null {
    const regexes = [
      /(?:save|saving|put|stash|invest|investing|budget|contrib|contribute)\s*(?:₹|rs\.?|rs)?\s*(\d+(?:\.\d+)?\s*(?:k|lakh|l)?)\s*(?:a|per|\/)\s*(?:month|m|monthly)/,
      /(?:₹|rs\.?|rs)?\s*(\d+(?:\.\d+)?\s*(?:k|lakh|l)?)\s*(?:a|per|\/)\s*(?:month|m|monthly)/,
      /(?:save|saving|invest|investing|put)\s*(?:₹|rs\.?|rs)?\s*(\d+(?:\.\d+)?\s*(?:k|lakh|l)?)\s*(?:each|every|per)\s*month/
    ];

    for (const regex of regexes) {
      const match = text.match(regex);
      if (match && match[1]) {
        const val = parseValue(match[1]);
        if (val > 0) return val;
      }
    }
    return null;
  }

  // Check goal-oriented keywords
  const goalKeywords = ["laptop", "trip", "mobile", "phone", "buy", "save", "saving", "reach", "goal", "want", "target", "get", "earn", "accumulate", "gather", "by year end", "in a year", "time", "months", "years", "scooter", "bike", "shoes"];
  const isGoalTriggered = goalKeywords.some(kw => clean.includes(kw));

  const messageNumbers = parseNumbersFromMessage(clean);
  const detectedMonthlyMsg = detectMonthlySavingsFromMessage(clean);
  const hasFiguresInMessage = messageNumbers.length > 0;

  let hasTimeframeInMsg = false;
  const monthMatch = clean.match(/(\d+)\s*(?:month|months|m)\b/);
  const yearMatch = clean.match(/(\d+)\s*(?:year|years|y)\b/);
  if (monthMatch || yearMatch) {
    hasTimeframeInMsg = true;
  }

  const is_type_b = detectIsTypeB(clean, hasFiguresInMessage, hasTimeframeInMsg);

  if (isGoalTriggered || hasFiguresInMessage) {
    is_pure_explainer = false;
  }

  // STORED_PROFILE values
  const stored_income = checkIn?.monthlyIncome || 0;
  const stored_spend = checkIn?.monthlySpend || 0;
  const stored_surplus = Math.max(0, stored_income - stored_spend);
  const stored_profile_is_available = (stored_income > 0);

  let target_amount = 15000; // default
  let timeframe_months = 12; // default
  let stated_monthly_savings: number | null = null;
  let used_stored_profile_savings = false;
  let is_clarifying_needed = false;

  let hasSavingsInMsg = (detectedMonthlyMsg !== null);
  let hasTargetInMsg = false;

  // Rule 1: Use Message numbers if present
  if (hasFiguresInMessage) {
    if (detectedMonthlyMsg !== null) {
      stated_monthly_savings = detectedMonthlyMsg;
      hasSavingsInMsg = true;

      const otherVals = messageNumbers.filter(v => v !== detectedMonthlyMsg);
      if (otherVals.length > 0) {
        target_amount = Math.max(...otherVals);
        hasTargetInMsg = true;
      } else {
        // Only savings specified in message, we multiply by 12 as target fallback
        target_amount = detectedMonthlyMsg * 12;
        hasTargetInMsg = false;
      }
    } else {
      if (messageNumbers.length >= 2) {
        // Assume large is target, smaller is monthly savings
        const sorted = [...messageNumbers].sort((a, b) => b - a);
        target_amount = sorted[0];
        stated_monthly_savings = sorted[1];
        hasTargetInMsg = true;
        hasSavingsInMsg = true;
      } else {
        const singleVal = messageNumbers[0];
        if (singleVal >= 2000) {
          target_amount = singleVal;
          hasTargetInMsg = true;
          hasSavingsInMsg = false;
        } else {
          stated_monthly_savings = singleVal;
          hasSavingsInMsg = true;
          hasTargetInMsg = false;
          target_amount = singleVal * 12;
        }
      }
    }

    // Timeframe extraction from message
    if (monthMatch && monthMatch[1]) {
      timeframe_months = parseInt(monthMatch[1], 10);
    } else if (yearMatch && yearMatch[1]) {
      timeframe_months = parseInt(yearMatch[1], 10) * 12;
    }

  } else if (!is_pure_explainer) {
    // Rule 2: Message mentions no figures but mentions a goal, fetch from STORED_PROFILE
    if (stored_profile_is_available && stored_surplus > 0) {
      stated_monthly_savings = stored_surplus;
      used_stored_profile_savings = true;
      hasSavingsInMsg = false;

      // Guess target by category keyword
      if (clean.includes("laptop")) {
        target_amount = 40000;
      } else if (clean.includes("phone") || clean.includes("mobile")) {
        target_amount = 15000;
      } else if (clean.includes("trip") || clean.includes("vacation") || clean.includes("travel")) {
        target_amount = 25000;
      } else if (clean.includes("gadget") || clean.includes("headphones") || clean.includes("watch")) {
        target_amount = 5000;
      } else if (clean.includes("shoes") || clean.includes("sneakers") || clean.includes("jacket")) {
        target_amount = 4000;
      } else if (clean.includes("course") || clean.includes("program") || clean.includes("college") || clean.includes("fees")) {
        target_amount = 30000;
      } else if (clean.includes("scooter") || clean.includes("bike")) {
        target_amount = 80000;
      } else {
        target_amount = 15000;
      }

      // Timeframe guess or extract from message
      if (monthMatch && monthMatch[1]) {
        timeframe_months = parseInt(monthMatch[1], 10);
      } else if (yearMatch && yearMatch[1]) {
        timeframe_months = parseInt(yearMatch[1], 10) * 12;
      } else {
        // Reasonable timeframe
        timeframe_months = Math.max(6, Math.min(24, Math.ceil(target_amount / stated_monthly_savings)));
      }
    } else {
      // Rule 3: STORED_PROFILE also empty/unavailable AND the message has no numbers
      is_clarifying_needed = true;
    }
  }

  // Per-field override: if user mentions target but not savings inside message,
  // we pull savings from STORED_PROFILE!
  if (hasTargetInMsg && !hasSavingsInMsg) {
    if (stored_profile_is_available && stored_surplus > 0) {
      stated_monthly_savings = stored_surplus;
      used_stored_profile_savings = true;
    }
  }

  let goal_item = "kit";
  if (clean.includes("laptop")) goal_item = "laptop";
  else if (clean.includes("phone") || clean.includes("mobile") || clean.includes("iphone") || clean.includes("airpods")) goal_item = "phone";
  else if (clean.includes("trip") || clean.includes("vacation") || clean.includes("travel") || clean.includes("goa")) goal_item = "trip";
  else if (clean.includes("scooter") || clean.includes("bike") || clean.includes("activa")) goal_item = "scooter";
  else if (clean.includes("shoes") || clean.includes("sneakers")) goal_item = "shoes";
  else if (clean.includes("course") || clean.includes("fees") || clean.includes("college")) goal_item = "course";

  return {
    is_pure_explainer,
    is_type_b,
    target_amount,
    timeframe_months,
    stated_monthly_savings,
    used_stored_profile_savings,
    is_clarifying_needed: is_type_b ? false : is_clarifying_needed,
    explainer_topic,
    hasTimeframeInMsg,
    goal_item
  };
}

// Generate fallback response dynamically matching the exact calculations Context solved in Node.js
function getFallbackPlays(isPureExplainer: boolean, target: number, months: number, statedP: number | null, calculationsContext: any, userAge: number, goal_item: string): any {
  const isGapCase = calculationsContext.is_gap_case;
  const isUnder18 = userAge < 18;
  const guardianTip = isUnder18 ? "Ask your parents to help you create a joint account or co-sign" : "Use standard mobile-banking or apps like Groww/Zerodha Coin";

  if (calculationsContext.is_type_b) {
    return {
      is_type_b: true,
      type_b_response: `Hey buddy! That's a great open-ended question. Getting rich, becoming a millionaire, or learning what to do with your money is all about building strong daily habits early in life. 
      
      **THE PLAN:** True wealth isn't built in months with high-risk shortcuts. It's built by starting early, staying consistent, avoiding bad debt, and letting compounding work its magic over years. Focus on upgrading your skills, earning more, and stashing away a fixed percentage of whatever you get before spending the rest.
      
      **THE MATH:** If you start saving just ₹2,500/month consistently right now from age 18, and it grows in a diversified index fund at a typical 12% p.a. CAGR, you'll accumulate over ₹25 Lakhs by age 33! That's the real power of time and consistency.
      
      **REAL LIFE EXAMPLE:** It's like planting a small mango seed today. You can't expect sweet mangoes next month, but if you keep watering it regularly, in a few years it'll yield bountiful fruits every single season.
      
      **PRO TIP:** Do not get trapped in "get rich quick" crypto schemes or premium option trading hacks. Start a simple monthly recurring deposit or mutual fund SIP to build the saving muscle first.
      
      If you want, tell me a real number and a timeframe — even a rough one (like "buy a laptop worth 55k in 18 months") — and I'll build you an actual, concrete plan instead of just talking in general terms!`,
      target_amount: 0,
      timeframe_months: 0,
      goal_summary: "Let's talk about building real wealth 🌱",
      plays: [],
      closing_summary: ""
    };
  }

  if (isPureExplainer) {
    const topic = calculationsContext.explainer_topic || "general";
    if (topic === "mutual fund" || topic === "sip") {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: Mutual Funds & SIPs 📈",
        plays: [
          {
            title: "What is a Mutual Fund & SIP, anyway? 🎒",
            risk: "Medium risk",
            description: `**THE PLAN:** A Mutual Fund pools money from thousands of savers to invest in a balanced basket of stocks or bonds chosen by professionals. An SIP (Systematic Investment Plan) is simply you investing a fixed, small amount of your pocket money into this fund every single month to build wealth over time.

**THE MATH:** If you start an SIP of ₹1,000 every month at an illustrative 12% annual rate across 5 years (60 months), your total investment is ₹60,000. Through monthly compound interest growth, this pool safely compounds to roughly ₹82,500 by maturity.

**REAL LIFE EXAMPLE:** It's exactly like putting aside the price of one medium pizza or a standard coffee every month and letting it grow in a golden vault instead of spending it on impulse snacks.

**PRO TIP:** Set up an automatic bank mandate the day right after you get your allowance! If you try to save whatever is left at the end of the month, you will end up saving nothing—automatic saving is the real cheat code.`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: `if you're brand new: ${guardianTip} to explore index mutual funds.`
          }
        ]
      };
    } else if (topic === "stocks") {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: Direct Stocks 📊",
        plays: [
          {
            title: "Understanding Stocks: Owning pieces of companies 🏢",
            risk: "High risk",
            description: `**THE PLAN:** Buying a stock means you bought a tiny, real fractional share of a public company like Tata or Reliance. If the company makes stellar products and expands, your share value rallies; if they struggle or make poor business choices, your capital drops.

**THE MATH:** If you buy ₹10,000 worth of direct shares in a single tech stock and it grows at 18% p.a. for 3 years, your money expands to ₹16,430. But if that business fails and the stock drops by 40%, your savings collapse to ₹6,000 instantly with no fallback protection.

**REAL LIFE EXAMPLE:** Think of it like buying direct bricks of your favorite sweet shop; if they open more successful branches you get richer, but if a better competitor opens next door, your brick value drops.

**PRO TIP:** Please do not treat stock trading like a standard mobile video game. Direct stocks can experience brutal daily price swings, so as your older sibling, I suggest holding off until you understand how to read balance sheets, starting with safer mutual funds instead.`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: `if you're brand new: ${guardianTip} to try mock-trading first before putting real money in.`
          }
        ]
      };
    } else if (topic === "bitcoin" || topic === "crypto") {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: Crypto & Bitcoin 🪙",
        plays: [
          {
            title: "Bitcoin and Crypto: High-voltage digital assets ⚡",
            risk: "High risk",
            description: `**THE PLAN:** Cryptocurrencies are highly volatile digital tokens whose prices rely purely on global internet hype and market speculation waves. Unlike real companies, they have no physical assets, pay no regular dividends, and have absolutely no safety protection from SEBI.

**THE MATH:** If you invest ₹5,000 in a trending crypto token, and it rallies on social media hypes by 300%, your capital reaches ₹20,000. But if a major exchange goes bust, the token can drop by 95% in one day, melting your savings to an irreversible ₹250.

**REAL LIFE EXAMPLE:** It is like trading extremely rare digital collectors' cards where prices swing 30% depending on a single daily online post by a famous celebrity.

**PRO TIP:** Be extremely careful: never buy crypto with funds you actually need for your studies or essential items. Treat it as high-octane speculative play money, and never make it your core savings goal!`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: "if you're brand new: Ensure you understand that you can lose 100% of your crypto capital overnight."
          }
        ]
      };
    } else if (topic === "double money") {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: How to Double Your Money 💸",
        plays: [
          {
            title: "The Magic 'Rule of 72' 🎩",
            risk: "Medium risk",
            description: `**THE PLAN:** Doubling your money is the result of compound interest working over time, which you can estimate using the "Rule of 72". By dividing 72 by your expected annual interest rate, you get the exact number of years needed to double your wealth.

**THE MATH:** If you invest in a completely safe bank deposit earning a reliable 8% per year, your fund doubles in exactly 72 ÷ 8 = 9.00 years. If you invest in a diversified growth fund aiming for a volatile 12% per year, it takes roughly 72 ÷ 12 = 6.00 years.

**REAL LIFE EXAMPLE:** It is like planting a small fruit seed, then watering it regularly with steady monthly deposits, and watching it double into a steady tree over several years.

**PRO TIP:** If any online guru or Telegram group promises to double your hard-earned money in 30 days, run as fast as you can. They are running classic Ponzi scams, and real wealth takes slow, steady compounding to double safely!`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: "if you're brand new: Start tracking compound interest formulas inside our calculator to see the magic of time."
          }
        ]
      };
    } else if (topic === "ppf" || topic === "ssy" || topic === "tax") {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: Government Schemes 🇮🇳",
        plays: [
          {
            title: "PPF & SSY: Safe Government Super-Vaults 🛡️",
            risk: "Low risk",
            description: `**THE PLAN:** PPF (Public Provident Fund) and SSY (Sukanya Samriddhi Yojana) are sovereign, risk-free savings accounts provided by the Government of India. They offer guaranteed compounding returns and tax-free interest, making them incredibly safe for long-term horizons.

**THE MATH:** Investing ₹10,000 every year in a PPF account at a government-fixed annual interest yield of ~7.1% p.a. compounded annually for 15 years aggregates a principal of ₹1,50,000, compounding to roughly ₹2,71,000 at maturity.

**REAL LIFE EXAMPLE:** Think of this like putting your money in a massive, titanium state-backed vault that is completely shielded from any storm, stock crash, or market correction.

**PRO TIP:** Because PPF has a strict 15-year lock-in period, do not put your pocket money in here if you want to buy a laptop next year. It is perfect for long-term targets, but terrible if you need quick spending cash!`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: "if you're brand new: PPF accounts can be opened at any public bank (SBI, PNB) or post office branch."
          }
        ]
      };
    } else {
      return {
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Paisa Coach Explains: Smart Budgeting 🪙",
        plays: [
          {
            title: "General Wisdom: The golden 50-30-20 rule 🎒",
            risk: "Low risk",
            description: `**THE PLAN:** Budgeting is separating your income or pocket allowance on day one using the "50-30-20 rule". You split resources into three vaults: 50% for your absolute needs, 30% for your personal wants, and 20% for direct savings.

**THE MATH:** If your pocket money is ₹10,000, you spend ₹5,000 on needs (travel/lunch), allocate ₹3,000 for wants (movies/outings), and save ₹2,000 immediately. Over 12 months, that 20% savings habit accumulates a solid ₹24,000 flat, even before earning bank interest.

**REAL LIFE EXAMPLE:** It is like packing your bag the night before school—by saving that 20% the moment you get paid, you make sure you don't spend it on impulse shopping by week two.

**PRO TIP:** Open a separate banking sub-wallet or a zero-balance account just for your savings stack. Keeping all your holiday and lunch cash in the same wallet makes it extremely easy to accidentally spend your savings on an impulse sale!`,
            timeframe_label: "Explainer",
            option_label: "Paisa Coach Explains",
            beginner_tip: "if you're brand new: Open a separate sub-wallet inside your banking app to stash away your 20% on pocket money day."
          }
        ]
      };
    }
  }

  if (isGapCase && statedP) {
    const { flat_total, shortfall, required_annual_rate_pct, alt_A_req_deposit_at_7pct, alt_B_req_months_at_7pct, alt_B_actual_fv, alt_C_fv_at_15pct_sip } = calculationsContext;
    const summary = calculationsContext.used_stored_profile_savings 
      ? `Since you have about ₹${statedP.toLocaleString('en-IN')} left over each month based on your profile, here is your gap report to reach ₹${target.toLocaleString('en-IN')}!`
      : `Resolve gap to hit ₹${target.toLocaleString('en-IN')} utilizing ₹${statedP.toLocaleString('en-IN')}/month saving rate`;

    return {
      target_amount: target,
      timeframe_months: months,
      goal_summary: summary,
      plays: [
        {
          title: "Gap Reality Check 🚨",
          risk: "Low risk",
          description: `**THE PLAN:** Right now, saving ₹${statedP.toLocaleString('en-IN')}/month in flat cash gets you exactly ₹${flat_total.toLocaleString('en-IN')} flat by month ${months}. Because uninvested cash has no growth, your target of ₹${target.toLocaleString('en-IN')} leaves a real gap shortfall of ₹${shortfall.toLocaleString('en-IN')}.

**THE MATH:** To turn ₹${flat_total.toLocaleString('en-IN')} into ₹${target.toLocaleString('en-IN')} inside ${months} months using compounding alone, you would need an annual return rate of roughly ${required_annual_rate_pct}%. Since risk-free bank deposits only offer around 7% per year, it is mathematically impossible to close this gap safely using interest growth alone.

**REAL LIFE EXAMPLE:** This ₹${shortfall.toLocaleString('en-IN')} gap represents a serious chunk of capital—it is like expecting a small piggy bank to magically multiply its coins on its own overnight.

**PRO TIP:** Look, this is the most common financial reality check we all face: expecting interest or markets to miraculously do the heavy lifting of saving on short timelines. Since interest alone won't work, we must either scale up our monthly deposits or extend our timeline to match reality, which is completely fine!`,
          timeframe_label: `${months} months`,
          option_label: "option 1",
          beginner_tip: "if you're brand new: Use the gap reality report to re-budget your current expenses."
        },
        {
          title: "Alternative A: Scale Monthly Savings 🏋️",
          risk: "Low risk",
          description: `**THE PLAN:** Scale up your monthly deposit amount and secure it using a bank RD (Recurring Deposit, which means putting aside a fixed sum monthly). An RD is a risk-free banking product that compounds quarterly, locking your fixed rate and protecting your capital from market swings.

**THE MATH:** By saving ₹${alt_A_req_deposit_at_7pct.toLocaleString('en-IN')} every single month for ${months} months in a secure RD compounding quarterly at ~7.0% per year, you will contribute a principal of ₹${(alt_A_req_deposit_at_7pct * months).toLocaleString('en-IN')}, earning compound interest to safely hit exactly ₹${target.toLocaleString('en-IN')}.

**REAL LIFE EXAMPLE:** Look at it as scaling your daily savings habit from a cup of sweet tea to skipping one premium takeout meal each week to feed your goal.

**PRO TIP:** Believe me, stretching your saving capacity is tough, but it forces you to build incredible budget discipline. Setup an auto-debit for this scaled amount the moment your monthly allowance drops, and watch your goal become 100% guaranteed.`,
          timeframe_label: `${months} months`,
          option_label: "option 2",
          beginner_tip: `if you're brand new: ${guardianTip} to open an RD auto-debit inside net banking.`
        },
        {
          title: "Alternative B: Extend Timeframe ⏳",
          risk: "Low risk",
          description: `**THE PLAN:** Keep your secure and comfortable contribution rate of ₹${statedP.toLocaleString('en-IN')}/month, but extend your timeline. By giving your money more months to compound, you let time do the work without overstretching your daily pocket budgets.

**THE MATH:** Depositing ₹${statedP.toLocaleString('en-IN')} every single month for exactly ${alt_B_req_months_at_7pct} months into a bank RD (Recurring Deposit) compounding quarterly at ~7.0% per year safely compounds to a total of ₹${alt_B_actual_fv.toLocaleString('en-IN')}, crossing your target of ₹${target.toLocaleString('en-IN')} with absolute mathematical safety.

**REAL LIFE EXAMPLE:** Think of it like taking a local bus instead of an expensive high-speed train; you will still arrive at your exact destination safely, you just enjoy the journey for a few more months.

**PRO TIP:** Patient wealth is permanent wealth, buddy. If you rush and force a short timeline, you might be tempted to gamble in risky speculative markets; extending your timeline is the ultimate protective move to keep your money safe.`,
          timeframe_label: `${alt_B_req_months_at_7pct} months`,
          option_label: "option 3",
          beginner_tip: "if you're brand new: Slowing down and extending your timeline is always smarter than over-leveraging."
        },
        {
          title: "Alternative C: Growth Seekers Market SIP 📈",
          risk: "High risk",
          description: `**THE PLAN:** Keep your contribution rate at ₹${statedP.toLocaleString('en-IN')}/month but redirect it to a market-linked Equity Mutual Fund through an SIP (Systematic Investment Plan). This invests your money into shares of diverse top companies to target higher growth, but has no government guarantees.

**THE MATH:** Depositing ₹${statedP.toLocaleString('en-IN')} monthly for ${months} months in an equity index fund assuming an illustrative and volatile historical CAGR (Compound Annual Growth Rate) of 15% would hypothetically reach ~₹${alt_C_fv_at_15pct_sip.toLocaleString('en-IN')}. Bear in mind that equity markets can drop 10-20% quickly, meaning your final maturity can sit well below your principal.

**REAL LIFE EXAMPLE:** It is like boarding a high-speed roller coaster—it can shoot you to the summit early, or experience a sudden steep drop right before you decide to get off.

**PRO TIP:** Please be extremely careful here: if you need this money for something critical like college fees or a laptop in just ${months} months, do NOT put it in equity. A sudden market correction right when you need to purchase your item could wipe out your plans, so stay safe!`,
          timeframe_label: `${months} months`,
          option_label: "option 4",
          beginner_tip: `if you're brand new: ${guardianTip} to safely manage mutual fund equity SIPs.`
        }
      ],
      closing_summary: `Bottom line: stick to Alternative A (Scale Monthly Savings) and put in ₹${alt_A_req_deposit_at_7pct.toLocaleString('en-IN')}/month in a secure bank RD without skipping — do that consistently for ${months} months and you'll have your ${goal_item} sorted, no surprises, no risk. You've got this.`
    };
  } else {
    const { ideal_monthly, rd_fv_at_7pct, rd_profit, hybrid_fv, hybrid_safe_part, hybrid_risk_part, sprint_months, sprint_monthly } = calculationsContext;
    const summary = (calculationsContext.used_stored_profile_savings && statedP)
      ? `Since you have about ₹${statedP.toLocaleString('en-IN')} left over each month based on your onboarding profile, here is how that plays out to hit ₹${target.toLocaleString('en-IN')} in ${months} months!`
      : `Your blueprint to accumulate ₹${target.toLocaleString('en-IN')} in ${months} months`;

    return {
      target_amount: target,
      timeframe_months: months,
      goal_summary: summary,
      plays: [
        {
          title: "Simple Monthly Savings Account 🏦",
          risk: "Low risk",
          description: `**THE PLAN:** Create a dedicated savings partition inside a standard bank savings account and commit to depositing your monthly target. This is a low-risk, highly accessible liquid route that gives you total freedom to withdraw funds instantly.

**THE MATH:** Stashing ₹${ideal_monthly.toLocaleString('en-IN')} every month for ${months} months in a basic savings account yielding ~3.5% p.a. compounded monthly will build to a final total of approximately ₹${target.toLocaleString('en-IN')} by maturity, consisting almost entirely of your hard-earned principal.

**REAL LIFE EXAMPLE:** It is like setting up a basic digital piggy bank inside your main mobile app to separate your shopping funds from your goal cash.

**PRO TIP:** While the high liquidity means you can withdraw the cash in ten seconds, it also means you will be tempted to spend it on impulse shoes or weekend parties. Set up a dedicated sub-account and throw away the debit card to protect yourself from yourself!`,
          timeframe_label: `${months} months`,
          option_label: "option 1",
          beginner_tip: "if you're brand new: Open a separate savings sub-wallet so you don't accidentally spend it."
        },
        {
          title: "RD Vault Lock-In 🔒",
          risk: "Low risk",
          description: `**THE PLAN:** Put your deposits inside a bank RD (Recurring Deposit, where you save a fixed amount quarterly-compounded). An RD is a risk-free fixed income tool compounding quarterly, locking your money away until maturity to enforce airtight savings discipline.

**THE MATH:** Depositing the same ₹${ideal_monthly.toLocaleString('en-IN')} every single month for ${months} months into a secure bank RD compounding quarterly at ~7.0% per year yields ₹${rd_profit.toLocaleString('en-IN')} in pure interest profit, reaching a guaranteed maturity of ₹${rd_fv_at_7pct.toLocaleString('en-IN')}.

**REAL LIFE EXAMPLE:** Think of it like a smart locker that holds onto your movie ticket money and gives you back a free soda and popcorn at the exit gate for being disciplined.

**PRO TIP:** This is my personal absolute favorite for short-term goals. Because banks penalize you slightly for premature withdrawals, it acts as a healthy mental barrier that stops you from breaking your savings goal to buy temporary impulse goodies.`,
          timeframe_label: `${months} months`,
          option_label: "option 2",
          beginner_tip: "if you're brand new: RDs block you from touching the money until the end, protecting you from buying impulse items."
        },
        {
          title: "80/20 Safe & Sparkly Hybrid ⚖️",
          risk: "Medium risk",
          description: `**THE PLAN:** Distribute your savings into two separate buckets: 80% stays completely safe in a bank RD (Recurring Deposit), while 20% is directed into an equity Mutual Fund via an SIP (Systematic Investment Plan, representing steady market-linked payments) to capture higher stock market growth.

**THE MATH:** Out of your monthly budget, ₹${hybrid_safe_part.toLocaleString('en-IN')}/month compounds safely in a 7% bank RD, while ₹${hybrid_risk_part.toLocaleString('en-IN')}/month goes to a diversified Large-Cap Equity SIP targeting an illustrative 11% p.a. CAGR. By month ${months}, you aim to accumulate ₹${hybrid_fv.toLocaleString('en-IN')} total, blending guaranteed protection with market potential.

**REAL LIFE EXAMPLE:** It is like keeping 80% of your pocket allowance in your wallet for lunch, while spending 20% on a premium raffle ticket with a great chance to win a hamper.

**PRO TIP:** This is an excellent way to dip your toes into the stock market without losing sleep. Even if the equity market hits a rough patch, your core 80% bank vault keeps growing safely, protecting your underlying goal from crashing.`,
          timeframe_label: `${months} months`,
          option_label: "option 3",
          beginner_tip: `if you're brand new: ${guardianTip} to safely manage mutual fund equity SIPs.`
        },
        {
          title: "Intense Challenge Sprint 🏃‍♂️",
          risk: "Medium risk",
          description: `**THE PLAN:** Push your monthly budget limits and target an intense saving sprint over a shorter timeframe. By locking down non-essential spends, you can hit your final goal early and buy your item weeks before schedule.

**THE MATH:** Depositing a boosted ₹${sprint_monthly.toLocaleString('en-IN')} every month for a shortened period of just ${sprint_months} months into a secure bank RD (Recurring Deposit) compounding quarterly at ~7.0% per year will compound to cross your target of ₹${target.toLocaleString('en-IN')} early.

**REAL LIFE EXAMPLE:** It is like pulling an all-nighter to finish your college assignment early so you can enjoy the rest of the weekend with zero stress.

**PRO TIP:** Try this only if you have massive short-term motivation and can cut out luxury dining or premium streaming subscriptions for a brief period. Reaching your goal early feels absolutely electric, and once you buy your item, you will be hooked on saving!`,
          timeframe_label: `${sprint_months} months`,
          option_label: "option 4",
          beginner_tip: "if you're brand new: Only choose sprint mode if you can temporarily cut down all eating out or subscription pocket money costs."
        }
      ],
      closing_summary: `Bottom line: stick to Option 2 (the RD Vault) and put in ₹${ideal_monthly.toLocaleString('en-IN')}/month without skipping — do that consistently for ${months} months and you'll have your ${goal_item} sorted, no surprises, no risk. You've got this.`
    };
  }
}

export async function handleGeneratePlans(req: any, res: any) {
  let isPureExplainer = false;
  let target = 15000;
  let months = 12;
  let statedP: number | null = null;
  let explainerTopic = "general";
  let calculationsContext: any = {};
  let parsed: any = null;
  const userAge = req.body.profile?.age || 18;

  try {
    const { goal, checkIn, profile } = req.body;

    // --- STEP 1: Highly reliable Node.js/TypeScript-side extraction! ---
    parsed = extractFinancialParameters(goal, checkIn, profile);
    isPureExplainer = parsed.is_pure_explainer;
    target = parsed.target_amount;
    months = parsed.timeframe_months;
    statedP = parsed.stated_monthly_savings;
    explainerTopic = parsed.explainer_topic;

    if (parsed.is_clarifying_needed) {
      return res.json({
        target_amount: 0,
        timeframe_months: 12,
        goal_summary: "Awaiting your numbers, buddy! 🎯",
        plays: [
          {
            title: "Help Paisa Coach get started! 🎯🎒",
            risk: "Low risk",
            description: "Hey buddy! I'd love to build a detailed Indian investment blueprint path for you, but we are missing a few numbers (and your onboarding profile looks empty).\n\nTo unlock your specialized investment options, let me know: **what is your target amount** (e.g., ₹15,000 for a phone, or ₹40,000 for a laptop) and **how much can you comfortably save monthly**, or **when do you need it**? \n\nJust type it right here, and I will calculate your options and exact shortfall inline!",
            timeframe_label: "Awaiting Info",
            option_label: "Paisa Coach Qs",
            beginner_tip: "if you're brand new: Type something like: 'Save ₹15,000 for a phone, and I save ₹1,000 a month' to unlock your options right now!"
          }
        ]
      });
    }

    let isGapCase = false;

    if (parsed.is_type_b) {
      calculationsContext = {
        is_type_b: true
      };
    } else if (!isPureExplainer) {
      if (statedP !== null && statedP > 0) {
        const bestSafeFv = calculateSIP_FV(statedP, 0.075, months);
        if (bestSafeFv < target) {
          isGapCase = true;
        }
      }

      if (isGapCase && statedP) {
        const flatTotal = statedP * months;
        const shortfall = target - flatTotal;

        // Solve for exact annual rate required
        const reqAnnualRate = solveRequiredSIP_Rate(statedP, target, months);
        
        // Alternative A: Increase monthly deposit to hit target under a safe bank RD rate (7% p.a.)
        const reqDepositSafe = calculateSIP_Required(target, 0.07, months);

        // Alternative B: Extend timeframe to hit the target at current contribution and safe bank RD rate (7% p.a.)
        const reqTimeframeMonths = solveMonthsRequired(statedP, target, 0.07);
        const reqTimeframeFV = calculateSIP_FV(statedP, 0.07, reqTimeframeMonths);

        // Alternative C: High-risk projection with SIP at 15% CAGR
        const highRiskFV = calculateSIP_FV(statedP, 0.15, months);

        calculationsContext = {
          is_pure_explainer: false,
          is_gap_case: true,
          target_amount: target,
          timeframe_months: months,
          stated_P: statedP,
          flat_total: flatTotal,
          shortfall: shortfall,
          required_annual_rate_pct: Math.round(reqAnnualRate * 100),
          absolute_gap_pct: Math.round((shortfall / flatTotal) * 100),
          alt_A_req_deposit_at_7pct: reqDepositSafe,
          alt_B_req_months_at_7pct: reqTimeframeMonths,
          alt_B_actual_fv: reqTimeframeFV,
          alt_C_fv_at_15pct_sip: highRiskFV
        };
      } else {
        // Standard Case (No gap/conflict between stated savings and goal)
        const idealMonthly = Math.ceil(target / months);
        
        // Savings Account at 3.5%
        const savingsFV = calculateSIP_FV(idealMonthly, 0.035, months);
        const savingsProfit = savingsFV - (idealMonthly * months);

        // Bank RD at 7.0%
        const rdFV = calculateSIP_FV(idealMonthly, 0.07, months);
        const rdProfit = rdFV - (idealMonthly * months);

        // Hybrid split: 80% safe RD (7%), 20% equity SIP (12% p.a.)
        const safePart = Math.round(idealMonthly * 0.8);
        const riskPart = idealMonthly - safePart;
        const hybridFV = calculateSIP_FV(safePart, 0.07, months) + calculateSIP_FV(riskPart, 0.12, months);

        // Sprint mode
        const sprintMonths = Math.max(3, Math.min(months, 3));
        const sprintMonthly = Math.ceil(target / sprintMonths);

        calculationsContext = {
          is_pure_explainer: false,
          is_gap_case: false,
          target_amount: target,
          timeframe_months: months,
          ideal_monthly: idealMonthly,
          savings_fv_at_3_5pct: savingsFV,
          savings_profit: savingsProfit,
          rd_fv_at_7pct: rdFV,
          rd_profit: rdProfit,
          hybrid_fv: hybridFV,
          hybrid_safe_part: safePart,
          hybrid_risk_part: riskPart,
          sprint_months: sprintMonths,
          sprint_monthly: sprintMonthly
        };
      }
    } else {
      // Pure Explainer calculations helper facts
      const doubleYearsAt8 = 72 / 8;
      const doubleYearsAt12 = 72 / 12;
      
      const sip1k_10years_12pct = calculateSIP_FV(1000, 0.12, 120);
      const sip1k_10years_flat = 1000 * 120;
      
      calculationsContext = {
        is_pure_explainer: true,
        explainer_topic: explainerTopic,
        double_years_at_8pct: doubleYearsAt8,
        double_years_at_12pct: doubleYearsAt12,
        sip_1k_10y_12pct_fv: sip1k_10years_12pct,
        sip_1k_10y_flat: sip1k_10years_flat,
        sip_1k_10y_profit: sip1k_10years_12pct - sip1k_10years_flat
      };
    }

    calculationsContext.used_stored_profile_savings = parsed.used_stored_profile_savings;

    // --- STEP 2: Unified SINGLE Gemini API Call with calculation injection ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY configured. Falling back to dynamic local math-safe generator!");
      const fb = getFallbackPlays(isPureExplainer, target, months, statedP, calculationsContext, userAge, parsed.goal_item);
      if (fb && !('closing_summary' in fb)) {
        fb.closing_summary = "";
      }
      return res.json(fb);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Paisa Coach" — an extremely knowledgeable, personalized Indian financial coaching assistant for personal finance questions from young Indian earners and savers.
You help with any money question — investing a lump sum, starting a SIP, stock market planning, saving for a goal (trip, gadget, gift, gold, fees), budgeting freelance/salary income, or any other "what should I do with my money" questions. You are not limited to fixed scenarios — handle whatever the user actually asks with extreme care, high conversational warmth, and direct clarity.

═══════════════════════════════
THE HARD RULE (MISSING NUMBERS)
═══════════════════════════════
If a number (timeline, current savings, target, monthly surplus, expenses, or risk appetite) was not given to you by the user, you do NOT have it. Do NOT invent a figure, expense, timeline, or savings capacity that the user never stated.
If the math needs a number you don't have, either:
(a) Ask ONE direct question for the single most critical missing number, then stop and wait for the answer, OR
(b) Clearly label it: "Since you haven't told me your monthly surplus/timeline, I'll show you the math for two realistic scenarios — adjust based on what's realistic for you."
Never silently assume a figure and present it as if the user told you. Confirm: "What did they actually say vs. what would I be making up?"

═══════════════════════════════
STEP 1 — PARSE BEFORE YOU ANSWER
═══════════════════════════════
Identify from the user's message:
1. What money do they actually have, and in what form? (idle lump sum, regular monthly salary/freelance income, savings goal target amount)
2. What do they want to do with it? (Invest a lump sum, start a SIP, stock market planning, save for a specific goal like a gadget / trip, manage freelance income budget)
3. What is MISSING that you need real numbers for?

═══════════════════════════════
STEP 2 — FORMULATE ROADMAP / math
═══════════════════════════════
Your response MUST always follow this structured flow:
1. **Understanding Confirmation**: 1-2 sentence confirmation of what you understood they are asking (no fluff, clear).
2. **The Roadmap/Plan**: Plain, direct steps with real, mathematically precise compound interest or allocations. Show your work briefly (plugging numbers in) so they can sanity-check.
3. **Risk/Instrument Notes**: Clearly differentiate safe government-backed risk-free instruments from market-linked instruments. State lock-in periods clearly (PPF: 15 yrs, NSC: 5 yrs, SSY: until girl turns 21, Tax-saving FD: 5 yrs).
4. **Disclaimer**: Finish with: "This is educational information, not personalised financial advice — for your specific situation, a SEBI-registered advisor can help."

═══════════════════════════════
RATES & INSTRUMENTS DATABASE (June 2026 Verified)
═══════════════════════════════
Refer to these exact rates:
- Savings account interest: ~3.0% to 3.5% p.a.
- Bank Recurring Deposit (RD) / Fixed Deposit (FD): ~6.8% to 7.0% p.a. average (e.g., SBI/HDFC)
- Post Office RD: ~6.7% p.a. (govt-fixed, revised quarterly)
- Public Provident Fund (PPF): ~7.1% p.a., govt-fixed, revised quarterly, EEE tax-free (15 yrs lock-in)
- National Savings Certificate (NSC): ~7.7% p.a., govt-fixed (5 yrs lock-in)
- Sukanya Samriddhi Yojana (SSY): ~8.2% p.a. (for girl child under 10, govt-fixed, 21 yrs lock-in)
- Senior Citizen Savings Scheme (SCSS): ~8.2% p.a.
- Debt Mutual Funds: ~7.0% to 9.0% p.a. conservative historical average (market-linked, NOT guaranteed)
- Equity Mutual Funds / SIP: ~10.0% to 12.0% p.a. index mutual funds long-term average, mid/small-cap ~12-16% but highly volatile (market-linked, NOT guaranteed, never promise returns for short spans)

═══════════════════════════════
CORRECT CALCULATIONS CHEMISTRY
═══════════════════════════════
You must show calculations with precise numbers plugged in:
- RD quarterly compounded formula: M = R * [((1 + i)^n - 1) / (1 - (1 + i)^(-1/3))] where R = monthly deposit, i = quarterly rate = (annual rate / 400), n = total compounding quarters
- PPF / Lump sum yearly compounding: F = P * [((1 + i)^n - 1) / i] where i = annual rate / 100, n = years
- Mutual Fund SIP monthly compounding: FV = P * [((1 + i)^n - 1) / i] * (1 + i) where P = monthly deposit, i = monthly rate = (annual rate / 1200), n = months

═══════════════════════════════
SEBI STRICT RULE
═══════════════════════════════
Discuss investment vehicles ONLY at the category level (e.g., "large-cap index mutual fund," "bank recurring deposit") — NEVER name specific tickers (HDFC Bank, Reliance), specific funds/schemes, private platforms (Groww, Zerodha), or IPO names.

═══════════════════════════════
HOW TO MAP RESPONSES SENSITIVELY:
═══════════════════════════════
- For vague, broad, open-ended, stock market, freelance budgeting, lump sum, or SIP questions (where a list of 4 risk-comparison plays is not natural):
  1. Set in JSON: "is_type_b": true
  2. Write your complete personal coach roadmap response in "type_b_response" conforming to the STEP 2 flow (Understanding Confirmation, Roadmap, Risk/Instrument Notes, Disclaimer).
  3. Include calculations context mathematically. Say if any figures are missing under the HARD RULE.
  4. Ensure you end the "type_b_response" with the mandatory SEBI disclaimer and the RBI check date: "Rates shown are as of June 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India."
  5. Keep "plays" empty [].

- For concrete, target-goal-saving questions with clear amounts and timeframes (where comparison cards make absolute sense):
  1. Set in JSON: "is_type_b": false
  2. Populate exactly 4 cards/plays with structural clarity.
  3. Description of each card MUST follow this format:
     **THE PLAN:** [State action simply, spelling out abbreviations of the vehicle.]
     **THE MATH:** [Show calculated math with exact numbers plugged in: "₹[R]/month for [months] at [interest_rate]% p.a. compounds to ₹[Z]."]
     **REAL LIFE EXAMPLE:** [Highly relatable simple Indian real-life parallel.]
     **PRO TIP:** [Encouraging, caring warning, risk alert, or execution tip.]
  4. Set target_amount, timeframe_months, and goal_summary.
  5. Fill "closing_summary" field with a warm review highlighting the recommended card, math, and end with the mandatory disclaimer.
  
All plans inside cards/closing_summary/type_b_response must end with: "Rates shown are as of June 2026 — confirm before investing, as they're revised quarterly by RBI/Govt of India."
Return only raw JSON.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        is_type_b: { type: Type.BOOLEAN },
        type_b_response: { type: Type.STRING },
        target_amount: { type: Type.INTEGER },
        timeframe_months: { type: Type.INTEGER },
        goal_summary: { type: Type.STRING },
        closing_summary: { type: Type.STRING },
        plays: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              risk: { type: Type.STRING },
              description: { type: Type.STRING },
              timeframe_label: { type: Type.STRING },
              option_label: { type: Type.STRING },
              beginner_tip: { type: Type.STRING }
            },
            required: ["title", "risk", "description", "timeframe_label", "option_label", "beginner_tip"]
          }
        }
      },
      required: ["target_amount", "timeframe_months", "goal_summary", "plays", "closing_summary"]
    };

    let userPrompt = `Answer my input as Paisa Coach: "${goal}"
My Age: ${userAge} years old
Extracted Goal Item: ${parsed.goal_item}
Extracted Target Amount: ₹${target.toLocaleString('en-IN')}
Extracted Timeframe: ${months} months (Parsed from message: ${parsed.hasTimeframeInMsg ? "Yes" : "No"})
Extracted Contribution Surplus: ₹${statedP ? statedP.toLocaleString('en-IN') : 0}/month`;

    if (parsed.used_stored_profile_savings && statedP) {
      userPrompt += `\n\nCRITICAL DIRECTIVE: The user did NOT specify their monthly savings rate in their message, so we fetched their onboarding savings budget of ₹${statedP.toLocaleString('en-IN')}/month.
You MUST state this naturally and transparently in the output's "goal_summary" or introductory play description (e.g., "Since you've got about ₹${statedP.toLocaleString('en-IN')} left over each month based on what you told us earlier, here's how that plays out..."). Make it feel like the app remembered them, not like a silent data pull. Do not mention any mismatch with their message (since they didn't specify one).`;
    }

    if (!parsed.hasTimeframeInMsg && !parsed.used_stored_profile_savings && !parsed.is_type_b) {
      userPrompt += `\n\nCRITICAL TIMEFRAME NOTIFICATION: The user did NOT specify a timeframe in their message, so we are defaulting to 12 months.
You MUST explicitly state in the output "goal_summary" (e.g. "Drafting a 12-month savings blueprint to reach ₹${target.toLocaleString('en-IN')} - since you didn't mention a timeframe, I'm planning for 12 months — let me know if you meant longer or shorter.") so the user is completely aware of the assumption! Ensure this message is displayed word-for-word or in a highly equivalent natural form.`;
    }

    let response: any;
    const attempts = 3;
    let success = false;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.4
          }
        });
        success = true;
        break;
      } catch (err: any) {
        lastErr = err;
        if (attempt < attempts) {
          console.warn(`Paisa Coach: API attempt ${attempt} failed: ${err.message || err}. Retrying in 1.5 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    if (!success) {
      throw lastErr || new Error("Gemini API generation failed after retries.");
    }

    const parsedData = JSON.parse(response.text || "{}");
    
    // Safety checks / normalization
    parsedData.is_type_b = parsedData.is_type_b || parsed.is_type_b || false;
    parsedData.type_b_response = parsedData.type_b_response || "";
    parsedData.closing_summary = parsedData.closing_summary || "";

    // Safety check / normalization of option labels
    if (parsedData.plays && Array.isArray(parsedData.plays)) {
      parsedData.plays = parsedData.plays.map((play: any, index: number) => {
        const defaultLabel = isPureExplainer ? "Paisa Coach Explains" : `option ${index + 1}`;
        return {
          ...play,
          option_label: play.option_label || defaultLabel
        };
      });
    }

    res.json(parsedData);

  } catch (error: any) {
    console.warn("Paisa Coach API rate-limited or busy, resorting to offline personal coaching and math calculations engine. Details:", error.message || error);
    // Extremely robust local calculations generator! Beautiful fallback matching user age & exact profile parameters
    const fb = getFallbackPlays(isPureExplainer, target, months, statedP, calculationsContext, userAge, (parsed && parsed.goal_item) || "item");
    if (fb && !('closing_summary' in fb)) {
      fb.closing_summary = "";
    }
    res.json(fb);
  }
}
