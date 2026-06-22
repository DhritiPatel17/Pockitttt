import { useState } from 'react';
import { motion } from 'motion/react';
import { moneyLingoChapters } from '../data/moneylingo';
import { chapterContent } from '../data/chapterContent';
import { ChevronLeft, BookOpenText } from 'lucide-react';

export function MoneyLingo() {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const chapter = moneyLingoChapters.find(c => c.id === activeChapter);
  const content = activeChapter ? chapterContent[activeChapter] : null;

  if (activeChapter && chapter) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 w-full max-w-lg mx-auto">
        <button
           onClick={() => setActiveChapter(null)}
           className="flex items-center gap-2 font-semibold text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Chapters
        </button>
        <div className="sticker-card p-6 !bg-[#FFD1DC] border-4 border-[#09090B]">
           <div className="text-sm font-display font-bold uppercase tracking-wider mb-2 text-[#09090B]/60">Chapter {chapter.chapter}</div>
           <div className="text-4xl mb-4">{chapter.emoji}</div>
           <h1 className="text-3xl font-display font-bold text-[#09090B]">{chapter.title}</h1>
           <p className="font-sans font-medium text-[#09090B] mt-2">{chapter.description}</p>
        </div>
        
        {content ? (
          <div className="space-y-4">
            {content.topics.map((topic, index) => (
              <div key={index} className="sticker-card p-6 bg-[#FEF08A] border-4 border-[#09090B] transform -rotate-1 hover:rotate-0 transition-transform duration-200">
                <h3 className="text-xl font-serif font-bold text-[#09090B] mb-2">{index + 1}. {topic.title}</h3>
                <p className="font-sans text-[#09090B]/80 mb-2"><strong>Simple Explanation:</strong> {topic.explanation}</p>
                <p className="font-sans text-[#09090B]/80 mb-2"><strong>Everyday Example:</strong> {topic.example}</p>
                <p className="font-sans text-[#09090B]/90 font-bold">Quick Takeaway: {topic.takeaway}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="sticker-card p-8 bg-[#FFFDF0] border-4 border-[#09090B] text-center text-[#09090B]/60 font-mono font-bold">
            Topics coming soon!
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-3">
         <BookOpenText className="w-8 h-8 text-[#FF2A85] stroke-[2.5px]" />
         <h2 className="text-3xl font-display font-bold text-[#09090B]">MoneyLingo 💸</h2>
      </div>
      <div className="grid gap-3">
        {moneyLingoChapters.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChapter(c.id)}
            className="sticker-card p-4 bg-[#FFFDF0] border-4 border-[#09090B] flex items-center gap-4 hover:bg-[#FEF08A] transition-all cursor-pointer shadow-[4px_4px_0px_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-left"
          >
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <div className="text-xs font-display font-bold uppercase tracking-wider text-[#09090B]/60">Chapter {c.chapter}</div>
                <h3 className="font-display font-bold text-lg text-[#09090B]">{c.title}</h3>
                <p className="font-sans text-xs text-[#09090B]/70">{c.description}</p>
              </div>
          </button>
        ))}
      </div>
    </div>
  );
}
