export const chapterContent: Record<string, {
  title: string;
  description: string;
  topics: Array<{ title: string; explanation: string; example: string; takeaway: string }>;
}> = {
  basics: {
    title: 'Money Basics',
    description: 'Written for a complete beginner — no prior finance knowledge needed.',
    topics: [
      {
        title: 'What is Money & Why Does It Have Value',
        explanation: 'Money is just something everyone agrees to accept in exchange for things they want. It is not valuable because of the paper or metal it is made of. It is valuable because everyone trusts that they can use it to buy things later. Before money, people used barter (trading goods directly), but it was difficult to find matches. Money acts as a medium of exchange, a measure of value, and a store of value.',
        example: 'Imagine you have mangoes and want a notebook, but the shopkeeper wants pencils. With money, you sell your mangoes to someone else for ₹100, then buy the notebook from the shopkeeper.',
        takeaway: 'Money has value because people trust and agree to accept it — not because of what it is physically made of.'
      },
      {
        title: 'Income vs Expense',
        explanation: 'Income is money that comes IN. Expense is money that goes OUT. If Income > Expense, you save money. If Expense > Income, you go into debt. Tracking both is key to financial health.',
        example: 'If you get ₹1,000 pocket money (income) and spend ₹600 on snacks (expenses), your savings are ₹400.',
        takeaway: 'Income is what comes in, expense is what goes out — and the gap between them decides whether you build wealth or fall into debt.'
      },
      {
        title: 'Needs vs Wants',
        explanation: 'A need is something you cannot live without (food, water, shelter). A want is something nice but not essential (the latest phone, branded shoes). Prioritize needs first before spending on wants.',
        example: 'If you have ₹500, a broken school bag (need) takes priority over new branded sneakers (want).',
        takeaway: 'Needs keep you functioning; wants make life enjoyable — but needs should always get priority in your spending.'
      },
      {
        title: 'What is a Budget',
        explanation: 'A budget is a plan for your money — deciding in advance how you will spend, save, and what, before the money leaves. It involves tracking income, expenses, and savings.',
        example: 'Using the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.',
        takeaway: 'A budget is simply deciding where your money goes in advance, instead of wondering where it went after it is gone.'
      },
      {
        title: 'What is Inflation',
        explanation: 'Inflation means prices of things generally increase over time, making your money buy less in the future than it does today. Cash kept idle loses purchasing power as prices rise.',
        example: 'A packet of chips that cost ₹10 years ago might cost ₹20 today.',
        takeaway: 'Inflation quietly makes your money weaker over time — which is why growing it (through saving/investing) is important.'
      },
      {
        title: 'Currency & Exchange Rate',
        explanation: 'Currency is the type of money used in a country (e.g., Rupee, Dollar). Exchange rates tell you how much of one currency is worth in another and change daily based on economic factors.',
        example: 'If 1 USD = ₹83, a $20 game costs roughly ₹1,660.',
        takeaway: 'Currency is what a country uses, and exchange rate tells you how much of your money you need to get another country currency.'
      }
    ]
  },
  saving: {
    title: 'Saving Options',
    description: 'Where to put your cash safely',
    topics: [
      {
        title: 'Bank Savings Account',
        explanation: 'A basic account at a bank where you deposit and keep your money safely. You can withdraw anytime, get a debit card, and use it for online payments (UPI, etc.). Earns a small interest (usually 2.5%–4% per year) — not much, but better than cash sitting idle.',
        example: 'You open a savings account and keep ₹5,000 in it. The bank pays you a little interest every year, and you can withdraw cash anytime from an ATM.',
        takeaway: 'Best for: daily spending money + short-term savings.'
      },
      {
        title: 'Fixed Deposit (FD)',
        explanation: 'You deposit a lump sum for a fixed time period (e.g. 1 year, 5 years) and can\'t touch it till maturity (withdrawing early = penalty). Earns higher interest than a savings account (usually 6%–7.5%).',
        example: 'You put ₹10,000 in a 1-year FD at 7% interest. After 1 year, you get back ₹10,700 — guaranteed, no risk.',
        takeaway: 'Best for: money you won\'t need for a while and want to grow safely.'
      },
      {
        title: 'Recurring Deposit (RD)',
        explanation: 'Like an FD, but instead of one lump sum, you deposit a fixed small amount every month. Builds a saving habit — great for people who don\'t have a big amount at once but can save little by little.',
        example: 'You deposit ₹500 every month for 1 year into an RD. At the end, you get back all your deposits (₹6,000) plus interest earned on it.',
        takeaway: 'Best for: building a saving habit with monthly pocket money or salary.'
      },
      {
        title: 'TDR (Term Deposit Receipt)',
        explanation: 'Basically another name for a Fixed Deposit where interest is paid out periodically (monthly/quarterly) instead of all at the end. Useful if you want regular income from your deposit rather than a lump sum at maturity.',
        example: 'You deposit ₹1,00,000 as a TDR. Instead of waiting a year for interest, the bank credits you a small interest amount every quarter into your savings account.',
        takeaway: 'Best for: earning regular income rather than waiting for maturity.'
      },
      {
        title: 'STDR (Short Term Deposit Receipt)',
        explanation: 'Same as TDR, but for a shorter duration (usually 7 days to 1 year) and interest is paid at maturity (not periodically), and it auto-renews.',
        example: 'You have ₹20,000 you won\'t need for 3 months. You put it in an STDR for 3 months instead of leaving it in your savings account.',
        takeaway: 'Best for: parking money for a short period when you don\'t need it immediately.'
      },
      {
        title: 'Post Office Savings Schemes',
        explanation: 'Government-backed savings options offered through India Post — extremely safe since the government guarantees them.',
        example: 'Your grandparents invest ₹50,000 in a Post Office FD because it\'s backed by the government and they want zero risk with steady returns.',
        takeaway: 'Best for: risk-free, long-term, government-secured saving.'
      },
      {
        title: 'Provident Fund (PF / PPF)',
        explanation: 'PF: A retirement savings scheme where a portion of a salaried employee\'s salary is auto-deducted. PPF: A similar government scheme open to anyone, locks for 15 years, and earns good tax-free interest.',
        example: 'A working professional has ₹3,000 auto-deducted from their salary every month into PF. After 20-30 years, this grows into a large retirement fund.',
        takeaway: 'Best for: long-term, retirement-focused, tax-saving investment.'
      },
      {
        title: 'Sukanya Samriddhi Account',
        explanation: 'A government savings scheme specifically for a girl child (below 10 years), opened by parents/guardians. Offers high interest and tax benefits.',
        example: 'Parents open a Sukanya Samriddhi Account for their 5-year-old daughter and deposit money every year. By the time she\'s 18-21, it grows into a substantial fund for her education/marriage.',
        takeaway: 'Best for: parents saving long-term for a daughter\'s education or marriage.'
      },
      {
        title: 'Emergency Fund',
        explanation: 'A separate pool of money set aside only for unexpected situations — job loss, medical emergency, etc. Rule of thumb: keep 3 to 6 months\' worth of expenses saved in an easily accessible place.',
        example: 'You lose your job suddenly. Instead of borrowing, you use your emergency fund (saved earlier) to cover expenses while you find new income.',
        takeaway: 'Best for: covering unexpected situations—not for vacations or planned expenses.'
      },
      {
        title: 'Digital Micro-Saving Apps',
        explanation: 'Mobile apps that let you save small amounts automatically by rounding up purchases or auto-deducting daily/weekly amounts. Makes saving easy for beginners.',
        example: 'You buy a snack for ₹47 using a micro-saving app — it automatically rounds up to ₹50 and saves the extra ₹3.',
        takeaway: 'Best for: beginners who want to build a saving habit without manual effort.'
      }
    ]
  },
  banking: {
    title: 'Banking & Credit Basics',
    description: 'Checking accounts and building trust',
    topics: [
      {
        title: 'Types of Bank Accounts (Savings vs Current)',
        explanation: 'Savings Account: For individuals to save and grow money, earns interest, limited transactions. Current Account: For businesses, no interest, unlimited transactions, often offers overdraft.',
        example: 'A student keeps pocket money in a savings account to earn interest. A shop owner uses a current account for heavy daily business transactions.',
        takeaway: 'Savings = interest + limited transactions. Current = no interest + unlimited transactions.'
      },
      {
        title: 'Debit Card vs Credit Card',
        explanation: 'Debit Card: Linked directly to your bank account — you can only spend what you have. Credit Card: Bank lends you money up to a limit — you pay it back later, with high interest if not paid on time.',
        example: 'Debit card lets you spend your own ₹2,000. Credit card lets you spend ₹10,000 even if you don\'t have it, but you must repay it by the due date.',
        takeaway: 'Debit = spend your own. Credit = spend borrowed money (must repay!).'
      },
      {
        title: 'Simple Interest vs Compound Interest',
        explanation: 'Simple Interest: Interest on the original amount only. Compound Interest: Interest on the principal + previously earned interest — grows much faster.',
        example: 'Put ₹1,000 at 10%: Simple interest earns ₹100/yr. Compound interest earns ₹100 in year 1, but ₹110 in year 2 as it earns interest on interest.',
        takeaway: 'Compound interest is the secret to building wealth — the longer you stay invested, the more it grows.'
      },
      {
        title: 'What is a Loan',
        explanation: 'Borrowed money repaid over time with interest. Types: Personal (any need), Home (buy house), Education (studies), Car (vehicle).',
        example: 'To buy a ₹10 lakh house, you take a home loan for ₹8 lakh and repay it monthly with interest over 20 years.',
        takeaway: 'A loan helps you afford big purchases now, but you must factor in the cost of interest when repaying.'
      },
      {
        title: 'EMI Explained',
        explanation: 'EMI (Equated Monthly Installment): A fixed amount you pay monthly to repay a loan, including principal + interest. Spreads the cost of large purchases.',
        example: 'Buying a ₹24,000 phone on a 12-month EMI means paying roughly ₹2,000 + interest per month instead of the full amount at once.',
        takeaway: 'EMIs make big purchases affordable, but longer tenures mean paying more total interest.'
      },
      {
        title: 'Credit Score / CIBIL Score',
        explanation: 'A number (300-900) representing your trustworthiness at repaying loans. Built by responsibly using credit and paying on time.',
        example: 'Person A (score 800) gets a home loan easily at low interest. Person B (score 550) gets rejected or charged high interest.',
        takeaway: 'A good credit score is essential for getting loans approved at good rates.'
      },
      {
        title: 'Overdraft',
        explanation: 'Withdraw more money than you have in your account up to a limit — basically a short-term loan tied to your account. Interest is paid only on the amount/time used.',
        example: 'Your account balance is ₹0, but you pay a ₹5,000 bill using an overdraft — your balance becomes -₹5,000, and you pay interest on that until repaid.',
        takeaway: 'Useful for temporary cash gaps, but costly if overused.'
      }
    ]
  },
  loans: {
    title: 'Loans, Debt & Credit Cards',
    description: 'Understanding different types of debt and how to manage them',
    topics: [
      {
        title: 'Good Debt vs Bad Debt',
        explanation: 'Good Debt: Borrowed money used for something that builds long-term value, increases earning potential, or appreciates in value. Bad Debt: Borrowed money used for things that lose value immediately or don\'t generate future benefit.',
        example: 'Taking an education loan to boost future salary is good debt. Taking a personal loan for a vacation, with nothing to show for it once it\'s over, is bad debt.',
        takeaway: 'Does this loan help me earn more or build an asset, or does it just fund spending?'
      },
      {
        title: 'Credit Card Traps (Interest, Minimum Due Amount)',
        explanation: 'The "minimum due" simply keeps your account standing, but interest keeps piling up on the unpaid amount every single day. If you don\'t pay in full, you get charged very high interest.',
        example: 'You have a ₹20,000 credit card bill. You pay only the ₹1,000 minimum due. The remaining ₹19,000 now starts accumulating high interest daily.',
        takeaway: 'People get trapped in a debt spiral by paying only the minimum due every month.'
      },
      {
        title: 'Personal Loan',
        explanation: 'An unsecured loan (no collateral required) you can take for personal reasons. Because there\'s no collateral backing it, personal loans usually carry higher interest rates.',
        example: 'A sudden medical emergency requires ₹1,00,000. You take a personal loan, repaying it through EMIs over 2-3 years at a higher interest cost.',
        takeaway: 'Approval is faster but at higher interest, since lenders rely completely on your credit score and income.'
      },
      {
        title: 'Home Loan / Mortgage',
        explanation: 'A secured loan to buy/build a house — the house acts as collateral. Home loans have much lower interest rates and longer tenures compared to personal loans.',
        example: 'You buy a ₹50 lakh house with a ₹40 lakh home loan. You repay this over 20 years at a low interest rate, while getting tax deductions on the interest.',
        takeaway: 'A very efficient loan since it is secured by a valuable asset.'
      },
      {
        title: 'Education Loan',
        explanation: 'A loan specifically for funding education. It usually has a moratorium period — meaning repayment typically begins after the course finishes.',
        example: 'A student takes a ₹10 lakh education loan. They don\'t pay EMI while studying — repayment starts after graduating and earning.',
        takeaway: 'Considered "good debt" as it\'s an investment in future earning potential.'
      },
      {
        title: 'Debt-to-Income Ratio',
        explanation: 'DTI Ratio = (Total monthly debt payments ÷ Total monthly income) × 100. It tells what percentage of your income is committed to repaying debt.',
        example: 'You earn ₹50,000/month and pay ₹15,000/month across EMI and credit cards. DTI = (15,000 ÷ 50,000) × 100 = 30%.',
        takeaway: 'A lower DTI gives more financial breathing room; a high DTI makes it harder to get approved for new loans.'
      }
    ]
  },
  stocks: {
    title: 'Stock Market',
    description: 'Investing in companies you like',
    topics: [
      {
        title: 'What is a Stock/Share',
        explanation: 'A share (or stock) is a tiny piece of ownership in a company. When you buy a share, you literally own a small part of that company. Companies sell shares to raise money for growth. If the company does well, the value of your share usually goes up.',
        example: 'If a company has 100 shares total and you buy 1 share, you own 1% of that company. If the company grows, your 1% share becomes worth more.',
        takeaway: 'A share is a tiny piece of ownership in a company.'
      },
      {
        title: 'What is a Stock Exchange (NSE, BSE, NYSE)',
        explanation: 'A stock exchange is a marketplace where shares of companies are bought and sold. NSE and BSE are India\'s two main exchanges. NYSE is the largest in the US.',
        example: 'If you want to buy Reliance shares, the trade happens through NSE or BSE — your buy order matches with someone else\'s sell order.',
        takeaway: 'A stock exchange is an online marketplace for buying and selling company ownership.'
      },
      {
        title: 'What is an IPO',
        explanation: 'IPO (Initial Public Offering): The first time a private company sells its shares to the general public, officially becoming a "listed" company on a stock exchange.',
        example: 'A private company launches an IPO, selling shares at ₹500 each to the public for the first time. If you apply, you become a co-owner.',
        takeaway: 'IPO is when a company sells shares to the public for the first time.'
      },
      {
        title: 'Bull Market vs Bear Market',
        explanation: 'Bull Market: Prices generally rising, investors optimistic. Bear Market: Prices generally falling, investors pessimistic.',
        example: 'In a bull market, you buy a stock at ₹100 and it rises to ₹150. In a bear market, the same stock might fall to ₹70 as panic selling takes over.',
        takeaway: 'Bull = Rising prices/Optimism. Bear = Falling prices/Pessimism.'
      },
      {
        title: 'What is a Market Index (Nifty, Sensex)',
        explanation: 'A number representing the overall performance of a group of selected stocks. Nifty 50 (50 NSE companies), Sensex (30 BSE companies).',
        example: 'If Nifty 50 rises by 1%, it generally means most of India\'s top 50 companies\' stock prices went up that day — a quick snapshot of market health.',
        takeaway: 'A market index acts as a thermometer for the overall market.'
      },
      {
        title: 'Demat Account & Trading Account',
        explanation: 'Demat Account: Holds shares electronically. Trading Account: Places buy/sell orders. Both are needed to invest.',
        example: 'When you buy shares through an app, the trading account executes the order, and the shares sit safely in your Demat account.',
        takeaway: 'Demat = Digital locker for stocks. Trading = Place orders.'
      },
      {
        title: 'What is a Dividend',
        explanation: 'A portion of a company\'s profit paid out directly to shareholders. Not all companies pay them.',
        example: 'You own 100 shares of a company that declares a dividend of ₹5 per share. You receive ₹500 in your account.',
        takeaway: 'Dividends are regular income payments from company profits.'
      },
      {
        title: 'Market Order vs Limit Order',
        explanation: 'Market Order: Buy/sell immediately at the current price. Limit Order: Buy/sell only at a specific price you set.',
        example: 'Market order buys instantly at the current price (say ₹100.20). Limit order set at ₹98 only executes if the price drops to ₹98.',
        takeaway: 'Market = fast/current price. Limit = controls the price.'
      },
      {
        title: 'Blue-Chip Stocks',
        explanation: 'Shares of large, established, stable companies with a long track record.',
        example: 'Well-known companies that have been profitable for decades are typically blue-chip stocks.',
        takeaway: 'Blue-chip = large, reliable, stable companies.'
      },
      {
        title: 'Portfolio & Diversification',
        explanation: 'Portfolio: Collection of all your investments. Diversification: Spreading money across different investments/sectors to reduce risk.',
        example: 'Instead of putting all money into one company, invest in 5 companies across different sectors — if one sector crashes, the others can balance it out.',
        takeaway: 'Diversification (not putting all eggs in one basket) is key to managing risk.'
      },
      {
        title: 'Risk vs Return',
        explanation: 'Risk: Possibility of losing value. Return: Profit. Higher potential returns usually mean higher risk.',
        example: 'Fixed deposit offers low, guaranteed returns with almost zero risk. Stocks offer high potential returns but also high uncertainty/risk.',
        takeaway: 'There is no high return without high risk.'
      },
      {
        title: 'P/E Ratio (Intro Level)',
        explanation: 'P/E Ratio: Price-to-Earnings Ratio. Formula: Share Price ÷ Earnings Per Share. It helps judge if a stock is expensive vs the profit the company makes.',
        example: 'Share price is ₹100 and it earns ₹10 profit/share. P/E is 10 (100 ÷ 10).',
        takeaway: 'P/E ratio is a yardstick to compare how cheap or expensive a stock is.'
      }
    ]
  },
  mutualFunds: {
    title: 'Mutual Funds & ETFs',
    description: 'Pooled investing for beginners',
    topics: [
      {
        title: 'What is a Mutual Fund',
        explanation: 'A mutual fund pools money from many investors, and a professional manager invests that money into stocks/bonds on their behalf. You own "units" of the fund.',
        example: 'Instead of picking individual stocks, you put ₹5,000 into a mutual fund. The manager uses that pooled money to buy a mix of investments on your behalf.',
        takeaway: 'Mutual funds offer professional management and diversification through pooled money.'
      },
      {
        title: 'SIP (Systematic Investment Plan)',
        explanation: 'SIP lets you invest a fixed amount automatically every month, instead of a lump sum. Builds disciplined habits.',
        example: 'You set up a SIP of ₹1,000/month. It is auto-debited and invested, helping you build a substantial amount over years with small, regular investments.',
        takeaway: 'SIP is a disciplined way to invest small amounts regularly.'
      },
      {
        title: 'NAV (Net Asset Value)',
        explanation: 'NAV is the price of one unit of a mutual fund. Calculated daily based on the fund\'s total investment value.',
        example: 'If NAV is ₹50 and you invest ₹5,000, you get 100 units. If NAV rises to ₹60, those units are worth ₹6,000.',
        takeaway: 'NAV is the per-unit price of a mutual fund.'
      },
      {
        title: 'Types of Mutual Funds: Equity, Debt, Hybrid',
        explanation: 'Equity Funds: Invest in stocks (high growth, high risk). Debt Funds: Invest in bonds (stable, lower risk). Hybrid Funds: Mix of both.',
        example: 'A young person saving for retirement might choose an equity fund for high growth. Someone saving for a short-term goal might choose a debt fund for stability.',
        takeaway: 'Choose fund types based on your risk appetite and time horizon.'
      },
      {
        title: 'What is an ETF',
        explanation: 'ETF (Exchange-Traded Fund): Like a mutual fund, but trades on an exchange with live prices throughout the day.',
        example: 'Instead of waiting for EOD NAV, you buy a Nifty 50 ETF through your trading account; its price moves like a normal stock.',
        takeaway: 'ETFs offer the diversification of a mutual fund with the tradeability of a stock.'
      },
      {
        title: 'ELSS (Equity Linked Savings Scheme)',
        explanation: 'Equity mutual fund that provides tax savings (Section 80C). Has a mandatory 3-year lock-in period.',
        example: 'Investing ₹50,000 in ELSS reduces taxable income while potentially growing; you must stay invested for at least 3 years.',
        takeaway: 'ELSS combines market growth potential with tax-saving benefits.'
      },
      {
        title: 'SWP (Systematic Withdrawal Plan)',
        explanation: 'Opposite of SIP: Withdraw a fixed amount from your investment every month. Common for retirees.',
        example: 'A retiree invests ₹10 lakh and sets up an SWP of ₹8,000/month; this provides steady income while the remaining capital stays invested.',
        takeaway: 'SWP is a way to create regular income from a lump sum investment.'
      },
      {
        title: 'Expense Ratio',
        explanation: 'The annual fee a fund charges for managing your money. Expressed as a % of your investment.',
        example: 'If a fund has a 1% expense ratio on a ₹1,00,000 investment, ~₹1,000 goes to management fees, reducing your net returns.',
        takeaway: 'Lower expense ratios mean more of your returns stay in your pocket.'
      },
      {
        title: 'Index Funds',
        explanation: 'Mutual fund that copies/tracks a market index (like Nifty 50) instead of actively picking stocks. Low expense ratios.',
        example: 'Investing in a Nifty 50 Index Fund means your money mirrors the performance of India\'s top 50 companies with minimal fees.',
        takeaway: 'Index funds match market performance with low management fees.'
      }
    ]
  },
  crypto: {
    title: 'Cryptocurrency & Bitcoin',
    description: 'Digital money and decentralized finance',
    topics: [
      {
        title: 'What is cryptocurrency',
        explanation: 'A digital or virtual currency that is secured by cryptography, making it nearly impossible to counterfeit. It exists only digitally and is not backed by any government or central bank.',
        example: 'You buy ₹1,000 worth of Bitcoin. It sits in your digital wallet, and you can send it to someone anywhere in the world without a bank as a middleman.',
        takeaway: 'It\'s decentralized digital money not controlled by a single entity.'
      },
      {
        title: 'Bitcoin basics',
        explanation: 'The first and most famous cryptocurrency, created in 2009. It was designed as an alternative to traditional, government-issued money, with a capped supply (only 21 million will ever exist).',
        example: 'Many people buy Bitcoin hoping it will increase in value like digital gold, rather than using it for everyday purchases like a cup of coffee.',
        takeaway: 'Bitcoin is the original cryptocurrency, often viewed as "digital gold".'
      },
      {
        title: 'Blockchain explained simply',
        explanation: 'The underlying technology of cryptocurrency. It is a digital, public ledger that records all transactions across a network of computers. It is highly secure because records cannot be changed once added.',
        example: 'Imagine a shared document where everyone can see the changes and add to it, but nobody can delete or alter what was previously written. That\'s how blockchain tracks crypto ownership.',
        takeaway: 'Blockchain is the secure, unchangeable public record book that makes crypto work.'
      },
      {
        title: 'Crypto wallets (hot vs cold)',
        explanation: 'A digital place to store your cryptocurrency. "Hot" wallets are connected to the internet (apps) and are convenient but riskier. "Cold" wallets are physical devices disconnected from the internet (like a USB drive) and are more secure.',
        example: 'You keep a small amount of crypto in a phone app (hot wallet) for quick trading, but store your long-term Bitcoin investment on a secure USB device (cold wallet) hidden in a safe.',
        takeaway: 'Hot wallets are for convenience; cold wallets are for maximum security.'
      },
      {
        title: 'Crypto exchanges',
        explanation: 'Platforms where you can buy, sell, or trade cryptocurrencies using regular money (like Rupees or Dollars). Similar to stock exchanges, but for crypto.',
        example: 'You use an exchange app, link your bank account, and deposit money to buy Ethereum. The exchange facilitates the trade and holds your crypto for you.',
        takeaway: 'Exchanges are the digital marketplaces where you trade crypto.'
      },
      {
        title: 'Why crypto is so volatile',
        explanation: 'Crypto prices swing wildly up and down because the market is relatively new, heavily influenced by news/social media sentiment, and generally lacks intrinsic backing.',
        example: 'A famous tech CEO tweets about a coin, and its price jumps 50% in an hour. Later, a country announces crypto regulations, and the price drops 30% the next day.',
        takeaway: 'Crypto is highly unpredictable and risky compared to traditional investments.'
      },
      {
        title: 'Altcoins & stablecoins (advanced)',
        explanation: 'Altcoins: Any cryptocurrency other than Bitcoin (e.g., Ethereum). Stablecoins: Cryptocurrencies designed to minimize price swings by tying their value to a stable asset, like the US Dollar.',
        example: 'You want to hold crypto to buy something later without risking extreme price drops, so you hold a stablecoin like USDT, which aims to stay at exactly $1.',
        takeaway: 'Altcoins are alternatives to Bitcoin; Stablecoins are designed to hold a steady value.'
      },
      {
        title: 'NFTs (bonus advanced topic)',
        explanation: 'NFT (Non-Fungible Token) is a unique digital certificate of ownership for a digital item (like art or a video clip), recorded on a blockchain.',
        example: 'An artist sells a digital painting as an NFT. Anyone on the internet can right-click and save the image, but the blockchain proves that only one person truly "owns" the original item.',
        takeaway: 'NFTs represent digital ownership of unique, uncopyable assets.'
      }
    ]
  },
  insurance: {
    title: 'Insurance',
    description: 'Protecting your future',
    topics: [
      {
        title: 'Why Insurance Exists At All',
        explanation: 'Insurance is a way to protect yourself financially from unexpected, costly events (death, illness, accidents, theft) by paying a small regular amount. Works on risk-sharing: many pay a small amount into a pool, and only those who face misfortune receive a large payout.',
        example: 'Thousands of people each pay ₹10,000/year for health insurance. If one person gets a ₹5,00,000 hospital bill, the insurance pool covers it.',
        takeaway: 'The goal isn\'t to make money from insurance — it\'s to avoid going broke from one bad event.'
      },
      {
        title: 'Life Insurance',
        explanation: 'A policy that pays a lump sum amount to your family/nominee if you pass away during the policy term. Designed to financially protect your dependents after you\'re gone.',
        example: 'A father takes a life insurance policy of ₹50 lakh. If something happens to him, his family receives ₹50 lakh to cover expenses without his income.',
        takeaway: 'Especially important for the sole/main earning member of a family.'
      },
      {
        title: 'Health Insurance',
        explanation: 'Covers medical expenses — hospitalization, surgeries, treatments — so a sudden illness or accident doesn\'t drain your entire savings.',
        example: 'You\'re hospitalized and the bill is ₹3,00,000. With health insurance, the insurer pays most/all of this bill instead of you taking a loan.',
        takeaway: 'High medical costs make health insurance one of the most essential financial protections.'
      },
      {
        title: 'Term Insurance vs Whole Life Insurance',
        explanation: 'Term Insurance: pure protection for a fixed period (cheaper, no savings component). Whole Life Insurance: covers your entire life and builds value over time (much more expensive).',
        example: 'A 30-year-old buys ₹1 crore term insurance for 30 years at a low premium for pure protection. The same cover as whole life insurance would cost much more.',
        takeaway: 'Experts often recommend cheaper term insurance for protection and investing the difference separately.'
      },
      {
        title: 'Premium & Sum Assured Explained',
        explanation: 'Premium: The amount you regularly pay to keep your policy active (the cost). Sum Assured: The guaranteed amount the insurance company will pay out when a covered event happens (the benefit).',
        example: 'You pay a premium of ₹12,000/year for a life insurance policy with a sum assured of ₹50 lakh.',
        takeaway: 'Higher sum assured = higher premium, since the insurer takes on more risk.'
      },
      {
        title: 'Vehicle Insurance',
        explanation: 'Covers financial losses related to your vehicle (accidents, theft) or third-party liability (damage you cause to others). Basic third-party insurance is legally mandatory in most countries.',
        example: 'You accidentally damage someone else\'s car. With third-party vehicle insurance, the insurance company pays for their damages.',
        takeaway: 'Comprehensive insurance covers both your own vehicle and third-party liability.'
      }
    ]
  },
  taxes: {
    title: 'Taxes',
    description: 'Understanding the system',
    topics: [
      {
        title: 'What Are Taxes & Why We Pay Them',
        explanation: 'Mandatory payments to the government used to fund public services like roads, schools, hospitals, and defense. Everyone who earns above a limit or buys things contributes.',
        example: 'The roads you travel on and public hospitals are funded by taxes. You indirectly benefit even if you don\'t pay much yet.',
        takeaway: 'Taxes are how a country funds itself and provides public services.'
      },
      {
        title: 'Income Tax Basics',
        explanation: 'A tax on the money you earn (salary, business profit, interest). The more you earn, the more tax you owe. You file an Income Tax Return (ITR) yearly.',
        example: 'When you start earning a salary, a portion goes to the government as income tax, either deducted by your employer or paid when filing returns.',
        takeaway: 'Income tax is based on how much you earn over an exempt limit.'
      },
      {
        title: 'Direct Tax vs Indirect Tax',
        explanation: 'Direct Tax: Paid directly by you on your income/wealth (e.g., Income Tax). Indirect Tax: Paid indirectly through the price of goods/services (e.g., GST).',
        example: 'Income tax from your salary is direct. Paying GST included in a pizza bill is indirect (the restaurant collects and forwards it).',
        takeaway: 'Direct = taxed on earnings. Indirect = taxed on spending.'
      },
      {
        title: 'GST Explained Simply',
        explanation: 'Goods and Services Tax (GST) is a unified indirect tax on the sale of goods and services. Different items have different rates and it is already included in prices.',
        example: 'When you buy a ₹1,000 product with 18% GST, you pay ₹1,180. The seller keeps ₹1,000 and the ₹180 goes to the government.',
        takeaway: 'GST is the single tax you pay when shopping or eating out.'
      },
      {
        title: 'Tax-Saving Investments',
        explanation: 'Governments allow you to reduce taxable income by investing in specific options (like PPF, ELSS, life insurance under Section 80C in India).',
        example: 'You invest ₹1,50,000 in PPF/ELSS. This amount is deducted from your taxable income, so you pay tax on a smaller amount while growing your savings.',
        takeaway: 'Smart planning saves you tax money while building future wealth.'
      },
      {
        title: 'Tax Slabs (Basic Intro)',
        explanation: 'Income isn\'t taxed at one flat rate. Lower income portions are taxed at low/0% rates, and higher portions at progressively higher rates.',
        example: 'If you earn ₹5,00,000 and the first ₹3,00,000 is tax-free, you only pay tax on the remaining ₹2,00,000 at the applicable slab rate.',
        takeaway: 'Tax slabs ensure higher earners pay a proportionately higher tax.'
      }
    ]
  },
  realestate: {
    title: 'Real Estate & Gold',
    description: 'Investing in physical assets',
    topics: [
      {
        title: 'Real Estate Investing Basics',
        explanation: 'Buying property (land, house, commercial space) with the goal of earning money through rental income, price appreciation, or both. It requires a large upfront amount and is a long-term, low-liquidity investment.',
        example: 'You buy a flat for ₹40 lakh, rent it out for ₹15,000/month, and after 10 years its value rises to ₹70 lakh. You\'ve earned regular income plus long-term price growth.',
        takeaway: 'Real estate requires high capital but can provide a steady income and appreciation over time.'
      },
      {
        title: 'Rent vs Buy — How to Think About It',
        explanation: 'Renting offers flexibility and lower upfront costs but no ownership. Buying builds long-term equity/assets but requires a large financial commitment and ties you to a location.',
        example: 'A person frequently changing cities may prefer renting. Someone settled with a stable income might prefer buying to build long-term ownership rather than paying rent indefinitely.',
        takeaway: 'The choice depends on your financial stability and desire for flexibility versus building an asset.'
      },
      {
        title: 'REITs (Real Estate Investment Trusts)',
        explanation: 'Lets you invest in real estate without buying physical property. You buy units of a REIT (which manages large properties and earns rent), similar to a mutual fund, and it trades on the stock exchange.',
        example: 'Instead of spending ₹40 lakh on a flat, you invest ₹10,000 in a REIT. You earn a proportional share of the rental income from the buildings the REIT manages.',
        takeaway: 'REITs offer real estate exposure with small amounts of money and high liquidity.'
      },
      {
        title: 'Gold as an Investment (Physical, Digital, SGBs)',
        explanation: 'Physical Gold: Has making charges and storage risks. Digital Gold: Buy small amounts online, securely stored. Sovereign Gold Bonds (SGBs): Government-backed paper gold that pays additional small yearly interest and has no making charges.',
        example: 'Instead of a physical gold coin, you buy ₹5,000 worth of SGBs. Their value moves with gold prices, you earn a small yearly interest, and there is no risk of theft.',
        takeaway: 'SGBs are often considered the safest and most efficient way to invest in gold.'
      }
    ]
  },
  retirement: {
    title: 'Retirement & Long-Term Planning',
    description: 'Planning for forever',
    topics: [
      {
        title: 'Why Starting Early Matters (Power of Compounding)',
        explanation: 'Compounding means you earn returns not just on your original investment, but also on the returns it has earned. The earlier you start, the more time it has to snowball.',
        example: 'Person A invests ₹2,000/month at 20. Person B invests ₹4,000/month at 30. By 60, Person A often has more wealth simply because of the 10 extra years of growth.',
        takeaway: 'Start early — time matters more than the amount you invest.'
      },
      {
        title: 'Retirement Accounts Overview',
        explanation: 'Special long-term investment accounts designed to build a retirement fund, often with tax benefits. Examples: NPS, PPF, EPF (India) or 401k (US).',
        example: 'Like studying early for an exam, you don\'t wait until your 50s to build a retirement fund — these accounts are for steady, decades-long contribution.',
        takeaway: 'Save consistently over decades to have a large fund ready when you stop working.'
      },
      {
        title: 'NPS (National Pension System)',
        explanation: 'A government-backed retirement scheme in India. You contribute regularly, and the money is invested in a mix of equity and bonds. At retirement, you withdraw a lump sum and get a regular pension.',
        example: 'A 25-year-old contributes ₹2,000/month to NPS. By retirement, it grows into a corpus that pays out partially as a lump sum and the rest as a lifelong pension.',
        takeaway: 'NPS offers long-term growth through market investments, plus tax benefits.'
      },
      {
        title: 'UPS (Unified Pension Scheme)',
        explanation: 'A government pension scheme in India that combines features of the old guaranteed-pension system with the market-linked NPS. It aims to offer more predictability by guaranteeing a minimum pension.',
        example: 'A government employee unsure about market risk may choose UPS over NPS for a guaranteed pension amount tied to their salary.',
        takeaway: 'UPS provides a predictable, guaranteed pension option.'
      },
      {
        title: 'EPF (Employees\' Provident Fund)',
        explanation: 'A mandatory retirement scheme for salaried employees. A percentage of your salary is auto-deducted, matched by your employer, and earns interest to build a retirement corpus.',
        example: 'If your salary is ₹30,000/month, 12% is auto-deducted and matched by your employer, building a substantial fund over decades automatically.',
        takeaway: 'EPF builds retirement savings seamlessly through mandatory payroll deductions.'
      },
      {
        title: 'APS (Atal Pension Yojana)',
        explanation: 'A government pension scheme targeted at workers in the unorganized sector. Contribute a small fixed amount regularly, and after 60, receive a guaranteed fixed monthly pension.',
        example: 'A small vendor without employer benefits enrolls, contributing a small amount monthly. After turning 60, they receive a fixed guaranteed pension for life.',
        takeaway: 'APS extends retirement security to workers without formal employer benefits.'
      },
      {
        title: 'Pension Plans',
        explanation: 'Any financial product designed to provide regular income after retirement. The goal is to convert years of saving into a steady, reliable income stream when you\'re no longer working.',
        example: 'Instead of getting one large lump sum and worrying about managing it, a pension provides a predictable monthly amount like a salary during retirement.',
        takeaway: 'Pension plans ensure a steady income when you stop earning a salary.'
      },
      {
        title: 'SCSS — Senior Citizen Savings Scheme',
        explanation: 'A government savings scheme specifically for senior citizens (60+). Offers a safe place to invest retirement savings with attractive, regular quarterly interest income.',
        example: 'A retiree invests ₹10 lakh in SCSS and receives fixed interest every quarter, covering living expenses without touching the principal amount.',
        takeaway: 'SCSS is a safe, government-backed option for regular income during retirement.'
      },
      {
        title: 'What is Financial Independence / FIRE',
        explanation: 'Financial Independence (FI): Having enough savings to cover living expenses without working. FIRE (Financial Independence, Retire Early): Aggressively saving/investing to retire decades early.',
        example: 'Instead of working until 60, someone saves 60% of their income from their 20s. By their 40s, passive income covers their expenses and they can choose to retire early.',
        takeaway: 'FIRE is about high savings and smart investing to gain freedom of time early in life.'
      }
    ]
  },
  planning: {
    title: 'Financial Planning & Money Mindset',
    description: 'Creating your path',
    topics: [
      {
        title: 'Budgeting Methods (e.g. 50/30/20 Rule)',
        explanation: 'A structured way to split income. Planners often use 50% for Needs (rent, groceries), 30% for Wants (fun), and 20% for Savings/Investments.',
        example: 'If you earn ₹20,000, ₹10,000 goes to needs, ₹6,000 to wants, and ₹4,000 to savings, providing clear structure instead of guessing where money went.',
        takeaway: 'Give your money a plan before you spend it.'
      },
      {
        title: 'Goal-Based Saving',
        explanation: 'Setting a specific target (amount + deadline) rather than saving randomly. It helps choose the right strategy—safe for short-term, growth for long-term.',
        example: 'Instead of "saving some money", you save "₹50,000 for a laptop in 18 months", which means saving ~₹2,800 monthly.',
        takeaway: 'Goal-based saving makes setting money aside feel meaningful and motivating.'
      },
      {
        title: 'What is Net Worth',
        explanation: 'A snapshot of financial health: (Everything you own/Assets) − (Everything you owe/Liabilities). Net worth tracks true wealth better than income alone.',
        example: 'You have ₹2.5L in assets (savings + bike) but owe ₹80K (loan). Your net worth is ₹1.7L. This reflects true financial position.',
        takeaway: 'Tracking net worth shows if you are actually getting financially stronger.'
      },
      {
        title: 'What "Financial Freedom" Actually Means',
        explanation: 'Having enough savings or passive income to support your lifestyle without being forced to work out of necessity. It buys choices and lowers stress.',
        example: 'Two people earn ₹1L/month. One is paycheck-to-paycheck. The other has investments covering basic expenses and therefore has financial freedom.',
        takeaway: 'Money working for you gives you real choices over your time.'
      },
      {
        title: 'Common Money Mistakes Beginners Make',
        explanation: 'Mistakes like not tracking expenses, having no emergency fund, lifestyle inflation (spending more as income rises), and blindly following hype instead of research.',
        example: 'Someone gets a salary hike from ₹30K to ₹50K and immediately spends more (new phone, eating out) instead of saving the difference.',
        takeaway: 'Avoding basic mistakes (like mixing insurance and investment) saves years of financial delay.'
      },
      {
        title: 'Why We Spend Irrationally (Behavioral Finance Basics)',
        explanation: 'Human emotions drive money decisions. Patterns like Impulse buying, Social pressure/FOMO, and Instant gratification bias can ruin a financial plan.',
        example: 'You see a friend buy a new phone and feel pressure to upgrade your own perfectly working phone due to FOMO, an irrational behavior.',
        takeaway: 'Awareness of emotional patterns helps you pause and make logical money decisions.'
      }
    ]
  },
  fraud: {
    title: 'Online Fraud & Scam Awareness',
    description: 'Staying safe online',
    topics: [
      {
        title: 'What is Online Financial Fraud?',
        explanation: 'Online financial fraud means tricking someone into giving away money, bank/card details, or OTPs through fake calls, messages, links, or apps — designed to look genuine and trustworthy.',
        example: 'You receive a call from someone claiming to be a bank employee saying your account will be blocked unless you share the OTP you just received. A genuine bank never asks for your OTP.',
        takeaway: 'Hanging up and calling your bank directly to verify is the safe move.'
      },
      {
        title: 'Common Scam Types',
        explanation: 'Methods include Phishing (fake links), OTP scams (asking for OTPs over call), Fake loan/job offers (asking for upfront fees), UPI/QR code scams (tricking you into scanning to "receive" money), and Investment scams (fake high returns).',
        example: 'Someone sends you a QR code claiming it will transfer ₹10,000 to your account. Scanning a QR code with a UPI app only sends money, it never receives it.',
        takeaway: 'Scams often prey on fear, urgency, or the desire for quick money.'
      },
      {
        title: 'Golden Safety Rules',
        explanation: 'Never share OTP, CVV, PIN, or passwords. Do not click unknown links in SMS/email claiming urgent account issues. Anything promising guaranteed high returns is likely a scam. Verify before trusting.',
        example: 'You get an urgent text that your bank account is suspended and to click a link. Instead of clicking, you open your official banking app and see your account is completely fine.',
        takeaway: 'Real bank or company representatives will never pressure you for instant action or secret information.'
      }
    ]
  },
  fintech: {
    title: 'Digital Finance & Fintech',
    description: 'The modern way to manage money',
    topics: [
      {
        title: 'UPI / Digital Payments',
        explanation: 'UPI lets you instantly transfer money between bank accounts using a mobile app. It replaces cash and cards for everyday transactions 24/7.',
        example: 'Instead of cash, you scan a vendor\'s QR code with a UPI app and money moves from your bank to theirs in seconds.',
        takeaway: 'UPI is a fast, digital, cash-free payment system.'
      },
      {
        title: 'Neobanks (Digital-Only Banks)',
        explanation: 'Banks operating entirely online with no physical branches. They often partner with traditional banks but offer a smooth, app-based experience with real-time insights.',
        example: 'You download a neobank app, complete KYC via video, and get a fully functional account and card without ever visiting a branch.',
        takeaway: 'Neobanks deliver a fully digital, modern banking experience.'
      },
      {
        title: 'Robo-Advisors',
        explanation: 'Automated platforms that create and manage investment portfolios based on your goals and risk tolerance with minimal human involvement. They are usually cheaper than human advisors.',
        example: 'You answer questions on an app, and it automatically builds and rebalances a portfolio of mutual funds/ETFs for you.',
        takeaway: 'Robo-advisors make professional-style investing accessible and affordable.'
      },
      {
        title: 'Buy Now Pay Later (BNPL) — Pros & Traps',
        explanation: 'BNPL lets you buy things immediately and pay in installments. Pros: Accessible short-term credit. Traps: Easy to overspend, lose track, and incur penalty fees, hurting your credit score.',
        example: 'You buy a ₹6,000 gadget in 3 installments. If paid on time, it\'s free. But managing multiple BNPL purchases can quickly lead to unexpected debt.',
        takeaway: 'BNPL is convenient but requires careful tracking to avoid debt traps.'
      }
    ]
  }
};
