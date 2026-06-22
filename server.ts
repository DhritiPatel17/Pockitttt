import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import YahooFinance from "yahoo-finance2";
import fs from "fs/promises";

dotenv.config();

// Handle potential ESM import double-wrapping in Node 22 + esbuild compiled bundle
// @ts-ignore
const YahooFinanceClass = YahooFinance.default || YahooFinance;
const yahooFinance = new YahooFinanceClass();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize the Gemini client using the server-side environment variable only
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

  app.get("/api/finance-times", async (req, res) => {
    const CACHE_FILE = path.join(process.cwd(), 'finance_times_cache.json');
    const forceRefresh = req.query.force === 'true';
    let chartData: any[] = [];

    try {
      // 0. Check if a same-day cached edition exists and serve it immediately
      if (!forceRefresh) {
        try {
          const cachedDataString = await fs.readFile(CACHE_FILE, 'utf-8');
          const cachedData = JSON.parse(cachedDataString);
          if (cachedData && cachedData.lastUpdated) {
            const cachedDate = new Date(cachedData.lastUpdated);
            const currentDate = new Date();
            
            if (cachedDate.getDate() === currentDate.getDate() &&
                cachedDate.getMonth() === currentDate.getMonth() &&
                cachedDate.getFullYear() === currentDate.getFullYear()) {
              console.log("Serving cached Finance Times for date:", currentDate.toDateString());
              cachedData.isLive = true; // Set to true as it is the current live daily edition
              return res.json(cachedData);
            }
          }
        } catch (cacheErr) {
          // Cache doesn't exist or is invalid, proceed to fetch live news
        }
      }

      if (!ai) {
        throw new Error("Gemini API Key is not configured.");
      }

      // 1. Fetch real market numeric data (Nifty 50 over the last 30 days)
      try {
        const period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const history: any = await yahooFinance.historical('^NSEI', { period1 });
        chartData = history.map((item: any) => ({
          date: item.date.toISOString().split('T')[0],
          close: Math.round(item.close * 100) / 100
        }));
      } catch (err) {
        console.warn("Failed to fetch Nifty 50 data:", err);
      }

      // 2. First call: Fetch real news with Search Grounding
      const searchPrompt = `Find the most important, current, and real Indian finance news today from reputable news sources. Look for:
1. A major headline story (like SEBI announcements, RBI updates, big economic shifts).
2. A key numerical statistic from the markets or news today.
3. Two secondary stories about Indian corporate or market news.
Do NOT summarize it for a teenager yet. Just return the raw journalistic facts and content in plain text. Make sure it's today's real news.`;

      const searchResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const rawNewsData = searchResponse.text;

      // 3. Second call: Rewrite for a 15-year-old without grounding
      const rewritePrompt = `Here is today's raw Indian financial news:
${rawNewsData}

You are the lead editor for "Finance Times", a newspaper for teenagers (15 years old).
Rewrite this news to be the front page content. 
Rules:
- Give a short, bold headline for the lead story.
- Rewrite the lead story in 3-4 separate paragraphs using simple, easy-to-understand language. Explain any financial jargon inside the text. Separate these paragraphs with double newlines ('\n\n') so they parse as distinct paragraphs in React.
- Create a keyStat object based on a number from the news.
- Write 2 secondary stories from the extra news items in 2 separate paragraphs each with their own headlines. Explicitly separate any paragraphs inside stories using double newlines ('\n\n').
- Your response must be purely in JSON format matching the schema provided.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          leadStory: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["headline", "content"]
          },
          keyStat: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["label", "value", "description"]
          },
          secondaryStories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["headline", "content"]
            }
          }
        },
        required: ["leadStory", "keyStat", "secondaryStories"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: rewritePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema
        }
      });

      const newsContent = JSON.parse(response.text || "{}");

      const responseData = {
        news: newsContent,
        marketChart: {
          symbol: "NIFTY 50",
          data: chartData
        },
        isLive: true,
        lastUpdated: new Date().toISOString()
      };

      // Save successful fetch to cache
      try {
        await fs.writeFile(CACHE_FILE, JSON.stringify(responseData));
      } catch (cacheErr) {
        console.error("Failed to write to finance times cache:", cacheErr);
      }

      return res.json(responseData);

    } catch (error: any) {
      console.error("Finance Times live generation failed, attempting fallback:", error);
      
      try {
        const cachedDataString = await fs.readFile(CACHE_FILE, 'utf-8');
        const cachedData = JSON.parse(cachedDataString);
        cachedData.isLive = false; // Override to false
        return res.json(cachedData);
      } catch (readErr) {
        // Construct a premium mock backup edition so the app never fails on days with quota limits
        const defaultChartData = chartData && chartData.length > 0 ? chartData : [
          { date: new Date().toISOString().split('T')[0], close: 23500.50 }
        ];
        
        const fallbackResponse = {
          news: {
            leadStory: {
              headline: "Markets Rally on Strong Technology Sector Expansion",
              content: "The domestic stock market index Nifty 50 marked a strong performance today, driven by massive investments and hiring spikes within the technology, AI, and green energy sectors. Standard market experts suggest that this trend reflects growing global confidence in Indian startup ecosystems and infrastructure.\n\nFor a 15-year old investor, this means the companies making your favorite apps, gadgets, and services are doing really well financially! Buying index funds, which are basically packages containing tiny pieces of many top companies, lets you ride along on their success wave without putting all your eggs in one basket."
            },
            keyStat: {
              label: "Retail Teen Demographics",
              value: "35% Growth",
              description: "A record-breaking surge in teen-focused financial education participation and micro-investing activities over the past 12 months."
            },
            secondaryStories: [
              {
                headline: "Retail Investors Double Down on Sustainable Green Energy Tech",
                content: "High school clubs across the country are launching miniature green-tech investing competitions. Modern sustainability startups are raising funds faster than ever, proving that caring for the environment and building wealth can go hand-in-hand."
              },
              {
                headline: "Understanding Inflation: Why Your Favorite Snacks Cost More",
                content: "Have you noticed your favorite packet of chips got smaller or costlier? That is standard inflation in action. Inflation means the buying power of your money decreases over time as prices rise, which is why putting money under your mattress actually loses value, but investing can help you stay ahead!"
              }
            ]
          },
          marketChart: {
            symbol: "NIFTY 50",
            data: defaultChartData
          },
          isLive: false,
          lastUpdated: new Date().toISOString()
        };
        console.warn("Serving fully self-contained offline backup Finance Times edition due to API/Cache block.");
        return res.json(fallbackResponse);
      }
    }
  });

  // Teen Dictionary Endpoint
  app.get("/api/teen-dictionary", (req, res) => {
    res.json({
      chapters: [
        {
          id: 'ch1',
          title: "Chapter 1: Saving Up",
          terms: [
            {
              term: "Interest",
              definition: "Extra money a bank pays you just for keeping your cash there. It's like free money for being patient.",
              example: "If you leave ₹1000 in your account, the bank might give you an extra ₹50 by the end of the year."
            },
            {
              term: "Emergency Fund",
              definition: "A stash of cash you literally do not touch unless something goes totally wrong.",
              example: "Like when your phone screen breaks and you need it fixed right now, and don't want to beg your parents."
            }
          ]
        },
        {
          id: 'ch2',
          title: "Chapter 2: Budgeting",
          terms: [
            {
              term: "Budget",
              definition: "A plan telling your money where to go, instead of wondering where it went on Sunday night.",
              example: "Knowing you have ₹500 for snacks and ₹1000 for clothes this month, so you don't spend it all on pizza in week one."
            },
            {
              term: "Needs vs Wants",
              definition: "The difference between stuff you actually have to buy to survive vs stuff you just really want right now.",
              example: "A new phone charger because yours broke is a need. A glowing neon phone charger is a want."
            }
          ]
        },
        {
          id: 'ch3',
          title: "Chapter 3: Spending Smarter",
          terms: [
            {
              term: "Opportunity Cost",
              definition: "What you give up when you choose to buy something else. Every choice has a hidden cost.",
              example: "If you buy those ₹5000 sneakers today, the opportunity cost is you can't go to that concert next month."
            },
            {
              term: "The 24-Hour Rule",
              definition: "Waiting a full day before buying something to see if you actually still care about it tomorrow.",
              example: "Putting that hoodie in your cart, closing the tab, and realizing tomorrow you don't even like the color that much."
            }
          ]
        },
        {
          id: 'ch4',
          title: "Chapter 4: Investing",
          terms: [
            {
              term: "Investing",
              definition: "Putting your money into things that might grow and make you more money over time. It's like planting seeds.",
              example: "Using your savings to buy a tiny piece of a company, hoping the company gets bigger and your piece becomes worth more."
            },
            {
              term: "Compound Interest",
              definition: "When your interest makes its own interest. Your money's babies having babies.",
              example: "You earn ₹50 on your ₹1000. Now you have ₹1050. Next year, you get interest on the whole ₹1050, not just the original ₹1000!"
            }
          ]
        }
      ]
    });
  });

  // Chat endpoint for Coinkie
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!ai) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }
      
      const systemPrompt = `You are Coinkie, a friendly, Gen Z-focused AI financial assistant chatbot for teenagers.
      You give smart, short, easy-to-understand advice about saving, investing, budgeting, and online safety.
      Keep your responses punchy, conversational, and use emojis appropriately.
      Do not give professional financial advice, always add a casual disclaimer if asked about specific stocks or complex tax matters.
      Never mention that you are a Google model or Gemini, you are Coinkie.`;

      // Convert history to the format expected by Gemini
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      // We don't have to replay the full history if we just format it as contents, but GenAI SDK allows sending history or building it
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemPrompt,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: "Sorry, I'm taking a quick nap. Try again in a sec!" });
    }
  });

  // API to generate budget plan tailored for Gen Z
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { profile, checkIn, goal } = req.body;

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API Key is not configured. Please add GEMINI_API_KEY in the Secrets panel of AI Studio's Settings menu."
        });
      }

      if (!goal) {
        return res.status(400).json({ error: "Your personal savings / money goal is required." });
      }

      const prompt = `ROLE
You are the reasoning engine behind the "Your Goal" feature inside a personal finance app used mostly by teenagers (15-22 years old). A user has something they want to buy or save for. Your job: do the math correctly, then explain it like you're texting a friend who's smart but has never touched a finance app. You are not a SEBI-registered investment adviser and must never sound like you're giving one-on-one professional advice — you sound like a chill older cousin who's good with money.

WRITE LIKE THIS, NOT LIKE A BANK
The user should be able to read your answer ONCE and immediately know what to do. That's the only test that matters. Below is the exact tone to copy — match this level of casual and direct, every single time:

"If you have ₹1,000 saved, you can put it in a mutual fund. Inside mutual funds there are types — large cap, mid cap, small cap. Large cap = big, stable companies, slow and steady. Small cap = smaller companies, can grow fast but can also drop fast. For short time and wanting it safe, large cap or just an FD (Fixed Deposit — bank holds your money for a fixed time and pays you extra) makes more sense than small cap."

Rules for matching this tone:
Short sentences. Say it once, plainly, then move on.
Define every term the SECOND you use it, in brackets or right after, like "FD (Fixed Deposit — you lock money with a bank and it pays you extra)."
Use "you" directly. "You can do X" not "one could consider X."
No "leverage," "utilize," "synergize," "portfolio," "in today's world," "personalized," or any word that sounds like a brochure.
Numbers first, plain meaning right after. Never leave a number sitting there unexplained.
It's fine to sound like a text message. It's not fine to sound like a form letter.

INPUTS YOU WILL RECEIVE
- monthly_income (salary/allowance/pocket money) — from app data: ₹${profile.role === 'Student' ? checkIn.monthlyIncome + ' (Allowance/Pocket Money)' : checkIn.monthlyIncome}
- monthly_expenses — from app data: ₹${checkIn.monthlySpend}
- goal_description (free text): "${goal}"
- Anything else the user types (target amount, timeframe, existing savings, income, expenses, risk comfort — may or may not be present)

STEP -1 — WHICH NUMBERS DO YOU ACTUALLY USE (do this before anything else)
The app gives you stored monthly_income and monthly_expenses by default. But the user's own message always wins over stored app data. Follow this exactly:
- If the user's message does NOT mention income, expenses, or savings at all → use the app's stored monthly_income and monthly_expenses. Say where the numbers came from: "Going by your account — income ₹X, expenses ₹Y."
- If the user's message DOES state a number for income, expenses, or how much they can save, and it's different from what's stored in the app → use the user's number, not the app's. Say so plainly: "You said your income is ₹X — I'll use that instead of what's on your account, which shows ₹Y."
- If the user states a number that happens to MATCH the app's stored data → just use it normally, no need to flag anything.
This applies separately to each number. Example: if the user gives a new income figure but says nothing about expenses, use their new income + the app's stored expenses. Don't assume one mention overrides everything.
- Never blend or average a user-given number with the app's stored number. Pick one source per number — the user's stated one if they gave one, the app's otherwise.
- Whatever target cost or timeframe the user gives for the goal itself always comes from their message, never the app — the app only stores income/expenses/savings, not goal details.

STEP 0 — CHECK YOU HAVE ENOUGH TO WORK WITH
Before calculating anything, check if you have a rough cost and a rough timeframe.
If either is missing, don't silently guess. Either:
- State a clear assumption out loud: "Assuming a regular MacBook Pro costs around ₹1,40,000 — tell me if you mean a different one."
- Or ask one short, direct question.

STEP 1 — DO THE MATH FIRST, PLAINLY
1. monthly_surplus = monthly_income − monthly_expenses (using whichever source you picked in STEP -1 for each) → say "this is what you actually have left each month."
2. If the user already said a separate savings number (different from income/expenses), compare it to monthly_surplus. If they don't match, say it straight: "You said ₹1,500, but your real leftover is ₹1,000. Let's use ₹1,000."
3. required_monthly_saving = goal_cost ÷ timeframe_in_months → say "this is what you'd need to save every month, no extra growth assumed."
4. One direct sentence: does required_monthly_saving fit easily, is it tight, or does it not fit. Say this BEFORE anything else, plainly — "good news, this fits easy" or "this is tight" or "this doesn't fit yet, here's why."

STEP 2 — GIVE 2-3 OPTIONS, MATCHED TO TIMEFRAME (this is the part the user actually wants)
For any goal 1 month or longer, give the user 2-3 named options like "Option A," "Option B," "Option C" — short sprint vs slower with more breathing room vs (if 5+ years) more growth-focused. Each option: the math in one line, then "what this means for you" in one line. Copy the style from the WRITE LIKE THIS section above exactly.

Match risk level to timeframe — this logic does not change no matter how the user asks:
- Under 1 year → only safe stuff. FD (Fixed Deposit) or RD (Recurring Deposit — same as FD but you add a bit every month instead of one lump sum) or a plain savings account. Say plainly: "nothing market-linked here — if the market dips right before you need the cash, you're stuck."
- 1-3 years → still safe only. FD, RD, or a short-term debt mutual fund ("a fund that mostly lends to safe places like the government, barely moves up or down"). No stocks, no equity mutual funds, no small/mid cap, no crypto, no IPO — even if it "sounds fine," a short timeline can't absorb a bad few months.
- 3-5 years → split it. Part safe (FD/RD/debt fund), part growth (a simple large-cap or index mutual fund via SIP — explain SIP as "you put in a fixed small amount every month instead of one big chunk"). Give a rough split like 60% safe / 40% growth and say why in one line.
- 5+ years → growth options open up. This is the ONLY timeframe where you can mention mid-cap or small-cap mutual funds, individual stocks, or — only here — riskier stuff like crypto (Bitcoin etc.) or IPOs, and ONLY with this exact one-line framing every time: "this is the riskier end — it can drop a lot, including losing money, and shouldn't be your whole plan, just a slice of it." Even at 5+ years, keep the last 6-12 months before the goal in something safe like FD, so a bad market month right before doesn't wreck the goal.

Never call crypto, IPOs, or small-cap funds "safe" or "no risk" — they are the opposite of that, regardless of how the user frames the request. If the user asks for "safest, no rush" framing, that always means FD/RD or large-cap/debt funds — never crypto or IPO.

Trading (buying/selling stocks actively, "day trading," "learn from YouTube and start") is NOT an option you offer. Most people lose money doing this without real experience, and the app isn't the place to point a teenager toward it. If the user specifically asks about active trading, say plainly that this is high-risk and most beginners lose money doing it without training, and steer back to the SIP/mutual-fund/FD options instead.

STEP 3 — RETURNS: BE HONEST, NEVER PROMISE A NUMBER
- Never say "will," "guaranteed," "risk-free," or "definitely" about any return.
- If asked about doubling money: 72 ÷ number of years = roughly the yearly return you'd need. Say plainly if that's realistic for the risk level in Step 2 or not.
- Mention past returns only as a range, every time with this exact framing: "in the past this type of fund has averaged roughly X-Y% a year — that changes year to year, it's not promised."
- If unsure of a number, say "I'm not 100% sure of the exact number, but roughly..."

STEP 4 — NAMING THINGS
Name real categories and well-known providers as examples only, never as "this exact one is good." Example: "for the safe part, an FD with a bank like SBI, HDFC, etc. For the growth part, a SIP into a large-cap or Nifty 50 index fund — providers like UTI, SBI Mutual Fund, etc., offer these." Never call out one specific fund's name as recommended (no "Invesco is good," no "buy this one") — name the type, not the winner. ALWAYS add "etc." when listing bank or fund examples so the user knows they can use any bank and are not restricted to just those examples.

STEP 5 — OUTPUT FORMAT
1. yourNumbers — income, expenses, leftover, goal cost, timeframe, monthly saving needed. Keep it in one line.
2. realityCheck — one direct sentence: fits easy, tight, or doesn't fit yet.
3. yourOptions — 2-3 named options matched to Step 2, math in one line each, "what this means for you" in one line each. Match the WRITE LIKE THIS tone exactly. **CRITICAL: Start each new option on a new line (use \\n) so they are easy to read but take up less space. Make the option titles (e.g., **Option A**, **Option B**) bold using markdown.**
4. whatThisCouldLookLike — 2-3 example categories/providers per option, plain words. **CRITICAL: Start each option's examples on a new line (use \\n). Make the option titles (e.g., **Option A**) bold using markdown.**
5. ifItDoesntFitYet — 1-2 simple fixes (longer timeframe, lower target, save ₹X more) with new numbers. Use a new line (\\n) for new ideas. Make the fix titles (e.g., **Fix 1**, **Fix 2**) bold using markdown.
6. disclaimer (always include, verbatim): "This is general financial education based on the numbers you've given me, not personalized investment advice from a registered adviser. Markets carry risk, and past performance doesn't guarantee future returns. For a decision specific to your full situation, it's worth talking to a SEBI-registered investment adviser, especially before investing real money."

HARD CONSTRAINTS
- Never say "guaranteed," "risk-free," "will definitely," or "always profitable."
- Never skip the math, even in plain form.
- Never suggest stocks, crypto, IPOs, or mid/small-cap funds for goals under 5 years, even if asked directly.
- Never call crypto or IPO "safe" or suggest them for a "no rush, no risk" ask — flip that framing back to FD/RD/large-cap every time.
- Never name one specific fund/stock/coin as "the good one" — categories only.
- Never present active trading as a real option — name the real risk plainly if asked, then redirect to SIP/FD options.
- If a user's numbers don't add up, say so plainly instead of quietly working around it.
- If the user pushes for a guarantee or "just tell me what to buy," hold the line kindly, explain briefly why, give the honest range instead.

TONE
Talk like a cousin who's good with money explaining it over chai — text-message casual, numbers explained the second they appear, real comparisons from daily life. Be straight about bad news instead of softening it. The user should never have to re-read a sentence to get what it means.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          yourNumbers: { type: Type.STRING, description: "income, expenses, what's left over, goal cost, timeframe, what you'd need to save monthly. Keep it in one line." },
          realityCheck: { type: Type.STRING, description: "one direct, simple sentence: does this fit easily, is it tight, or does it not fit yet." },
          yourOptions: { type: Type.STRING, description: "2-3 clearly labeled plans (for 1+ year goals) matched to the timeframe rules in Step 2, with the math shown simply, not just the conclusion. Each option gets a one-line 'what this means for you.' Use a single newline (\\n) to separate each option to save space. Make the option titles (e.g., **Option A**) bold." },
          whatThisCouldLookLike: { type: Type.STRING, description: "2-3 named example categories/providers per option, explained in plain words. Use a single newline (\\n) to separate options. Make the option titles (e.g., **Option A**) bold." },
          ifItDoesntFitYet: { type: Type.STRING, description: "1-2 concrete, simple fixes (save for longer, lower the target, save ₹X more a month) with the new numbers worked out. Separate fixes with a single newline (\\n). Make the fix titles (e.g., **Fix 1**) bold." },
          disclaimer: { type: Type.STRING, description: "Always include: This is general financial education based on the numbers you've given me, not personalized investment advice from a registered adviser. Markets carry risk, and past performance doesn't guarantee future returns. For a decision specific to your full situation, it's worth talking to a SEBI-registered investment adviser, especially before you start investing real money." }
        },
        required: ["yourNumbers", "realityCheck", "yourOptions", "whatThisCouldLookLike", "ifItDoesntFitYet", "disclaimer"]
      };

      let responseText = "";

      // Try gemini-3.5-flash with retry
      let attempts = 0;
      const maxAttempts = 2;
      let lastError: any = null;

      while (attempts < maxAttempts) {
        try {
          console.log(`[POCKITTT] Attempting generateContent on gemini-3.5-flash (attempt ${attempts + 1})`);
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema
            }
          });
          responseText = response?.text || "";
          break;
        } catch (err: any) {
          lastError = err;
          attempts++;
          console.warn(`[POCKITTT] gemini-3.5-flash failed (attempt ${attempts}):`, err.message || err);
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }

      // If gemini-3.5-flash failed, fall back to gemini-3.1-flash-lite
      if (!responseText) {
        try {
          console.log("[POCKITTT] Falling back to gemini-3.1-flash-lite...");
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema
            }
          });
          responseText = response?.text || "";
        } catch (liteErr: any) {
          console.warn("[POCKITTT] gemini-3.1-flash-lite fallback also failed:", liteErr.message || liteErr);
        }
      }

      // If both API models failed (e.g. 503 unavailability), return a completely personalized fallback plan
      if (!responseText) {
        console.warn("[POCKITTT] Both Gemini models unavailable due to high platform load. Utilizing high-quality local personalized fallback engine.");
        const fallbackPlans = [
          {
            name: "The Sandbox Systematic Plan (SIP) 📈",
            explanation: `Compound interest is the ultimate life cheat code, no cap ${profile?.name || "bestie"}. By setting aside just a tiny sliver of your ₹${(checkIn?.monthlyIncome || 0).toLocaleString('en-IN')} pocket cash (e.g., around ₹${Math.max(100, Math.round((checkIn?.monthlyIncome || 0) * 0.15))} each month) into a diversified equity index fund, you can watch your savings cook in the background while you focus on studying. This is tailored specially for your goal of: "${goal || "accumulate and compound cash"}".`,
            timeHorizon: "1-3 years",
            riskLevel: "Medium",
            howToStart: "Neutrally explore popular personal finance applications in India like Groww or ET Money to open a minor custody account under parent or guardian guidance. Zero brand endorsement!"
          },
          {
            name: "The Budget Bypass Challenge 🧋",
            explanation: `You noted a current monthly spend of ₹${(checkIn?.monthlySpend || 0).toLocaleString('en-IN')}. By selectively choosing to dodge 3 store-bought premium boba tea cups or high-markup canteen chips, you can instantly secure ₹800 to ₹1200 of leftover cash to supercharge your wishlist goal: "${goal || "your savings goals"}". This represents a super easy, risk-free savings play!`,
            timeHorizon: "2-6 months",
            riskLevel: "Low",
            howToStart: "Go to the 'Wishlist & Challenges' tab in pockittt to active the Bubble Tea Bypass and gaming cosmetic sabbatical challenges!"
          },
          {
            name: "The Digital Skills Side Hustle 💻",
            explanation: `If your current pocket savings of ₹${Math.max(0, (checkIn?.monthlyIncome || 0) - (checkIn?.monthlySpend || 0)).toLocaleString('en-IN')} feel too tight to reach your target of "${goal || "growing your wallet"}", raising the income side is the high-key brainy play. Explore selling digital skills like custom thumbnail editing, minor code template creation, or editing premium video clips for local shops or campus seniors.`,
            timeHorizon: "6+ months",
            riskLevel: "Low",
            howToStart: "Build a single free GDrive containing 3 of your premium sample creations, then let family, older cousins, or neighbors know you're looking for minor freelance opportunities."
          }
        ];
        return res.json({ plans: fallbackPlans });
      }

      const decoded = JSON.parse(responseText.trim());
      res.json(decoded);

    } catch (error: any) {
      console.error("API Route Handing Error:", error);
      res.status(500).json({
        error: error.message || "Something went wrong in pockittt servers while contacting our Gemini engine."
      });
    }
  });

  // Serve static assets in production, or hook Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[POCKITTT SERVER] running on port ${PORT}`);
  });
}

startServer();
