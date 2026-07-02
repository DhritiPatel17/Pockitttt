import React, { useState } from 'react';
import { Loader2, Camera, Check } from 'lucide-react';

interface ShareButtonProps {
  name: string;
  type: 'surplus' | 'streak' | 'plan';
  value: string;
  extra?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ name, type, value, extra = '', className = '' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

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

  const handleShare = async () => {
    setIsGenerating(true);
    setIsDone(false);

    try {
      // Create canvas for 1080x1920 Instagram Story size
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not supported');
      }

      // 1. Draw beautiful brand gradient background (Lime-Green to Soft Yellow)
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#C6FF00');
      grad.addColorStop(1, '#FEF08A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Draw sticker shadows (Solid offset dark boxes)
      // Main Card Shadow
      drawRoundedRect(ctx, 115, 185, 870, 1570, 60, '#09090B');
      
      // 3. Draw Main Card Body
      drawRoundedRect(ctx, 95, 165, 870, 1570, 60, '#FFFDF0', '#09090B', 14);

      // 4. Draw Header Brand Element
      ctx.fillStyle = '#09090B';
      ctx.font = 'bold 85px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('pockittt ✨', 540, 310);

      ctx.fillStyle = '#FF2A85';
      ctx.font = 'bold 45px sans-serif';
      ctx.fillText('YOUR POCKET-MONEY BESTIE', 540, 375);

      // Horizontal Divider Line
      ctx.beginPath();
      ctx.moveTo(170, 430);
      ctx.lineTo(910, 430);
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 8;
      ctx.stroke();

      // 5. User Headline text
      ctx.fillStyle = '#09090B';
      ctx.font = '80px sans-serif';
      ctx.fillText(`${name}'s`, 540, 560);
      
      ctx.fillStyle = '#09090B';
      ctx.font = 'bold 95px sans-serif';
      ctx.fillText('MONEY ERA 💸', 540, 675);

      // 6. Draw central spotlight sticker
      const stickerX = 180;
      const stickerY = 800;
      const stickerW = 720;
      const stickerH = 500;

      // Draw sticker shadow
      drawRoundedRect(ctx, stickerX + 20, stickerY + 20, stickerW, stickerH, 40, '#09090B');
      // Draw sticker background (bright lime-green for contrast)
      drawRoundedRect(ctx, stickerX, stickerY, stickerW, stickerH, 40, '#C6FF00', '#09090B', 12);

      // Content inside the spotlight sticker
      ctx.textAlign = 'center';
      ctx.fillStyle = '#09090B';
      
      if (type === 'surplus') {
        ctx.font = '900 35px monospace';
        ctx.fillText('MONTHLY SURPLUS 💰', 540, 890);
        
        ctx.font = '900 90px sans-serif';
        ctx.fillText(`₹${parseFloat(value).toLocaleString('en-IN')}`, 540, 1010);
        
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('left over for investments! 📈', 540, 1100);
        
        ctx.fillStyle = '#09090B';
        ctx.font = 'italic 34px sans-serif';
        ctx.fillText('making money babies daily 👶🍼', 540, 1220);
      } else if (type === 'streak') {
        ctx.font = '900 35px monospace';
        ctx.fillText('DAILY SAVINGS STREAK 🔥', 540, 890);
        
        ctx.font = '900 110px sans-serif';
        ctx.fillText(`${value} DAYS`, 540, 1020);
        
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText('consistently cooking! 🍳💻', 540, 1110);

        ctx.fillStyle = '#09090B';
        ctx.font = 'italic 34px sans-serif';
        ctx.fillText('financial discipline is in! 💅🏆', 540, 1220);
      } else { // plan
        ctx.font = '900 35px monospace';
        ctx.fillText('ROADMAP ACTIVE 🚀', 540, 885);
        
        ctx.font = 'bold 50px sans-serif';
        // Wrap text if goal description is too long
        const goalText = value.length > 20 ? value.substring(0, 18) + '...' : value;
        ctx.fillText(goalText, 540, 960);
        
        ctx.font = '900 70px sans-serif';
        ctx.fillText(`Goal: ${extra}`, 540, 1050);

        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('on track with automated logic', 540, 1110);

        ctx.fillStyle = '#09090B';
        ctx.font = 'italic 34px sans-serif';
        ctx.fillText('building a solid empire 🏰💎', 540, 1220);
      }

      // Decorative stars / hearts
      ctx.fillStyle = '#FF2A85';
      ctx.font = '60px sans-serif';
      ctx.fillText('✨', 240, 750);
      ctx.fillText('✨', 840, 1370);
      ctx.fillText('💖', 820, 520);
      ctx.fillText('🔥', 260, 1380);

      // 7. Draw Footer Banner
      ctx.fillStyle = '#09090B';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('made with pockittt ✨', 540, 1550);
      ctx.fillStyle = '#FF2A85';
      ctx.font = '32px monospace';
      ctx.fillText('track yours too @ pockittt.app', 540, 1610);

      // Trigger a brief 400ms delay to make it feel premium/authentic
      await new Promise((resolve) => setTimeout(resolve, 400));

      const dataUrl = canvas.toDataURL('image/png');

      // Native mobile sharing if supported
      if (navigator.share && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'pockittt_era.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'My pockittt Money Era!',
              text: 'Check out my savings and goal plans on pockittt! 💸🔥'
            });
            setIsDone(true);
            setTimeout(() => setIsDone(false), 2000);
            return;
          }
        } catch (shareErr) {
          console.log('Native sharing fallback:', shareErr);
        }
      }

      // Download fallback
      const link = document.createElement('a');
      link.download = `pockittt_era_${type}.png`;
      link.href = dataUrl;
      link.click();

      setIsDone(true);
      setTimeout(() => setIsDone(false), 2000);

    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isGenerating}
      className={`inline-flex items-center gap-1.5 border-4 border-[#09090B] rounded-full px-4 py-2 bg-[#FFFDF0] hover:bg-[#FFE853] text-[#09090B] font-display font-bold text-xs md:text-sm shadow-[3px_3px_0px_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#09090B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#FF2A85]" />
          <span>cooking up your card...</span>
        </>
      ) : isDone ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
          <span>card downloaded! 📸✨</span>
        </>
      ) : (
        <>
          <Camera className="w-4 h-4 text-[#FF2A85] stroke-[2.5px]" />
          <span>Share My Stats 📸</span>
        </>
      )}
    </button>
  );
};
