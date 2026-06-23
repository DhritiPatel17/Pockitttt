import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import YahooFinance from "yahoo-finance2";
import fs from "fs/promises";
import { handleGeneratePlans } from "./server/routes/generatePlans";

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
        const period2 = new Date();
        const result: any = await yahooFinance.chart('^NSEI', { period1, period2 });
        const quotes = result.quotes || [];
        chartData = quotes
          .filter((item: any) => item && item.date && item.close !== null && item.close !== undefined)
          .map((item: any) => ({
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : new Date(item.date).toISOString().split('T')[0],
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

function generateLocalCoinkieReply(messageText: string): string {
  const query = messageText.toLowerCase().trim();

  // 1. GREETINGS
  if (query.match(/\b(hi|hello|hey|yo|sup|namaste|greetings)\b/i) || query.includes("who are you") || query.includes("what is your name") || query.includes("coinkie")) {
    return `Hey there! Coinkie in the house! 🪙✨ I'm your Gen Z-focused virtual financial sidekick. 

I can help you understand how to:
- 🐖 Save up for that brand new gadget or dream sneaker.
- ⚡ Use UPI and online banking securely without getting scammed.
- 📈 Get started with investing in mutual funds & stocks (even if you're under 18!).
- 📊 Put together a solid budget that doesn't ruin your social life.

What financial question is on your mind today? Let's crack it!`;
  }

  // 2. STOCKS & MUTUAL FUNDS / INVESTING
  if (query.includes("invest") || query.includes("stock") || query.includes("share") || query.includes("mutual fund") || query.includes("sip") || query.includes("groww") || query.includes("zerodha") || query.includes("equity")) {
    return `Ooh, starting to invest early is a literal cheat code! Because of **compound interest**, starting at 15 instead of 25 can make a massive difference. 📈

Here is the real talk on investing for teens in India:
- **Under 18:** You can't open an independent investing account. But your parents/guardians can open a **Minor Demat & Trading account** for you on apps like Groww or Zerodha. They'll need to co-sign and complete KYC checks.
- **Mutual Fund SIPs (Systematic Investment Plans):** This is where you invest a fixed amount (like ₹500/month) into a diversified pool of stocks. For beginners, a low-cost **Nifty 50 Index Fund** is super smart because it tracks India's top 50 companies.
- **Risk Disclaimer:** Unlike bank savings, stock market investments are market-linked and NOT guaranteed. They fluctuate daily, but historically, equity mutual funds in India have averaged around **10-12% annual returns** over 5+ years!

*Rule of thumb: Only invest money you don't need for the next 3 to 5 years!* 💸`;
  }

  // 3. UPI / APPS / DIGITAL WALLET / SCAMS
  if (query.includes("upi") || query.includes("gpay") || query.includes("paytm") || query.includes("phonepe") || query.includes("wallet") || query.includes("scam") || query.includes("fraud") || query.includes("safe") || query.includes("otp") || query.includes("phishing") || query.includes("card")) {
    return `UPI is the GOAT of digital payments, but scammers play dirty! ⚡🔒 Let's make sure you're bulletproof:

1. **UPI PIN is ONLY for paying out:** You never, EVER need to enter your UPI PIN to *receive* money. If someone sends a link and says "Enter PIN to receive reward", it is a 100% scam.
2. **The Name Check:** Always look at the verified name on your screen before hitting 'Send'. 
3. **No OTP Sharing:** No bank, customer support, or helpline will ever ask for your OTP. Keep it strictly to yourself.
4. **Teen Apps:** If you're under 18 and want UPI, check out teen-focused smart banking cards and apps like FamPay, OmniCard, or Akudo. They let you pay digitally with parental supervision!`;
  }

  // 4. RD / PPF / SAVINGS INTRUMENTS
  if (query.includes("ppf") || query.includes("rd") || query.includes("fd") || query.includes("recurring") || query.includes("fixed deposit") || query.includes("post office") || query.includes("gold") || query.includes("nsc")) {
    return `If you want 100% safe, guaranteed, zero-risk options backed by the Government of India, these are your best friends! 🛡️

- **Post Office Recurring Deposit (RD):** Perfect for saving monthly. You put in a fixed amount (e.g., ₹1,000/month) for 5 years. It compounds quarterly with high interest.
- **Bank RD/FD:** Major banks (like SBI/HDFC) let you set up RDs for flexible timelines (anywhere from 6 months to 10 years). Great for short-term goals.
- **PPF (Public Provident Fund):** The gold standard of long-term tax-free savings. It pays ~7.1% interest (revised quarterly) but has a **15-year lock-in period**. Incredible for super long-term wealth building.
- **Sukanya Samriddhi Yojana (SSY):** If you are a girl or have a girl child, this offers some of the highest risk-free rates (~8.2%), locked in until age 21.

*Since these are risk-free, they don't fluctuate with the stock market. Always keep your emergency funds here!*`;
  }

  // 5. BUDGETING & POCKET MONEY / SPENDING
  if (query.includes("budget") || query.includes("spend") || query.includes("pocket money") || query.includes("allowance") || query.includes("saving") || query.includes("save") || query.includes("fampay") || query.includes("expens")) {
    return `Managing pocket money is all about being the CEO of your own wallet! 🍕💸 Here's the **Coinkie 50-30-20 Rules** to budget like a pro:

- **50% for Needs:** This is essential stuff you literally cannot skip (e.g. transport, school notes, basic food).
- **30% for Wants:** Fun things! Streaming subscriptions, cafe visits with friends, gaming skins, fancy bubble tea.
- **20% for Savings:** This goes straight into your savings account, a Piggy Vault, or an RD *immediately* when you get your allowance. Move it before you can spend it!

**Coinkie's Secret Weapon: The 24-Hour Rule!** ⏳ 
Before buying any non-urgent "want" (like that cool hoodie online), close the tab and wait 24 hours. If you still want it tomorrow, buy it. Most times, you'll forget about it and save your cash!`;
  }

  // 6. INFLATION
  if (query.includes("inflation") || query.includes("shrinkflation") || query.includes("price") || query.includes("cost")) {
    return `Ah, **Inflation** — structural enemy #1 of your savings piggy bank! 💸👾

Inflation is when the cost of living goes up over time, meaning ₹100 buys less stuff tomorrow than it did today.
*Example:* Think about your favorite bubble tea or burger. A few years ago it was cheaper, or the portion size was bigger (that's called **shrinkflation**, where companies keep the price same but give you fewer chips/biscuit pieces!).

If you keep cash under your mattress, or in a basic savings account paying only 2% to 3% interest, and inflation is running at 5% to 6%, **your money is actually losing purchasing power**. This is why investing in assets that beat inflation (like Mutual Funds, Equity, or recurring deposits) is absolutely critical for growing wealth!`;
  }

  // 7. MINOR / UNDER 18 / GUARDIAN ACCOUNT
  if (query.includes("minor") || query.includes("under 18") || query.includes("parents") || query.includes("guardian") || query.includes("kid") || query.includes("child") || query.includes("teen")) {
    return `Being a teen investor in India is totally doable, but you'll need teamwork! 🧑‍🎓🤝

Since you are under 18:
1. **Bank Accounts:** You can open a **Minor Savings Account** (like SBI Pehli Udaan, or HDFC Kid's Account) which gives you your own debit card and net-banking with daily spending limits.
2. **Investment Accounts:** Your parents/guardians must sign as primary account holders. They will provide their PAN card and set up a joint Demat/Mutual fund account where you can watch the money compound together.
3. **Teen Neo-banking:** Apps like FamPay, OmniCard, or FYP offer simple domestic teen cards and UPI IDs with parents acting as the wallet controllers.`;
  }

  // 8. DEFAULT TEEN WEALTH ADVICE fallback
  return `Ooh, that's a super interesting question! 🧠💡 

As Coinkie, my general rule of thumb for teen financial success is:
1. **Earn & Save first:** Make saving ₹100 out of every ₹500 a strict, non-negotiable habit.
2. **Avoid high-risk traps:** Say absolute **NO** to online speculative "get-rich-quick" Telegram channels, crypto double-your-money schemes, or fancy futures & options trading. They are designed to wipe out beginners.
3. **Compound early:** Even ₹500/month compounding at 10% in a secure mutual fund or 7% in an RD for a few years sets you years ahead of your classmates!

*(💡 Tip: Keep searching, exploring, or ask me something specific like "safe UPI", "how to invest in SIP", or "50-30-20 budget plan"!)*`;
}

  // Chat endpoint for Coinkie
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!ai) {
        console.warn("No GEMINI_API_KEY. Falling back to dynamic local Coinkie chatbot!");
        const fallbackText = generateLocalCoinkieReply(message);
        return res.json({ reply: fallbackText });
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
      console.log(`[Coinkie Chat] Calling Gemini API (via @google/genai SDK): POST https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.5-flash:generateContent`);
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
      console.error("Chat API Error, using dynamic local fallback:", error);
      const fallbackText = generateLocalCoinkieReply(req.body.message || "");
      res.json({ reply: fallbackText });
    }
  });

  // API to generate budget plan tailored for Gen Z
  app.post("/api/generate-plan", handleGeneratePlans);
  app.post("/api/generate-plans", handleGeneratePlans);

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
