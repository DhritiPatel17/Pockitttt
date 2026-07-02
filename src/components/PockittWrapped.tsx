import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Sparkles, Volume2, Music, Shuffle, Share2, Camera, Check, Loader2 } from 'lucide-react';
import { UserProfile, MoneyCheckIn } from '../types';
import { getMoneyPersonality, MoneyPersonality } from '../data/moneyPersonalities';
import { songLibrary, getRandomSongForUser, Song } from '../data/songLibrary';
import { audioPlayer } from '../utils/audioPlayer';

const AudioWaveform: React.FC<{ color?: string }> = ({ color = 'bg-[#FF2A85]' }) => {
  return (
    <div className="flex items-end justify-center gap-[3px] h-6 select-none" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((bar) => (
        <motion.div
          key={bar}
          className={`w-[4px] ${color} rounded-full`}
          animate={{
            height: ["20%", "100%", "20%"]
          }}
          transition={{
            duration: 0.5 + bar * 0.12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originY: 1 }}
        />
      ))}
    </div>
  );
};

interface PockittWrappedProps {
  profile: UserProfile;
  checkIn: MoneyCheckIn | null;
  streakCount: number;
  onClose: () => void;
}

const slideBackgrounds = [
  'bg-gradient-to-br from-[#E8DFF5] to-[#FDE2E4]', // Soft lavender to soft pink
  'bg-gradient-to-br from-[#FDE2E4] to-[#FFE8D6]', // Soft pink to soft peach
  'bg-gradient-to-br from-[#FFE8D6] to-[#DDF3E4]', // Soft peach to soft mint
  'bg-gradient-to-br from-[#DDF3E4] to-[#DCEEFB]', // Soft mint to soft sky blue
  'bg-gradient-to-br from-[#DCEEFB] to-[#E8DFF5]', // Soft sky blue to soft lavender
];

const textColors = [
  'text-[#2E2E2E]',
  'text-[#2E2E2E]',
  'text-[#2E2E2E]',
  'text-[#2E2E2E]',
  'text-[#2E2E2E]',
];

export const PockittWrapped: React.FC<PockittWrappedProps> = ({
  profile,
  checkIn,
  streakCount,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [remixSeed, setRemixSeed] = useState(0);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isDoneShare, setIsDoneShare] = useState(false);

  // Swipe gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Audio system state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Derive metrics
  const monthlySavings = checkIn ? Math.max(0, checkIn.monthlyIncome - checkIn.monthlySpend) : 0;
  const savingsPercent = checkIn && checkIn.monthlyIncome > 0 ? (monthlySavings / checkIn.monthlyIncome) * 100 : 0;
  
  // Custom states for interactive elements
  const [counterValue, setCounterValue] = useState(0);

  // Get current personality
  const personality = getMoneyPersonality(savingsPercent, profile.role, profile.age, streakCount);

  // State for the selected song to ensure single source of truth
  const [song, setSong] = useState<Song>(() => {
    const bracket = savingsPercent >= 30 ? "high" : savingsPercent >= 10 ? "medium" : savingsPercent >= 0 ? "low" : "negative";
    const matchingSongs = songLibrary.filter(s => s.savingsBracket === bracket);
    return matchingSongs[0] || songLibrary[0];
  });

  // Keep selected song in sync with savingsPercent and remixSeed
  useEffect(() => {
    const bracket = savingsPercent >= 30 ? "high" : savingsPercent >= 10 ? "medium" : savingsPercent >= 0 ? "low" : "negative";
    const matchingSongs = songLibrary.filter(s => s.savingsBracket === bracket);
    const songIndex = remixSeed % (matchingSongs.length || 1);
    setSong(matchingSongs[songIndex] || songLibrary[0]);
  }, [savingsPercent, remixSeed]);

  // 1. Audio Playback Control - Only triggered when the active song changes
  useEffect(() => {
    setIsAudioLoading(true);
    audioPlayer.play(song)
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        setIsAudioLoading(false);
      })
      .catch(err => {
        console.log("Autoplay policy deferred play state:", err);
        setIsPlaying(false);
        setAutoplayBlocked(true);
        setIsAudioLoading(false);
      });
  }, [song]);

  // 2. Adjust volume based on current active slide (soften on final recap slide)
  useEffect(() => {
    if (currentSlide === 4) {
      audioPlayer.setVolume(0.3);
    } else {
      audioPlayer.setVolume(0.8);
    }
  }, [currentSlide]);

  // Stop music on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  const togglePlayPause = () => {
    audioPlayer.togglePlay();
    const state = audioPlayer.getState();
    setIsPlaying(state.isPlaying);
    setAutoplayBlocked(false);
  };

  // Animated counter for Slide 2
  useEffect(() => {
    if (currentSlide === 1) {
      setCounterValue(0);
      let start = 0;
      const end = monthlySavings;
      if (end === 0) return;
      
      const duration = 1500; // 1.5s
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.floor(easeProgress * end);
        
        setCounterValue(currentVal);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCounterValue(end);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentSlide, monthlySavings]);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Auto-advance logic for slide 1 and slide 2
  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => {
        handleNext();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentSlide === 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 3500); // give 3.5s to see the full count-up and the headline
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 4) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleRemix = () => {
    setRemixSeed(prev => prev + 1);
  };

  // Slides configuration
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }
    })
  };

  // Headline for Slide 2
  const getHeadlineCopy = () => {
    if (savingsPercent <= 0) {
      return "you spent everything (and more!) this month 💀";
    } else if (savingsPercent < 10) {
      return `you saved ₹${monthlySavings.toLocaleString('en-IN')} this month... every rupee counts! 🌱`;
    } else if (savingsPercent < 30) {
      return `you secretly saved ₹${monthlySavings.toLocaleString('en-IN')} this month 👁️`;
    } else {
      return `you absolutely stacked ₹${monthlySavings.toLocaleString('en-IN')} this month! 👑💰`;
    }
  };

  // Sign-off options for the final slide
  const signOffLines = [
    "pockittt knows the assignment 💸",
    "main character finance app fr fr ✨",
    "building my empire one coin at a time 🏰"
  ];
  const signOff = signOffLines[remixSeed % signOffLines.length];

  // Helper for rounded rect canvas drawing
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    lineWidth?: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor && lineWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  // Canvas drawing for premium wrapped card export
  const handleShareWrappedCard = async () => {
    setIsGeneratingShare(true);
    setIsDoneShare(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not supported');
      }

      // 1. Soft Pastel Background + Radial Gradient for depth
      ctx.fillStyle = '#FAF9F6'; // Premium soft cream background
      ctx.fillRect(0, 0, 1080, 1920);

      // Soft pastel lavender & mint background splashes
      const radial1 = ctx.createRadialGradient(200, 400, 50, 200, 400, 800);
      radial1.addColorStop(0, 'rgba(232, 223, 245, 0.6)');
      radial1.addColorStop(1, 'rgba(250, 249, 246, 0)');
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, 1080, 1920);

      const radial2 = ctx.createRadialGradient(880, 1400, 50, 880, 1400, 800);
      radial2.addColorStop(0, 'rgba(221, 243, 228, 0.7)');
      radial2.addColorStop(1, 'rgba(250, 249, 246, 0)');
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, 1080, 1920);

      // Outer Sticker Border (Brutalist style card frame with charcoal stroke)
      drawRoundedRect(ctx, 80, 120, 920, 1680, 60, undefined, '#2E2E2E', 12);

      // Header Brand Element
      ctx.fillStyle = '#8C349C';
      ctx.font = '900 85px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('pockittt 🎧', 540, 260);

      ctx.fillStyle = '#BF4F83';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('MY WRAPPED ERA • 2026', 540, 325);

      // Divider
      ctx.beginPath();
      ctx.moveTo(180, 370);
      ctx.lineTo(900, 370);
      ctx.strokeStyle = '#2E2E2E';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Greeting
      ctx.fillStyle = '#2E2E2E';
      ctx.font = 'bold 70px sans-serif';
      ctx.fillText(`${profile.name}'s Money Vibe`, 540, 480);

      // Card 1: The Surplus Number
      const card1X = 140;
      const card1Y = 560;
      const card1W = 800;
      const card1H = 280;
      drawRoundedRect(ctx, card1X + 12, card1Y + 12, card1W, card1H, 40, 'rgba(46,46,46,0.08)'); // shadow
      drawRoundedRect(ctx, card1X, card1Y, card1W, card1H, 40, '#FDE2E4', '#2E2E2E', 6); // body (soft pink/blush)
      
      ctx.fillStyle = '#2E2E2E';
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MONTHLY STASH', card1X + 50, card1Y + 70);
      ctx.font = '900 85px sans-serif';
      ctx.fillText(`₹${monthlySavings.toLocaleString('en-IN')}`, card1X + 50, card1Y + 175);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`${savingsPercent.toFixed(0)}% of pocket money saved!`, card1X + 50, card1Y + 235);

      // Card 2: The Personality Card
      const card2Y = 880;
      const card2H = 340;
      drawRoundedRect(ctx, card1X + 12, card2Y + 12, card1W, card2H, 40, 'rgba(46,46,46,0.08)'); // shadow
      drawRoundedRect(ctx, card1X, card2Y, card1W, card2H, 40, '#DDF3E4', '#2E2E2E', 6); // body (soft mint)

      ctx.fillStyle = '#2E2E2E';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('MONEY ARCHETYPE', card1X + 50, card2Y + 70);
      ctx.font = '900 60px sans-serif';
      ctx.fillText(`${personality.emoji} ${personality.title}`, card1X + 50, card2Y + 155);
      
      // Wrap description text
      ctx.font = 'bold 28px sans-serif';
      const words = personality.descriptionTemplate.split(' ');
      let line = '';
      let currentY = card2Y + 225;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 700 && n > 0) {
          ctx.fillText(line, card1X + 50, currentY);
          line = words[n] + ' ';
          currentY += 40;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, card1X + 50, currentY);

      // Card 3: Soundtrack Card
      const card3Y = 1260;
      const card3H = 260;
      drawRoundedRect(ctx, card1X + 12, card3Y + 12, card1W, card3H, 40, 'rgba(46,46,46,0.08)'); // shadow
      drawRoundedRect(ctx, card1X, card3Y, card1W, card3H, 40, '#E8DFF5', '#2E2E2E', 6); // body (soft lavender)

      ctx.fillStyle = '#2E2E2E';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('ERA SOUNDTRACK', card1X + 50, card3Y + 70);
      ctx.font = '900 50px sans-serif';
      ctx.fillText(`🎧 ${song.title}`, card1X + 50, card3Y + 150);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`by ${song.artist}`, card1X + 50, card3Y + 210);

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8C349C';
      ctx.font = 'italic 34px sans-serif';
      ctx.fillText(signOff, 540, 1620);

      ctx.fillStyle = 'rgba(46, 46, 46, 0.6)';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('join the movement @ pockittt.app', 540, 1675);

      // Wait a tiny bit for render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = canvas.toDataURL('image/png');

      // Native Share or download fallback
      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'pockittt_wrapped.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${profile.name}'s Pockittt Wrapped!`,
              text: `Just found out my pocket-money personality is ${personality.title}! Check yours on pockittt 💸🎧`
            });
            setIsDoneShare(true);
            setTimeout(() => setIsDoneShare(false), 2000);
            return;
          }
        } catch (shareErr) {
          console.log('Native sharing fallback:', shareErr);
        }
      }

      // Download Fallback
      const link = document.createElement('a');
      link.download = `${profile.name}_pockittt_wrapped_2026.png`;
      link.href = dataUrl;
      link.click();

      setIsDoneShare(true);
      setTimeout(() => setIsDoneShare(false), 2000);

    } catch (err) {
      console.error('Error generating wrapped card:', err);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between p-3 xs:p-4 sm:p-6 bg-[#FAF9F5] touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* ProgressBar Header (Instagram Stories style, light theme adapted) */}
      <div className="w-full max-w-xl mx-auto flex gap-1.5 pt-1.5 sm:pt-2 z-10">
        {[0, 1, 2, 3, 4].map((index) => {
          let progress = 0;
          if (index < currentSlide) {
            progress = 100;
          } else if (index === currentSlide) {
            progress = 100;
          }
          return (
            <div 
              key={index} 
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className="h-1 sm:h-1.5 flex-1 bg-[#2E2E2E]/10 rounded-full overflow-hidden cursor-pointer"
            >
              <motion.div 
                className="h-full bg-[#2E2E2E] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          );
        })}
      </div>

      {/* Close button top right (Light theme style) */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 bg-white/80 hover:bg-white text-[#2E2E2E] rounded-full transition-all border border-black/10 hover:border-black/30 cursor-pointer z-50 focus:outline-none shadow-sm"
        title="Exit Wrapped"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5px]" />
      </button>

      {/* Slide Container with bidirectional sliding transitions */}
      <div className="flex-1 w-full max-w-xl mx-auto flex items-center justify-center relative mt-0.5 xs:mt-2 sm:mt-4 h-[calc(100dvh-100px)] sm:h-[680px] max-h-[350px] xs:max-h-[420px] sm:max-h-[680px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`w-full h-full max-h-[720px] rounded-[24px] sm:rounded-[40px] border-4 sm:border-8 border-[#2E2E2E] shadow-[4px_4px_0px_0px_rgba(46,46,46,0.15)] sm:shadow-[8px_8px_0px_0px_rgba(46,46,46,0.15)] flex flex-col justify-between p-2.5 xs:p-4 sm:p-8 md:p-10 relative overflow-hidden ${slideBackgrounds[currentSlide]} ${textColors[currentSlide]}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            
            {/* Top Badge Overlay */}
            <div className="flex justify-between items-center w-full z-10">
              <span className="font-mono text-[9px] xs:text-xs uppercase font-black px-2 py-0.5 sm:px-3 sm:py-1 bg-[#2E2E2E]/10 rounded-full backdrop-blur-xs">
                pockittt wrapped • 2026
              </span>
              <button
                onClick={togglePlayPause}
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-[#2E2E2E]/10 hover:bg-[#2E2E2E]/20 rounded-full border border-[#2E2E2E]/10 transition-colors focus:outline-none cursor-pointer"
              >
                {isAudioLoading ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-spin text-current" />
                    <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider">LOADING</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Volume2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-bounce text-[#BF4F83]" />
                    <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider">PLAYING</span>
                  </>
                ) : (
                  <>
                    <Music className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-current/60" />
                    <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider text-current/60">MUTED</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Content Areas based on current slide */}
            <div className="my-auto flex flex-col items-center text-center justify-center py-1 sm:py-6 w-full overflow-y-auto max-h-[calc(100%-60px)] scrollbar-none">
              
              {/* SLIDE 1 — Cold open */}
              {currentSlide === 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1.5 xs:space-y-3 sm:space-y-6 w-full"
                >
                  <div className="w-10 h-10 xs:w-14 xs:h-14 sm:w-20 sm:h-20 bg-[#E5B3D5] border-4 border-[#2E2E2E] rounded-xl sm:rounded-3xl flex items-center justify-center shadow-[3px_3px_0px_#2E2E2E] sm:shadow-[4px_4px_0px_#2E2E2E] mx-auto transform -rotate-6">
                    <Music className="w-5 h-5 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-[#2E2E2E]" />
                  </div>
                  <h2 className="text-base xs:text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-center text-[#2E2E2E]">
                    {profile.name}, your <span className="text-[#BF4F83] font-black">money era</span> is about to be revealed 👀✨
                  </h2>
                  <p className="text-[9px] xs:text-[11px] sm:text-sm font-mono text-[#2E2E2E]/80 max-w-xs mx-auto px-2">
                    your money moved different this year fr. let's see if you're a certified stacker or a master splurger 👁️
                  </p>
                  <button
                    onClick={handleNext}
                    className="mt-1 xs:mt-2 sm:mt-4 px-3 py-1.5 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 bg-[#DDF3E4] text-[#2E2E2E] border-4 border-[#2E2E2E] rounded-lg xs:rounded-xl sm:rounded-2xl font-bold hover:bg-[#cbf0d5] hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#2E2E2E] sm:shadow-[4px_4px_0px_#2E2E2E] transition-all text-xs xs:text-sm sm:text-base cursor-pointer min-h-[32px] xs:min-h-[40px]"
                  >
                    Tap to begin 🚀
                  </button>
                </motion.div>
              )}

              {/* SLIDE 2 — Number Reveal */}
              {currentSlide === 1 && (
                <div className="space-y-1.5 xs:space-y-3.5 sm:space-y-6 w-full px-2">
                  <span className="text-[9px] xs:text-xs sm:text-sm font-mono uppercase font-black bg-[#2E2E2E]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[#2E2E2E] inline-block">
                    THE HARD NUMBERS 🪙
                  </span>
                  <div className="space-y-0.5 sm:space-y-2">
                    <h3 className="text-[9px] xs:text-xs sm:text-sm font-mono uppercase tracking-widest text-[#2E2E2E]/80 font-bold">
                      no cap, you saved...
                    </h3>
                    <div className="text-xl xs:text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#2E2E2E] break-all leading-none">
                      ₹{counterValue.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[9px] xs:text-xs sm:text-sm font-mono text-[#2E2E2E]/60 uppercase tracking-wider font-bold">
                      this month 👁️
                    </p>
                  </div>
                  <p className="text-xs xs:text-base sm:text-xl md:text-2xl font-bold leading-tight max-w-sm mx-auto text-[#2E2E2E]">
                    "{getHeadlineCopy()}"
                  </p>
                  <p className="text-[9px] xs:text-xs sm:text-sm font-mono text-[#2E2E2E]/60">
                    Calculated from ₹{checkIn?.monthlyIncome.toLocaleString('en-IN')}/mo allowance
                  </p>
                </div>
              )}

              {/* SLIDE 3 — Personality Badge */}
              {currentSlide === 2 && (
                <div className="space-y-1.5 xs:space-y-3.5 sm:space-y-6 w-full text-[#2E2E2E] px-2">
                  <span className="text-[9px] xs:text-xs sm:text-sm font-mono uppercase font-black bg-[#2E2E2E]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[#2E2E2E] inline-block">
                    certified savings behavior fr 🎭
                  </span>
                  
                  <div className="space-y-0.5 sm:space-y-4">
                    <div className="text-3xl xs:text-4xl sm:text-7xl transform hover:scale-110 transition-transform duration-300">
                      {personality.emoji}
                    </div>
                    <h2 className="text-base xs:text-lg sm:text-2xl md:text-4xl font-black tracking-tight leading-none uppercase text-[#2E2E2E]">
                      {personality.title}
                    </h2>
                  </div>

                  <p className="text-[10px] xs:text-[11px] sm:text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto text-[#2E2E2E]/90 font-sans px-2 line-clamp-3 xs:line-clamp-none">
                    {personality.descriptionTemplate}
                  </p>

                  <div className="pt-0 sm:pt-2">
                    <button
                      onClick={togglePlayPause}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-4 sm:py-2 bg-[#2E2E2E]/10 hover:bg-[#2E2E2E]/20 rounded-full border border-[#2E2E2E]/10 transition-all font-mono text-[9px] xs:text-xs sm:text-sm font-bold cursor-pointer animate-pulse min-h-[28px] xs:min-h-[36px]"
                    >
                      {isPlaying ? (
                        <>
                          <Volume2 className="w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 animate-bounce" />
                          <span>PAUSE TRACK</span>
                        </>
                      ) : (
                        <>
                          <Music className="w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                          <span>PLAY MUSIC 🎵</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 4 — Sound track */}
              {currentSlide === 3 && (
                <div className="space-y-1.5 xs:space-y-3.5 sm:space-y-6 w-full text-[#2E2E2E] px-2">
                  <span className="text-[9px] xs:text-xs sm:text-sm font-mono uppercase font-black bg-[#2E2E2E]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[#2E2E2E] tracking-wider inline-block">
                    🎧 CURRENT VIBE & ANTHEM
                  </span>

                  <div className="relative mx-auto flex flex-col items-center justify-center">
                    <div className={`relative w-14 h-14 xs:w-18 xs:h-18 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-[#3D3D3D] border-4 border-[#2E2E2E] rounded-full flex items-center justify-center shadow-[3px_3px_0px_#2E2E2E] sm:shadow-[6px_6px_0px_#2E2E2E] ${isPlaying ? 'animate-spin [animation-duration:12s]' : ''}`}>
                      <div className="w-5 h-5 xs:w-7 xs:h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-[#FEF08A] rounded-full border-2 border-[#2E2E2E] flex items-center justify-center z-10">
                        <button
                          onClick={togglePlayPause}
                          className="w-4 h-4 xs:w-5 xs:h-5 sm:w-9 sm:h-9 bg-[#2E2E2E] hover:bg-[#BF4F83] text-white rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                          title={isPlaying ? "Pause Track" : "Play Track"}
                        >
                          {isPlaying ? (
                            <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-3 sm:h-3 bg-white rounded-xs" />
                          ) : (
                            <div className="w-0 h-0 border-t-2 border-t-transparent border-l-3.5 border-l-white border-b-2 border-b-transparent ml-0.5 sm:border-t-5 sm:border-l-8 sm:border-b-5 sm:ml-1" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5 sm:space-y-2">
                    <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-none text-[#2E2E2E]">
                      {song.title}
                    </h2>
                    <p className="text-[9px] xs:text-xs sm:text-sm font-mono text-[#2E2E2E]/70 uppercase tracking-widest font-bold">
                      by {song.artist}
                    </p>
                    {isPlaying ? (
                      <AudioWaveform color="bg-[#BF4F83]" />
                    ) : isAudioLoading ? (
                      <div className="flex justify-center items-center h-4 sm:h-6">
                        <Loader2 className="w-3 animate-spin text-[#BF4F83]" />
                      </div>
                    ) : (
                      <div className="h-4 sm:h-6" />
                    )}
                  </div>

                  <p className="text-[9px] xs:text-xs sm:text-sm font-mono text-[#2E2E2E]/50 italic max-w-xs mx-auto">
                    The absolute anthem to match your {savingsPercent.toFixed(0)}% saving style {song.emoji}
                  </p>
                </div>
              )}

              {/* SLIDE 5 — Share Card */}
              {currentSlide === 4 && (
                <div className="space-y-1 xs:space-y-1.5 sm:space-y-5 w-full text-center px-1">
                  <span className="text-[9px] xs:text-xs sm:text-sm font-mono uppercase font-black bg-[#2E2E2E]/10 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full text-[#BF4F83] tracking-wider inline-block">
                    RECAP & EXPORT 📸
                  </span>

                  {/* Aesthetic Mini Recap Card */}
                  <div className="bg-[#FFFDF0] text-[#2E2E2E] border-4 border-[#2E2E2E] rounded-xl sm:rounded-3xl p-1.5 xs:p-2.5 sm:p-6 shadow-[3px_3px_0px_#DDF3E4] sm:shadow-[6px_6px_0px_#DDF3E4] text-left space-y-1 xs:space-y-1.5 sm:space-y-4 max-w-sm mx-auto w-full">
                    <div className="flex justify-between items-center border-b border-[#2E2E2E]/10 pb-0.5 xs:pb-1">
                      <span className="text-[8px] xs:text-[10px] sm:text-xs font-mono font-bold text-slate-500 uppercase tracking-widest font-sans">pockittt wrapped</span>
                      <span className="text-[8px] xs:text-[10px] sm:text-xs font-mono font-bold text-[#BF4F83] font-sans">2026</span>
                    </div>

                    <div className="space-y-1 xs:space-y-1.5 sm:space-y-4 font-sans text-[9px] xs:text-xs sm:text-sm">
                      <div>
                        <span className="block text-[7.5px] xs:text-[9px] sm:text-[11px] font-mono text-slate-400 font-bold uppercase leading-none mb-0.5 xs:mb-1">no cap, you saved</span>
                        <span className="text-sm xs:text-xl sm:text-3xl font-black tracking-tight leading-none">₹{monthlySavings.toLocaleString('en-IN')}</span>
                      </div>

                      <div>
                        <span className="block text-[7.5px] xs:text-[9px] sm:text-[11px] font-mono text-slate-400 font-bold uppercase leading-none mb-0.5 xs:mb-1">money aura style</span>
                        <span className="text-xs xs:text-sm sm:text-base font-extrabold">{personality.emoji} {personality.title}</span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="block text-[7.5px] xs:text-[9px] sm:text-[11px] font-mono text-slate-400 font-bold uppercase leading-none mb-0.5 xs:mb-1">your anthem</span>
                          <span className="text-[9.5px] xs:text-xs sm:text-sm font-bold text-[#BF4F83] block truncate max-w-[130px] xs:max-w-[220px]">🎧 {song.title}</span>
                          <span className="block text-[7px] xs:text-[9px] text-slate-500 truncate max-w-[130px] xs:max-w-[220px]">{song.artist}</span>
                        </div>
                        {isPlaying && (
                          <div className="pb-0.5">
                            <AudioWaveform color="bg-[#BF4F83]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button row */}
                  <div className="flex flex-col gap-1 xs:gap-1.5 sm:gap-2.5 max-w-xs mx-auto mt-0.5 xs:mt-1">
                    <button
                      onClick={handleShareWrappedCard}
                      disabled={isGeneratingShare}
                      className="w-full inline-flex items-center justify-center gap-1 border-4 border-[#2E2E2E] rounded-lg xs:rounded-xl sm:rounded-2xl py-1 xs:py-1.5 sm:py-3 bg-[#DCEEFB] text-[#2E2E2E] font-display font-bold text-[8.5px] xs:text-xs sm:text-sm shadow-[2px_2px_0px_#2E2E2E] sm:shadow-[4px_4px_0px_#2E2E2E] hover:bg-[#c3e1fa] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#2E2E2E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer min-h-[26px] xs:min-h-[38px] sm:min-h-[44px]"
                    >
                      {isGeneratingShare ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 animate-spin text-[#BF4F83]" />
                          <span>Generating Card...</span>
                        </>
                      ) : isDoneShare ? (
                        <>
                          <Check className="w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 text-[#2E2E2E] stroke-[3px]" />
                          <span>Saved to Gallery! 📸</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 stroke-[2.5px]" />
                          <span>Save & Share Wrapped</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRemix}
                      className="w-full inline-flex items-center justify-center gap-1 xs:gap-1.5 border-4 border-[#2E2E2E] rounded-lg xs:rounded-xl sm:rounded-2xl py-0.5 xs:py-1 sm:py-2.5 bg-[#FFE8D6] text-[#2E2E2E] font-display font-bold text-[8.5px] xs:text-xs sm:text-sm shadow-[2px_2px_0px_#2E2E2E] sm:shadow-[4px_4px_0px_#2E2E2E] hover:bg-[#ffd9be] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer min-h-[26px] xs:min-h-[38px] sm:min-h-[44px]"
                    >
                      <Shuffle className="w-2 xs:w-3 h-2 xs:h-3" />
                      <span>Remix Personality Vibe 🔀</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation controls */}
            <div className="flex justify-between items-center pt-2 sm:pt-4 border-t border-current/10 w-full z-10">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase font-black tracking-wider opacity-80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:underline min-h-[44px] min-w-[44px] px-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="text-xs font-mono font-black tracking-widest text-center flex-1">
                {currentSlide + 1} / 5
              </div>

              {currentSlide < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase font-black tracking-wider opacity-80 cursor-pointer hover:underline min-h-[44px] min-w-[44px] px-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase font-black tracking-wider text-[#BF4F83] hover:underline cursor-pointer min-h-[44px] min-w-[44px] px-2 font-bold"
                >
                  <span>Done ✨</span>
                </button>
              )}
            </div>

            {/* Subtle overlay decorative watermark */}
            <div className="absolute -bottom-8 -right-8 text-9xl font-black opacity-[0.03] select-none pointer-events-none transform -rotate-12">
              PKT
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Autoplay blocked fallback floating badge */}
      {autoplayBlocked && (
        <button
          onClick={togglePlayPause}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 bg-[#2E2E2E] text-white border-2 border-[#DCEEFB] rounded-full text-xs font-mono tracking-wider animate-pulse z-40 shadow-[4px_4px_0px_rgba(46,46,46,0.3)]"
        >
          <Music className="w-4 h-4 animate-bounce text-[#FEF08A]" />
          <span>TAP TO ACTIVATE SOUNDTRACK 🎧</span>
        </button>
      )}

      {/* Floating Bottom branding lines */}
      <div className="w-full text-center pb-2 z-10 text-[#2E2E2E]/50 font-mono text-[9px] uppercase tracking-wider mt-2 font-medium">
        {signOff}
      </div>

    </div>
  );
};
