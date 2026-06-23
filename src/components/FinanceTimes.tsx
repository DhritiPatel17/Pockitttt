import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, AlertCircle, TrendingUp, ChevronRight, BarChart3, Building, FileText } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface FinanceTimesProps {
  onClose: () => void;
}

interface NewsItem {
  headline: string;
  content: string;
}

interface KeyStat {
  label: string;
  value: string;
  description: string;
}

interface FinanceNews {
  leadStory: NewsItem;
  keyStat: KeyStat;
  secondaryStories: NewsItem[];
}

interface ChartDataPoint {
  date: string;
  close: number;
}

interface MarketChartData {
  symbol: string;
  data: ChartDataPoint[];
}

export const FinanceTimes: React.FC<FinanceTimesProps> = ({ onClose }) => {
  const [news, setNews] = useState<FinanceNews | null>(null);
  const [chartData, setMarketChartData] = useState<MarketChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);

  const fetchLiveNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance-times');
      if (!res.ok) {
        let errMessage = `Server returned ${res.status} ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch (_) {} 
        throw new Error(`Failed to fetch live data: ${errMessage}`);
      }
      const data = await res.json();

      setNews(data.news);
      setMarketChartData(data.marketChart);
      setIsLive(data.isLive !== false);
      setCurrentPage(0); // Reset to front page on refresh
    } catch (err: any) {
      setError(err.message || 'Could not load live data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNews();
  }, []);

  useEffect(() => {
    setIsChartReady(false);
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 450); // Give motion page slide transitions time to stabilize layout width/height
    return () => clearTimeout(timer);
  }, [currentPage]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getParagraphs = (content: string, sentencesPerParagraph = 2): string[] => {
    if (!content) return [];
    // Try splitting on double newline first
    let paras = content.split(/\n\s*\n+/).map(p => p.trim()).filter(p => p.length > 0);
    
    // If we only have 1 or 2 paragraphs and content is long, try single newlines
    if (paras.length <= 1 && content.includes('\n')) {
      const singleLineParas = content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      if (singleLineParas.length > 1) {
        paras = singleLineParas;
      }
    }
    
    // If it's still 1 monolithic block because there were no newlines, split by sentence boundaries
    if (paras.length <= 1) {
      const rawText = content.replace(/\s+/g, ' ');
      // Match sentence endings
      const sentences = rawText.match(/[^.!?]+[.!?]+(\s|$)/g) || [rawText];
      const chunks: string[] = [];
      for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        const chunk = sentences.slice(i, i + sentencesPerParagraph).join('').trim();
        if (chunk) {
          chunks.push(chunk);
        }
      }
      if (chunks.length > 0) {
        paras = chunks;
      }
    }
    return paras;
  };

  const serifFont = "'Playfair Display', 'Merriweather', 'Georgia', serif";
  const typewriterFont = "'Special Elite', 'Courier Prime', Courier, monospace";
  const sansFont = "'Inter', 'Nunito', sans-serif";
  const gothicFont = "'UnifrakturMaguntia', 'Pirata One', 'Playfair Display', serif";

  const getNewspaperImage = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("market") || t.includes("chart") || t.includes("trading") || t.includes("floor")) {
      return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80"; // Live Stock market board
    }
    if (t.includes("bank") || t.includes("regulation") || t.includes("economy") || t.includes("reserve")) {
      return "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"; // Classic gold bank vault safe
    }
    if (t.includes("corporate") || t.includes("business") || t.includes("headquarters") || t.includes("spotlight")) {
      return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"; // Skyscraper corporate headquarters
    }
    return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"; // Financial team work desk
  };

  // Shared newspaper photograph display component with halftone dot overlay and grayscale aesthetics
  const PlaceholderImage = ({ title, height = "h-36 sm:h-48", bgColor = "bg-[#E5E5E5]" }: { title: string, height?: string, bgColor?: string }) => {
    const imageUrl = getNewspaperImage(title);
    const [imgErr, setImgErr] = useState(false);

    return (
      <div className={`w-full ${height} ${bgColor} border border-[#1A1A1A] relative overflow-hidden group mb-4`}>
        {/* Halftone newsprint dot simulation overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '4px 4px' }}></div>
        
        {!imgErr ? (
          <img 
            src={imageUrl} 
            alt={title}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover grayscale contrast-110 sepia-[20%] opacity-90 transition-all duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/40 p-3 text-center">
            <span className="font-typewriter italic text-xs text-gray-400">Press Photograph: {title}</span>
          </div>
        )}

        <div className="bg-[#1A1A1A] text-[#FDFBF7] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest absolute top-2 right-2 z-20">
          Press Photo
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A]/80 text-[#FDFBF7] py-1 px-3 text-[11px] font-typewriter italic z-20 truncate">
          {title}
        </div>
      </div>
    );
  };

  const renderFrontPage = () => {
    if (!news) return null;
    
    // Split lead story content robustly to create multi-column effect manually avoiding CSS column bugs
    const paragraphs = getParagraphs(news.leadStory.content);
    const halfIdx = Math.ceil(paragraphs.length / 2);
    const leftCol = paragraphs.slice(0, halfIdx);
    const rightCol = paragraphs.slice(halfIdx);

    return (
      <motion.div
        key="page-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {/* Masthead */}
        <div className="border-b-4 border-double border-[#1A1A1A] pb-2 sm:pb-4 mb-4 sm:mb-8 text-center pt-1 sm:pt-2">
          <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-2 mb-2 text-[10px] sm:text-xs uppercase tracking-widest font-bold" style={{ fontFamily: sansFont }}>
            <span>Vol 1. No. 1</span>
            <span>{today}</span>
            <span className="text-[#FF2A85]">Free Edition</span>
          </div>
          <h1 
            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-normal tracking-tight mt-2 sm:mt-4 mb-2 select-none leading-none" 
            style={{ fontFamily: gothicFont }}
          >
            Finance Times
          </h1>
          <p className="italic text-xs sm:text-sm md:text-base border-t border-[#1A1A1A] pt-2 sm:pt-3" style={{ fontFamily: typewriterFont }}>
            The Essential Guide to Indian Markets for the Next Generation, Reported via Live Data
          </p>
        </div>

        {/* Lead Story Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-6" style={{ fontFamily: serifFont }}>
              {news.leadStory.headline}
            </h2>
            <div className="border-t-[3px] border-[#1A1A1A] w-12 sm:w-16 mb-4 sm:mb-6"></div>
            
            {/* 2-Column Manual Grid for Lead Story in Typewriter format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 text-sm sm:text-base md:text-lg leading-relaxed sm:leading-loose text-justify text-gray-800" style={{ fontFamily: typewriterFont }}>
              <div>
                {leftCol.map((paragraph, idx) => (
                  <p key={`left-${idx}`} className={`mb-3 sm:mb-6 leading-relaxed sm:leading-loose ${idx === 0 ? "first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:pr-2 sm:first-letter:pr-3 first-letter:pt-0.5 sm:first-letter:pt-1 first-letter:font-black first-letter:leading-[0.8]" : ""}`}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
              <div>
                {rightCol.map((paragraph, idx) => (
                  <p key={`right-${idx}`} className="mb-3 sm:mb-6 leading-relaxed sm:leading-loose">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-8 border-t lg:border-t-0 lg:border-l-2 border-[#E5E5E5] pt-4 lg:pt-0 pl-0 lg:pl-8">
            <PlaceholderImage title="Market Action Snapshot" height="h-32 sm:h-64" />
            
            {/* Key Stat Callout */}
            <div className="bg-[#FDFBF7] border-[2px] sm:border-[3px] border-[#1A1A1A] p-4 sm:p-6 shadow-[3px_3px_0px_#1A1A1A]">
              <div className="uppercase tracking-widest text-[11px] sm:text-[13px] font-bold font-mono text-[#FF2A85] mb-2 sm:mb-3">
                {news.keyStat.label}
              </div>
              <div className="text-3xl sm:text-5xl font-black mb-2 sm:mb-4 tracking-tighter leading-none" style={{ fontFamily: sansFont }}>
                {news.keyStat.value}
              </div>
              <div className="border-t border-[#E5E5E5] pt-2 sm:pt-3">
                <p className="text-sm sm:text-base font-medium leading-relaxed text-gray-700 italic" style={{ fontFamily: typewriterFont }}>
                  "{news.keyStat.description}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMarketsPage = () => {
    return (
      <motion.div
        key="page-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="border-b-2 border-[#1A1A1A] pb-2 sm:pb-3 mb-4 sm:mb-8 flex items-center justify-between">
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest" style={{ fontFamily: sansFont }}>Markets & Index</h2>
          <span className="bg-[#C6FF00] px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[10px] sm:text-xs font-bold border border-[#1A1A1A]">SECTION 2</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-8">
            {chartData && chartData.data.length > 0 ? (
              <div className="border border-[#1A1A1A] bg-white p-3 sm:p-6 shadow-sm mb-4 sm:mb-8">
                <div className="flex justify-between items-end mb-4 border-b border-[#1A1A1A] pb-2 sm:pb-3">
                  <div>
                    <h3 className="font-black text-lg sm:text-2xl" style={{ fontFamily: sansFont }}>{chartData.symbol}</h3>
                    <p className="font-serif italic text-xs sm:text-sm text-gray-600">30-Day Historical Performance</p>
                  </div>
                  <TrendingUp className="text-[#FF2A85] mb-1" size={24} />
                </div>
                
                <div className="h-48 sm:h-80 w-full min-h-[200px] sm:min-h-[320px] flex items-center justify-center transition-all bg-[#FAF9F6]">
                  {isChartReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 9, fontFamily: sansFont, fill: '#1A1A1A' }}
                          tickMargin={6}
                          axisLine={{ stroke: '#1A1A1A' }}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 9, fontFamily: sansFont, fill: '#1A1A1A' }}
                          width={45}
                          axisLine={{ stroke: '#1A1A1A' }}
                          tickLine={false}
                          tickFormatter={(val) => Math.round(val).toLocaleString('en-IN')}
                        />
                        <Tooltip 
                          contentStyle={{ fontFamily: sansFont, fontSize: '11px', borderRadius: '0', border: '2px solid #1A1A1A', padding: '8px', boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1A1A1A', marginBottom: '4px' }}
                          itemStyle={{ color: '#FF2A85', fontWeight: 'bold' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="close" 
                          stroke="#1A1A1A" 
                          strokeWidth={2}
                          dot={{ r: 1.5, fill: '#FF2A85', strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: '#C6FF00', stroke: '#1A1A1A', strokeWidth: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 font-mono text-[10px] text-gray-400">
                      <RefreshCw className="animate-spin text-[#FF2A85]" size={20} />
                      <span>Inking Market Performance Chart...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
               <div className="border border-[#1A1A1A] p-6 text-center font-mono text-xs text-gray-500 mb-4">
                 Market charts are currently unavailable.
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-2xl mb-2 sm:mb-4 leading-snug">Index Watch: Navigating the Swings</h3>
                <p className="font-typewriter text-xs sm:text-sm md:text-base leading-relaxed sm:leading-loose text-justify text-gray-800" style={{ fontFamily: typewriterFont }}>
                  The current trends in the Nifty 50 highlight persistent volatility. Market participants are keeping a close watch on upcoming interest rate decisions. Tracking these broader movements helps individual investors recognize the general direction of the economy before making major personal finance decisions.
                </p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 sm:p-6">
                <h4 className="font-bold uppercase tracking-widest text-[10px] font-mono mb-2 text-[#FF2A85]">Term of the Day</h4>
                <h5 className="font-bold text-lg mb-1 font-serif">Market Capitalization</h5>
                <p className="font-typewriter text-xs sm:text-sm leading-relaxed text-gray-700" style={{ fontFamily: typewriterFont }}>
                  The total value of a company's shares of stock. It's calculated by multiplying the price of a stock by its total number of outstanding shares. Large-cap companies are generally considered safe investments than small-cap stocks.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l-2 border-[#E5E5E5] pt-4 lg:pt-0 pl-0 lg:pl-8">
            <PlaceholderImage title="Trading Floor View" height="h-28 sm:h-48" bgColor="bg-[#D1FAE5]" />
            <h3 className="font-serif font-bold text-lg sm:text-2xl mb-2 sm:mb-4">Volume Activity Notes</h3>
            <p className="font-typewriter text-xs sm:text-sm lg:text-base leading-relaxed lg:leading-loose text-gray-800 mb-4 border-b border-[#E5E5E5] pb-4" style={{ fontFamily: typewriterFont }}>
              Trading volumes provide liquidity and indicate the strength of a price movement. Higher volume on up-days is generally considered bullish behavior by major institutional funds.
            </p>
            <div className="pt-1">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#FF2A85] mb-2 border-l-2 border-[#FF2A85] pl-2">Market Sentiment</span>
              <p className="font-typewriter italic text-gray-600 text-xs sm:text-sm lg:text-base" style={{ fontFamily: typewriterFont }}>"The markets are driven by real earnings but sometimes dominated by short-term sentiment."</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCombinedPage = () => {
    if (!news) return null;
    const economyStory = news.secondaryStories && news.secondaryStories[0];
    const businessStory = news.secondaryStories && news.secondaryStories[1];

    return (
      <motion.div
        key="page-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="border-b-2 border-[#1A1A1A] pb-2 sm:pb-3 mb-4 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Building size={20} className="text-[#1A1A1A]" />
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest" style={{ fontFamily: sansFont }}>Business & Economy</h2>
          </div>
          <span className="bg-[#1A1A1A] text-white px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[10px] sm:text-xs font-bold border border-[#1A1A1A]">SECTION 3</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E2E2]">
          {/* Left Column: Economy & Regulation */}
          {economyStory ? (
            <div className="flex flex-col justify-between h-full pb-4 lg:pb-0">
              <div>
                <span className="text-[#FF2A85] font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold block mb-1 sm:mb-2">I. Economy & Regulation</span>
                <h3 className="text-xl sm:text-3xl font-bold leading-tight mb-2 sm:mb-4" style={{ fontFamily: serifFont }}>
                  {economyStory.headline}
                </h3>
                <div className="border-t-2 border-[#1A1A1A] w-10 sm:w-12 mb-3 sm:mb-4"></div>
                <div className="text-xs sm:text-sm md:text-base leading-relaxed sm:leading-loose text-justify text-gray-800 space-y-2 sm:space-y-4" style={{ fontFamily: typewriterFont }}>
                  {getParagraphs(economyStory.content).map((p, idx) => (
                    <p key={`eco-${idx}`} className="leading-relaxed sm:leading-loose">{p.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-[#E5E5E5]">
                <PlaceholderImage title="Reserve Bank Regulation & Profile" height="h-28 sm:h-44" bgColor="bg-[#FEE2E2]" />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 italic" style={{ fontFamily: typewriterFont }}>Economy section being compiled...</div>
          )}

          {/* Right Column: Business Spotlight */}
          {businessStory ? (
            <div className="lg:pl-8 pt-6 lg:pt-0 flex flex-col justify-between h-full">
              <div>
                <span className="text-[#FF2A85] font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold block mb-1 sm:mb-2">II. Business Spotlight</span>
                <h3 className="text-xl sm:text-3xl font-bold leading-tight mb-2 sm:mb-4" style={{ fontFamily: serifFont }}>
                  {businessStory.headline}
                </h3>
                <div className="border-t-2 border-[#1A1A1A] w-10 sm:w-12 mb-3 sm:mb-4"></div>
                <div className="text-xs sm:text-sm md:text-base leading-relaxed sm:leading-loose text-justify text-gray-800 space-y-2 sm:space-y-4" style={{ fontFamily: typewriterFont }}>
                  {getParagraphs(businessStory.content).map((p, idx) => (
                    <p key={`bus-${idx}`} className="leading-relaxed sm:leading-loose">{p.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-[#E5E5E5]">
                <PlaceholderImage title="Corporate Growth & Headquarters" height="h-28 sm:h-44" bgColor="bg-[#E0E7FF]" />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 italic lg:pl-8" style={{ fontFamily: typewriterFont }}>Corporate Business section being compiled...</div>
          )}
        </div>
      </motion.div>
    );
  };

  const pages = [
    { title: "Front Page", render: renderFrontPage },
    { title: "Markets", render: renderMarketsPage },
    { title: "Business & Economy", render: renderCombinedPage },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E5E5E5] overflow-y-auto w-full">
      {/* App Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#09090B] text-white p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg w-full">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono font-bold text-sm uppercase tracking-wider hover:text-[#C6FF00] transition-colors"
        >
          <ChevronLeft size={18} />
          Dashboard
        </button>
        
        {/* Newspaper Page Navigation Tabs */}
        {!isLoading && !error && news && (
          <div className="flex bg-white/10 rounded-full p-1 overflow-x-auto max-w-full">
            {pages.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                  currentPage === idx ? 'bg-[#FF2A85] text-white' : 'hover:bg-white/20 text-gray-300'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 hidden sm:flex">
          <div className={`flex items-center gap-2 text-[10px] font-mono uppercase bg-white/10 px-3 py-1.5 rounded-full ${isLive ? 'text-gray-300' : 'text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#C6FF00] animate-pulse' : 'bg-amber-400'}`}></span>
            {isLive ? 'Live • Updated just now' : "Showing yesterday's edition • updating soon"}
          </div>
          <button
            onClick={fetchLiveNews}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-[#C6FF00]" : ""} />
          </button>
        </div>
      </div>

      {/* Newspaper Container */}
      <div className="max-w-7xl mx-auto my-2 sm:my-8 px-2 sm:px-6 lg:px-8 w-full">
        <div 
          className="text-[#1A1A1A] w-full min-h-[400px] sm:min-h-[800px] max-h-[72vh] sm:max-h-none overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16 relative mx-auto transition-all rounded-sm shadow-2xl"
          style={{
            background: 'radial-gradient(circle, #FCFAF6 35%, #F4ECDC 75%, #E8D8BC 95%, #D4BE98 100%)',
            border: '8px solid #FCFAF6',
            boxShadow: 'inset 0 0 45px rgba(94, 66, 38, 0.22), 0 10px 40px rgba(40,25,10,0.2)'
          }}
        >
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] sm:h-[600px] gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#09090B]/20 border-t-[#09090B] rounded-full animate-[spin_1.5s_linear_infinite]"></div>
              <p className="font-mono font-bold tracking-widest uppercase text-xs sm:text-sm animate-pulse text-[#1A1A1A]">
                Printing Today's Edition...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] sm:h-[600px] gap-4 text-center border-4 border-dashed border-[#1A1A1A] p-6 sm:p-12 bg-[#F9F9F9]/50">
              <FileText size={36} className="text-[#1A1A1A]" />
              <h2 className="font-serif text-2xl sm:text-4xl font-bold uppercase tracking-wide">Late Edition</h2>
              <p className="font-typewriter italic max-w-md text-gray-700 text-sm sm:text-lg border-t border-b border-[#1A1A1A] py-3 sm:py-4 mt-2" style={{ fontFamily: typewriterFont }}>
                Today's edition is currently being prepared. The presses are running slightly behind. Please check back shortly.
              </p>
              <button
                onClick={fetchLiveNews}
                className="mt-4 sm:mt-6 px-6 py-2.5 sm:px-8 sm:py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] font-mono uppercase text-xs sm:text-sm font-bold tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                Refresh Edition
              </button>
            </div>
          ) : news ? (
            <div className="flex flex-col h-full justify-between">
              <AnimatePresence mode="wait">
                {pages[currentPage].render()}
              </AnimatePresence>
              
              {/* Footer Pagination Controls */}
              <div className="mt-8 sm:mt-16 pt-4 sm:pt-6 border-t-[2px] sm:border-t-[3px] border-[#1A1A1A] flex flex-col sm:flex-row gap-4 justify-between items-center font-mono text-xs sm:text-sm uppercase tracking-widest font-bold">
                <button 
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-2 ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#FF2A85] transition-colors'}`}
                >
                  <ChevronLeft size={16} /> Previous Page
                </button>
                <div className="text-gray-500">
                  Page {currentPage + 1} of {pages.length}
                </div>
                <button 
                  onClick={handleNext}
                  disabled={currentPage === pages.length - 1}
                  className={`flex items-center gap-2 ${currentPage === pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#FF2A85] transition-colors'}`}
                >
                  Next Page <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

