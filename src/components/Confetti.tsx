import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    // Generate 60 pieces of confetti
    const colors = ['#FF2A85', '#C6FF00', '#09090B', '#FEF08A', '#A855F7', '#3B82F6'];
    const newPieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage from left
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.2, // Small stagger
      duration: Math.random() * 1.5 + 2, // 2 to 3.5 seconds to fall
      rotate: Math.random() * 360,
      rotateEnd: Math.random() * 720 + 360,
      scale: Math.random() * 0.5 + 0.5,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000); // Remove after longest duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              y: -20, 
              x: `${p.x}vw`, 
              rotate: p.rotate, 
              scale: p.scale, 
              opacity: 1 
            }}
            animate={{ 
              y: ['0vh', '100vh'],
              rotate: p.rotateEnd,
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              ease: 'easeOut',
              times: [0, 0.8, 1]
            }}
            className="absolute top-0 w-3 h-3"
            style={{ 
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              border: p.color === '#09090B' ? 'none' : '2px solid #09090B'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
