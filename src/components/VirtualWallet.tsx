import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Camera, Lock, Unlock, Plus, Trash2, Calendar, 
  Check, FileText, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MoneyCheckIn } from '../types';

interface VirtualWalletProps {
  checkIn: MoneyCheckIn | null;
  profile: UserProfile | null;
}

interface StickyNote {
  id: string;
  text: string;
  isSettled: boolean;
  color: string;
}

const SKIN_THEMES: Record<string, {
  bg: string;
  text: string;
  secText: string;
  stitching: string;
  thicknessL1: string;
  thicknessL2: string;
  claspLayer: string;
  claspDot: string;
  pillBg: string;
  pillText: string;
  pulseColor: string;
  title: string;
}> = {
  'leather-brown': {
    bg: 'bg-gradient-to-br from-[#7c2d12] to-[#451a03] text-[#fef3c7] border-[#854d0e]',
    text: 'text-[#fef3c7]',
    secText: 'text-[#fef3c7]/70',
    stitching: 'border-white/20',
    thicknessL1: 'bg-amber-950',
    thicknessL2: 'bg-yellow-950',
    claspLayer: 'bg-[#451a03] border-white/25',
    claspDot: 'bg-[#c6ff00]',
    pillBg: 'bg-black/45',
    pillText: 'text-emerald-300',
    pulseColor: 'bg-emerald-400',
    title: 'Leather Brown 🪵',
  },
  'leather-black': {
    bg: 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-white border-zinc-700',
    text: 'text-white',
    secText: 'text-zinc-300/60',
    stitching: 'border-white/10',
    thicknessL1: 'bg-zinc-900',
    thicknessL2: 'bg-zinc-800',
    claspLayer: 'bg-zinc-900 border-white/15',
    claspDot: 'bg-[#c6ff00]',
    pillBg: 'bg-zinc-800/85',
    pillText: 'text-emerald-300',
    pulseColor: 'bg-emerald-400',
    title: 'Leather Black 🔲',
  },
  'wine-maroon': {
    bg: 'bg-gradient-to-br from-[#4c0519] to-[#1e0008] text-[#ffe4e6] border-[#881337]',
    text: 'text-[#ffe4e6]',
    secText: 'text-rose-300/60',
    stitching: 'border-white/15',
    thicknessL1: 'bg-[#2e000c]',
    thicknessL2: 'bg-[#1e0008]',
    claspLayer: 'bg-[#4c0519] border-white/20',
    claspDot: 'bg-[#fb7185]',
    pillBg: 'bg-black/40',
    pillText: 'text-rose-200',
    pulseColor: 'bg-rose-400',
    title: 'Wine Red & Maroon 🍷',
  },
  'peach-coral': {
    bg: 'bg-[#E36A6A] border-[#c05151] text-[#FFF2D0]',
    text: 'text-[#FFF2D0]',
    secText: 'text-[#FFF2D0]/80',
    stitching: 'border-[#FFF2D0]/30',
    thicknessL1: 'bg-[#c05151]',
    thicknessL2: 'bg-[#963737]',
    claspLayer: 'bg-[#c05151] border-[#FFF2D0]/20',
    claspDot: 'bg-[#FFF2D0]',
    pillBg: 'bg-black/25',
    pillText: 'text-[#FFF2D0] font-bold border border-white/10',
    pulseColor: 'bg-[#FFF2D0]',
    title: 'Coral Peach 🍑',
  },
  'polka-white': {
    bg: 'bg-[#FAFAFA] border-[#D4D4D8] text-zinc-900',
    text: 'text-zinc-900 font-extrabold',
    secText: 'text-zinc-700/80 font-bold',
    stitching: 'border-zinc-400/50',
    thicknessL1: 'bg-[#E4E4E7]',
    thicknessL2: 'bg-[#D4D4D8]',
    claspLayer: 'bg-zinc-200/90 border-zinc-300',
    claspDot: 'bg-zinc-950',
    pillBg: 'bg-zinc-900 text-white border border-zinc-850',
    pillText: 'text-white font-bold',
    pulseColor: 'bg-emerald-500',
    title: 'Polka Dot White ⚪',
  },
  'pistachio-lemon': {
    bg: 'bg-[#A0D585] border-[#7ab35e] text-emerald-950 font-medium',
    text: 'text-emerald-950 font-bold',
    secText: 'text-emerald-950/70',
    stitching: 'border-emerald-900/20',
    thicknessL1: 'bg-[#7ab35e]',
    thicknessL2: 'bg-[#609247]',
    claspLayer: 'bg-[#7ab35e] border-emerald-950/20',
    claspDot: 'bg-[#EEFABD]',
    pillBg: 'bg-[#EEFABD] text-emerald-950 border border-emerald-900/15',
    pillText: 'text-emerald-950 font-bold',
    pulseColor: 'bg-emerald-900',
    title: 'Pistachio Mint 🌿',
  },
  'cheetah-print': {
    bg: "bg-[#DABF9F] border-[#8C653F] text-zinc-950 font-bold",
    text: 'text-zinc-950 font-bold',
    secText: 'text-zinc-900/75 font-black',
    stitching: 'border-amber-950/30',
    thicknessL1: 'bg-[#8C653F]',
    thicknessL2: 'bg-[#66492F]',
    claspLayer: 'bg-black/85 border-amber-950/35',
    claspDot: 'bg-amber-400',
    pillBg: 'bg-black/95 text-amber-500 border border-amber-500/20',
    pillText: 'text-amber-500',
    pulseColor: 'bg-amber-400',
    title: 'Cheetah Print 🐆',
  }
};

export function VirtualWallet({ checkIn, profile }: VirtualWalletProps) {
  // --- Persistent States ---
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return localStorage.getItem('cashbox_wallet_is_open') === 'true';
  });

  const [walletSkin, setWalletSkin] = useState<string>(() => {
    return localStorage.getItem('cashbox_wallet_skin') || 'leather-brown';
  });

  const currentTheme = SKIN_THEMES[walletSkin] || SKIN_THEMES['leather-brown'];

  // 1. Cash on Hand
  const [cashOnHand, setCashOnHand] = useState<number>(() => {
    const saved = localStorage.getItem('cashbox_wallet_cash');
    return saved ? parseFloat(saved) : 5400;
  });
  const [isEditingCash, setIsEditingCash] = useState<boolean>(false);
  const [cashInputValue, setCashInputValue] = useState<string>(String(cashOnHand));

  // 2. Loved One's Photo
  const [photo, setPhoto] = useState<string>(() => {
    return localStorage.getItem('cashbox_wallet_photo') || '';
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // 3. Daily Expenses List
  const [expensesText, setExpensesText] = useState<string>(() => {
    const saved = localStorage.getItem('cashbox_wallet_expenses_list');
    return saved !== null ? saved : "- Coffee ₹150\n- Auto ₹50\n- Canteen Lunch ₹120";
  });

  // 5. Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem('cashbox_wallet_sticky_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StickyNote[];
        return parsed.map(n => {
          let updatedText = n.text;
          if (updatedText.includes('Rahul owes me')) {
            updatedText = updatedText.replace('Rahul owes me', 'I owe Dhriti');
          }
          if (updatedText.includes('Rahul')) {
            updatedText = updatedText.replace('Rahul', 'I owe Dhriti');
          }
          if (updatedText.includes('I owe Mom ₹2000 for college textbooks')) {
            updatedText = 'have to buy eggs before returning home';
          } else if (updatedText.includes('I owe Mom')) {
            updatedText = updatedText.replace('I owe Mom', 'have to buy eggs before returning home');
          }
          return { ...n, text: updatedText };
        });
      } catch {
        // fallback Below
      }
    }
    return [
      { id: 'note-1', text: 'I owe Dhriti ₹500 for canteen wrap spend', isSettled: false, color: 'bg-[#FEF08A] border-[#FDE047]' },
      { id: 'note-2', text: 'have to buy eggs before returning home', isSettled: false, color: 'bg-[#FECDD3] border-[#FDA4AF]' },
      { id: 'note-3', text: 'Settle auto fare with Sonal - ₹55', isSettled: true, color: 'bg-[#CFFAFE] border-[#67E8F9]' }
    ];
  });
  
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('bg-[#FEF08A] border-[#FDE047]');
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('cashbox_wallet_is_open', String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('cashbox_wallet_skin', walletSkin);
  }, [walletSkin]);

  useEffect(() => {
    localStorage.setItem('cashbox_wallet_cash', String(cashOnHand));
    setCashInputValue(String(cashOnHand));
  }, [cashOnHand]);

  useEffect(() => {
    localStorage.setItem('cashbox_wallet_photo', photo);
  }, [photo]);

  useEffect(() => {
    localStorage.setItem('cashbox_wallet_expenses_list', expensesText);
  }, [expensesText]);

  useEffect(() => {
    localStorage.setItem('cashbox_wallet_sticky_notes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  // --- Sticky Note action handlers ---
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      const newNote: StickyNote = {
        id: 'note-' + Date.now(),
        text: newNoteText.trim(),
        isSettled: false,
        color: newNoteColor
      };
      setStickyNotes(prev => [newNote, ...prev]);
      setNewNoteText('');
      setShowAddNoteForm(false);
    }
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStickyNotes(prev => prev.filter(n => n.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
    }
  };

  const handleToggleSettle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStickyNotes(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isSettled: !n.isSettled };
      }
      return n;
    }));
  };

  const handleStartEditNote = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveEditNote = (id: string) => {
    if (editingNoteText.trim()) {
      setStickyNotes(prev => prev.map(n => {
        if (n.id === id) {
          return { ...n, text: editingNoteText.trim() };
        }
        return n;
      }));
    }
    setEditingNoteId(null);
  };



  // --- Photo Slot handlers ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhoto(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhoto(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Cash Update Submit ---
  const handleCashUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cashInputValue);
    if (!isNaN(val) && val >= 0) {
      setCashOnHand(val);
      setIsEditingCash(false);
    }
  };



  // --- Savings Time Capsule Handlers ---
  // (Removed)

  return (
    <div className="w-full flex flex-col items-center py-4 text-center max-w-lg mx-auto px-4 font-sans">
      
      {/* Visual Header Selection */}
      <div className="mb-6 w-full select-none" id="wallet-skin-presets">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#09090B]/50 block mb-2">
          SELECT YOUR WALLET SKIN presets & textures
        </span>
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
          {Object.entries(SKIN_THEMES).map(([skinId, themeData]) => (
            <button
              key={skinId}
              type="button"
              onClick={() => setWalletSkin(skinId)}
              className={`text-[10px] font-mono font-bold py-1 px-2.5 rounded-full border-2 transition-all cursor-pointer ${
                walletSkin === skinId 
                  ? 'bg-[#09090B] border-[#09090B] text-white' 
                  : 'bg-white border-stone-200 text-[#09090B]/70 hover:bg-stone-50'
              }`}
            >
              {themeData.title}
            </button>
          ))}
        </div>
      </div>

      {/* Leather Wallet Container */}
      <div className="relative mb-8 w-full select-none flex justify-center">
        {/* Multilayer thickness visual effects behind the primary card container */}
        <div 
          className={`absolute inset-0 translate-y-2 translate-x-1.5 rounded-[18px] border-4 border-[#09090B] -z-10 ${currentTheme.thicknessL1}`}
          style={{ width: '100%', maxWidth: '100%' }}
        />
        <div 
          className={`absolute inset-0 translate-y-4 translate-x-3 rounded-[18px] border-4 border-[#09090B] -z-20 opacity-80 ${currentTheme.thicknessL2}`}
          style={{ width: '100%', maxWidth: '100%' }}
        />

        <motion.div 
          layout
          className={`w-[90vw] sm:w-[380px] md:w-[400px] max-w-full aspect-[1.6/1] duration-300 relative rounded-[18px] border-4 p-5 shadow-[5px_5px_0px_0px_#09090B] cursor-pointer flex flex-col justify-between overflow-hidden ${currentTheme.bg}`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          id="tactile-leather-wallet-cover"
        >
          {/* Leather Stitching lines top/bottom */}
          <div className={`absolute top-2 left-4 right-4 border-t-2 border-dashed ${currentTheme.stitching} select-none pointer-events-none z-10`}></div>
          <div className={`absolute bottom-2 left-4 right-4 border-b-2 border-dashed ${currentTheme.stitching} select-none pointer-events-none z-10`}></div>

          {/* SVG Pattern Overlays */}
          {walletSkin === 'polka-white' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="wallet-polka-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="2" fill="#09090b" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wallet-polka-dots)" />
            </svg>
          )}

          {walletSkin === 'cheetah-print' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.22]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="wallet-cheetah-pattern" width="150" height="150" patternUnits="userSpaceOnUse">
                  {/* Rosette 1 (Center: 35, 30) */}
                  <path d="M 25,30 C 23,20 37,18 40,24 C 43,30 35,36 30,34 C 27,33 26,31 25,30 Z" fill="#785338" />
                  <path d="M 18,22 C 16,14 30,9 35,14 Q 28,16 22,22 C 18,26 12,27 18,22 Z" fill="#151312" />
                  <path d="M 40,16 C 48,19 46,29 41,33 Q 36,29 38,22 C 37,17 38,15 40,16 Z" fill="#151312" />
                  <path d="M 23,34 C 30,38 38,36 41,31 Q 35,32 29,31 C 24,30 20,31 23,34 Z" fill="#151312" />

                  {/* Rosette 2 (Center: 110, 35) */}
                  <path d="M 100,35 C 98,25 112,23 115,29 C 118,35 110,41 105,39 C 102,38 101,36 100,35 Z" fill="#785338" />
                  <path d="M 93,27 C 91,19 105,14 110,19 Q 103,21 97,27 C 93,31 87,32 93,27 Z" fill="#151312" />
                  <path d="M 115,21 C 123,24 121,34 116,38 Q 111,34 113,27 C 112,22 113,20 115,21 Z" fill="#151312" />
                  <path d="M 98,39 C 105,43 113,41 116,36 Q 110,37 104,36 C 99,35 95,36 98,39 Z" fill="#151312" />

                  {/* Rosette 3 (Center: 75, 75) */}
                  <path d="M 65,75 C 63,65 77,63 80,69 C 83,75 75,81 70,79 C 67,78 66,76 65,75 Z" fill="#785338" />
                  <path d="M 58,67 C 56,59 70,54 75,59 Q 68,61 62,67 C 58,71 52,72 58,67 Z" fill="#151312" />
                  <path d="M 80,61 C 88,64 86,74 81,78 Q 76,74 78,67 C 77,62 78,60 80,61 Z" fill="#151312" />
                  <path d="M 63,79 C 70,83 78,81 81,76 Q 75,77 69,76 C 64,75 60,76 63,79 Z" fill="#151312" />

                  {/* Rosette 4 (Center: 35, 115) */}
                  <path d="M 25,115 C 23,105 37,103 40,109 C 43,115 35,121 30,119 C 27,118 26,116 25,115 Z" fill="#785338" />
                  <path d="M 18,107 C 16,99 30,94 35,99 Q 28,101 22,107 C 18,111 12,112 18,107 Z" fill="#151312" />
                  <path d="M 40,101 C 48,104 46,114 41,118 Q 36,114 38,107 C 37,102 38,100 40,101 Z" fill="#151312" />
                  <path d="M 23,119 C 30,123 38,121 41,116 Q 35,117 29,116 C 24,115 20,116 23,119 Z" fill="#151312" />

                  {/* Rosette 5 (Center: 115, 120) */}
                  <path d="M 105,120 C 103,110 117,108 120,114 C 123,120 115,126 110,124 C 107,123 106,121 105,120 Z" fill="#785338" />
                  <path d="M 98,112 C 96,104 110,99 115,104 Q 108,106 102,112 C 98,116 92,117 98,112 Z" fill="#151312" />
                  <path d="M 120,106 C 128,109 126,119 121,123 Q 116,119 118,112 C 117,107 118,105 120,106 Z" fill="#151312" />
                  <path d="M 103,124 C 110,128 118,126 121,121 Q 115,122 109,121 C 104,120 100,121 103,124 Z" fill="#151312" />

                  {/* Rosette 6 - Seamless horizontal border wrap (Center left) */}
                  <path d="M -5,75 C -7,65 7,63 10,69 C 13,75 5,81 0,79 Z" fill="#785338" />
                  <path d="M -12,67 C -14,59 0,54 5,59 Q -2,61 -8,67 Z" fill="#151312" />
                  <path d="M 10,61 C 18,64 16,74 11,78 Q 6,74 8,67 Z" fill="#151312" />
                  <path d="M -7,79 C 0,83 8,81 11,76 Q 5,77 -1,76 Z" fill="#151312" />

                  {/* Rosette 6 - Seamless horizontal border wrap (Center right) */}
                  <path d="M 145,75 C 143,65 157,63 160,69 C 163,75 155,81 150,79 Z" fill="#785338" />
                  <path d="M 138,67 C 136,59 150,54 155,59 Q 148,61 142,67 Z" fill="#151312" />
                  <path d="M 160,61 C 168,64 166,74 161,78 Q 156,74 158,67 Z" fill="#151312" />
                  <path d="M 143,79 C 150,83 158,81 161,76 Q 155,77 149,76 Z" fill="#151312" />

                  {/* Rosette 7 - Seamless vertical border wrap (Center top) */}
                  <path d="M 65,0 C 63,-10 77,-12 80,-6 C 83,0 75,6 70,4 Z" fill="#785338" />
                  <path d="M 58,-8 C 56,-16 70,-21 75,-16 Q 68,-14 62,-8 Z" fill="#151312" />
                  <path d="M 80,-14 C 88,-11 86,-1 81,3 Q 76,-1 78,-8 Z" fill="#151312" />
                  <path d="M 63,4 C 70,8 78,6 81,1 Q 75,2 69,1 Z" fill="#151312" />

                  {/* Rosette 7 - Seamless vertical border wrap (Center bottom) */}
                  <path d="M 65,150 C 63,140 77,138 80,144 C 83,150 75,156 70,154 Z" fill="#785338" />
                  <path d="M 58,142 C 56,134 70,129 75,134 Q 68,136 62,142 Z" fill="#151312" />
                  <path d="M 80,136 C 88,139 86,149 81,153 Q 76,149 78,142 Z" fill="#151312" />
                  <path d="M 63,154 C 70,158 78,156 81,151 Q 75,152 69,151 Z" fill="#151312" />

                  {/* Irregular Black Splotches / Spots for full density */}
                  <path d="M 15,75 C 13,71 20,68 24,72 C 28,76 21,80 17,78 Z" fill="#151312" />
                  <path d="M 65,30 C 63,26 70,23 74,27 C 78,31 71,35 67,33 Z" fill="#151312" />
                  <path d="M 130,75 C 128,71 135,68 139,72 C 143,76 136,80 132,78 Z" fill="#151312" />
                  <path d="M 65,115 C 63,111 70,108 74,112 C 78,116 71,120 67,118 Z" fill="#151312" />
                  <path d="M 130,20 C 128,16 135,13 139,17 C 143,21 136,25 132,23 Z" fill="#151312" />
                  <path d="M 10,145 C 8,141 15,138 19,142 C 23,146 16,150 12,148 Z" fill="#151312" />
                  <path d="M 10,-5 C 8,-9 15,-12 19,-8 C 23,-4 16,0 12,-2 Z" fill="#151312" />
                  <path d="M 130,145 C 128,141 135,138 139,142 C 143,146 136,150 132,148 Z" fill="#151312" />
                  <path d="M 130,-5 C 128,-9 135,-12 139,-8 C 143,-4 136,0 132,-2 Z" fill="#151312" />

                  <path d="M 33,70 Q 28,65 35,62 Q 42,65 38,72 Q 34,78 33,70 Z" fill="#151312" />
                  <path d="M 113,70 Q 108,65 115,62 Q 122,65 118,72 Q 114,78 113,70 Z" fill="#151312" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wallet-cheetah-pattern)" />
            </svg>
          )}

          {isOpen ? (
            // OPENED STATE: Displays detailed cash balance and indicators, no photo
            <>
              {/* Top Bar of the Card face */}
              <div className="flex justify-between items-start w-full relative z-10 select-none">
                <div>
                  <span className={`font-mono text-[9px] tracking-widest uppercase ${currentTheme.secText}`}>Pockittt Premium</span>
                  <h4 className="font-display text-base font-black uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    Open Wallet
                  </h4>
                </div>
              </div>

              {/* Bottom Bar of the Card face / Cash text area */}
              <div className="w-full relative z-10 flex justify-between items-end select-none">
                <div>
                  <p className={`text-[10px] font-mono font-bold leading-none tracking-tight uppercase text-left mb-1.5 ${currentTheme.secText}`}>
                    Available Cash
                  </p>
                  <div className={`text-[15px] font-black font-mono tracking-tight leading-none text-left select-none ${currentTheme.text}`}>
                    ₹{cashOnHand.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Secure status pill -> Unlocked */}
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[8px] font-mono ${currentTheme.pillBg} ${currentTheme.pillText} py-0.5 px-2 rounded-full font-bold inline-flex items-center gap-1 select-none mb-1`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentTheme.pulseColor} animate-pulse`}></span>
                    Unlocked
                  </span>
                  <span className={`text-[7px] font-mono uppercase ${currentTheme.secText}`}>
                    Click to collapse
                  </span>
                </div>
              </div>
            </>
          ) : (
            // CLOSED STATE: Only branding as requested: pockitt premium and my wallet
            <>
              <div className="flex flex-col justify-start w-full relative z-10 select-none h-full">
                <span className={`font-mono text-[9px] tracking-widest uppercase ${currentTheme.secText}`}>Pockittt Premium</span>
                <h4 className="font-display text-base font-black uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  My Wallet
                </h4>
              </div>

              {/* Tactile Leather Strap clasp on right side representing physical hold */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 ${currentTheme.claspLayer} border-y-2 border-l-2 rounded-l-md flex items-center justify-start pl-1 select-none pointer-events-none`}>
                <div className={`w-2.5 h-2.5 rounded-full border border-[#09090B] ${currentTheme.claspDot}`}></div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* --- OPENED WALLET BI-FOLD CONTENT --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full text-left space-y-6 overflow-hidden pt-2"
            id="wallet-unfolded-5-compartments"
          >
            
            {/* 1. CASH ON HAND COMPARTMENT */}
            <div className="bg-amber-50/70 border-4 border-[#09090B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#09090B] relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#09090B] flex items-center gap-1.5">
                  <span className="text-base select-none">💵</span>
                  1. Cash on Hand
                </h4>
                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditingCash(!isEditingCash);
                      setCashInputValue(String(cashOnHand));
                    }}
                    className="bg-white hover:bg-stone-50 text-[#09090B] border-2 border-[#09090B] text-[10px] font-mono font-black py-1 px-3 rounded-md uppercase shadow-[2px_2px_0px_0px_#09090B] cursor-pointer"
                  >
                    {isEditingCash ? "Cancel" : "Update"}
                  </button>
                </div>
              </div>

              {/* Cash count and Input field */}
              {isEditingCash ? (
                <form onSubmit={handleCashUpdateSubmit} className="flex gap-2 items-center bg-white border-2 border-[#09090B] p-2 rounded-xl mb-3 shadow-[2px_2px_0px_0px_#09090B]">
                  <span className="font-mono text-xs font-black text-[#09090B]/50 pl-1 uppercase">Enter Amount:</span>
                  <input
                    type="number"
                    value={cashInputValue}
                    onChange={(e) => setCashInputValue(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm font-black text-[#09090B] focus:outline-none"
                    placeholder="0"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="bg-[#C6FF00] hover:bg-[#a6d600] text-[#09090B] border-2 border-[#09090B] text-[10px] font-mono font-black py-1 px-3 rounded-lg"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="mb-4">
                  <div className="text-3xl font-mono font-black text-emerald-800 tracking-tight leading-none text-left">
                    ₹{cashOnHand.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] font-mono text-[#09090B]/50 uppercase font-black mt-1">
                    Ready funds tracked inside digital pocket
                  </p>
                </div>
              )}

              {/* STACKED PHYSICAL CASH GRAPHIC REPRESENTATION (Up to 10 overlapping green notes) */}
              <div className="h-16 bg-emerald-950 border-3 border-[#09090B] rounded-xl relative overflow-hidden flex flex-col justify-end p-2 select-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {Array.from({ length: Math.min(10, Math.max(1, Math.floor(cashOnHand / 500) + (cashOnHand % 500 > 0 ? 1 : 0))) }).map((_, i, arr) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute border border-emerald-400 bg-emerald-600 rounded-sm shadow-md"
                    style={{
                      left: `${15 + i * 4}%`,
                      right: `${15 + (arr.length - 1 - i) * 4}%`,
                      top: `${8 + i * 2.5}px`,
                      bottom: `${8 + (arr.length - 1 - i) * 1}px`,
                      zIndex: i,
                      opacity: 0.85 + (i * 0.01)
                    }}
                  >
                    <div className="w-full h-full border border-dashed border-emerald-300 rounded-[1px] p-0.5 flex items-center justify-between text-emerald-100 font-mono text-[7px] select-none">
                      <span>₹₹</span>
                      <span className="text-[8px] transform -rotate-12">🏛️</span>
                      <span>₹₹</span>
                    </div>
                  </motion.div>
                ))}

                {cashOnHand === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-emerald-400 font-mono text-[10px] z-20">
                    🕳️ Empty Cash Chamber
                  </div>
                )}
              </div>
            </div>

            {/* 2. LOVED ONE'S PHOTO COMPARTMENT */}
            <div className="bg-white border-4 border-[#09090B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#09090B]">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#09090B] mb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                2. Loved One's Photo
              </h4>
              <p className="text-[11px] text-[#09090B]/60 font-mono mb-3 leading-relaxed">
                Tuck an picture of your family, pet, or partner inside. Purely visual & sentimental motivation.
              </p>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePhotoDrop}
                onClick={() => photoInputRef.current?.click()}
                className="bg-[#FAFAF9] border-2 border-dashed border-[#09090B] p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F5F4] transition-colors relative"
              >
                <input 
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                {photo ? (
                  <div className="relative">
                    {/* Realistic polaroid paper slot tucked style */}
                    <div className="bg-[#FFFDF0] p-3 pb-8 border-3 border-[#09090B] rounded-lg shadow-md max-w-[170px] mx-auto transform -rotate-1">
                      <img 
                        src={photo} 
                        alt="Tucked Loved One Note" 
                        className="w-full h-28 object-cover border-2 border-[#09090B] rounded" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center font-mono text-[10px] font-black text-neutral-800 mt-2 tracking-wide uppercase">
                        <span className="bg-emerald-200 px-1.5 py-0.5 rounded-sm">💪 Save for them!</span>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhoto('');
                      }}
                      className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-600 border-2 border-[#09090B] p-1 rounded-full cursor-pointer shadow-[2px_2px_0px_0px_#09090B]"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 select-none font-mono text-[10px] text-[#09090B]/60">
                    <p className="text-xl mb-1.5">🖼️</p>
                    <p className="font-bold uppercase text-[9px] text-[#09090B] mb-1">Upload Gallery Picture</p>
                    <p className="text-[9px] leading-tight max-w-[200px] mx-auto">Drag & Drop or Tap to tuck a picture of a loved one.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. DAILY EXPENSES LIST COMPARTMENT */}
            <div className="bg-yellow-50/70 border-4 border-[#09090B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#09090B]">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#09090B] mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                3. Daily Expenses List
              </h4>
              <p className="text-[11px] text-[#09090B]/60 font-mono mb-3 leading-relaxed">
                A simple running log where you manually type expenses through the day. No charts or auto calculation — purely notes-style.
              </p>

              {/* Handwriting lined notebook style textarea */}
              <div className="relative bg-[#FFFED5] border-3 border-[#09090B] rounded-xl p-4 shadow-[3px_3px_0px_0px_#09090B]">
                {/* Red vertical margin line */}
                <div className="absolute left-6 top-0 bottom-0 border-r-2 border-red-300 pointer-events-none" />
                
                <textarea
                  value={expensesText}
                  onChange={(e) => setExpensesText(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs font-bold text-neutral-800 focus:outline-none pl-4 leading-6 tracking-tight relative z-10 block resize-y min-h-[120px]"
                  placeholder="- Coffee ₹150&#10;- Auto auto-ride ₹50&#10;- Canteen wrap ₹80"
                  spellCheck="false"
                />

                <div className="absolute right-2 bottom-2 pointer-events-none select-none text-[8px] font-mono font-black uppercase text-amber-600/60">
                  Notes Diary Pad 📝
                </div>
              </div>
            </div>

            {/* 4. SAVINGS TIME CAPSULE COMPARTMENT */}
            <div className="bg-sky-50/70 border-4 border-[#09090B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#09090B]">

            </div>

            {/* 5. STICKY NOTES COMPARTMENT SECTION */}
            <div className="bg-orange-50/70 border-4 border-[#09090B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#09090B]">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#09090B] flex items-center gap-1.5">
                  <span className="text-base select-none">📌</span>
                  5. Sticky Notes (IOUs & Reminders)
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNoteForm(!showAddNoteForm);
                    setEditingNoteId(null);
                  }}
                  className="bg-[#09090B] hover:bg-zinc-800 text-white border-2 border-[#09090B] text-[9px] font-mono font-black py-1 px-3 rounded-full uppercase shadow-[1px_1px_0px_0px_#09090B] cursor-pointer"
                >
                  {showAddNoteForm ? 'Close' : 'New Note ✍️'}
                </button>
              </div>
              <p className="text-[11px] text-[#09090B]/60 font-mono mb-4 leading-relaxed">
                Jot down quick informal debts (e.g., "I owe Dhriti ₹500") or quick money reminders. Tap a note to read/edit.
              </p>

              {/* Add note form */}
              {showAddNoteForm && (
                <form onSubmit={handleCreateNote} className="bg-white border-3 border-[#09090B] p-4 rounded-xl mb-4 space-y-3 shadow-[2px_2px_0px_0px_#09090B]">
                  <h5 className="font-display font-black text-[10px] uppercase tracking-wider text-[#09090B]">Stick New Reminder</h5>
                  
                  <div>
                    <label className="block text-[9px] font-mono font-black uppercase text-[#09090B]/50 mb-1">Debt / Reminder Message</label>
                    <textarea 
                      required
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full bg-[#FAFAF9] border-2 border-[#09090B] p-2 rounded-lg font-mono text-xs text-[#09090B] focus:outline-none"
                      placeholder="e.g. I owe Dhriti ₹500 for canteen lunch"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-black uppercase text-[#09090B]/50 mb-1">Color Shade</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { class: 'bg-[#FEF08A] border-[#FDE047]', label: '🟡 Yellow' },
                        { class: 'bg-[#FECDD3] border-[#FDA4AF]', label: '🔴 Pink' },
                        { class: 'bg-[#CFFAFE] border-[#67E8F9]', label: '🔵 Cyan' },
                        { class: 'bg-[#BBF7D0] border-[#86EFAC]', label: '🟢 Green' }
                      ].map((item) => (
                        <button
                          key={item.class}
                          type="button"
                          onClick={() => setNewNoteColor(item.class)}
                          className={`py-1 rounded border-2 text-[9px] font-mono font-bold transition-all ${
                            newNoteColor === item.class ? 'border-zinc-950 scale-105 shadow-sm' : 'border-zinc-200 opacity-80'
                          } ${item.class}`}
                        >
                          {item.label.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#C6FF00] hover:bg-[#a6d600] text-[#09090B] py-1.5 rounded font-display text-[10px] font-black uppercase border-2 border-[#09090B] cursor-pointer"
                  >
                    Pin to Wallet Board 📌
                  </button>
                </form>
              )}

              {/* Grid of Notes */}
              {stickyNotes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3" id="wallet-sticky-notes-container">
                  {stickyNotes.map((note) => {
                    const isEditing = editingNoteId === note.id;
                    return (
                      <div 
                        key={note.id}
                        className={`aspect-square p-3 border-2 border-[#09090B] rounded-xl relative shadow-[3px_3px_0px_0px_#09090B] flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-all duration-200 ${
                          note.color || 'bg-[#FEF08A] border-[#FDE047]'
                        }`}
                        onClick={() => !isEditing && handleStartEditNote(note)}
                      >
                        {/* Pin emoji decorative indicator */}
                        <div className="absolute top-1 right-1 select-none text-[11px] pointer-events-none opacity-80">
                          📌
                        </div>

                        {isEditing ? (
                          <div className="flex-1 flex flex-col justify-between h-full" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              className="w-full bg-black/5 rounded p-1 font-mono text-[10px] text-zinc-900 border border-[#09090B]/20 focus:outline-none flex-1 resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-1 mt-2">
                              <button 
                                type="button"
                                onClick={() => handleSaveEditNote(note.id)}
                                className="bg-[#09090B] text-white font-mono text-[8px] font-bold py-0.5 px-2 rounded uppercase"
                              >
                                Save
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="bg-white border border-black/20 text-[#09090B] font-mono text-[8px] font-medium py-0.5 px-1.5 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Note Content Text */}
                            <div className="text-left font-mono text-[11px] text-[#09090B] leading-snug tracking-tight">
                              <p className={`whitespace-pre-wrap font-bold ${note.isSettled ? 'line-through text-neutral-500/60 opacity-60' : ''}`}>
                                {note.text}
                              </p>
                            </div>

                            {/* Note Action Bar */}
                            <div className="flex justify-between items-center border-t border-[#09090B]/10 pt-1.5 mt-1 select-none">
                              {/* Settled Toggle indicator */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleSettle(note.id, e)}
                                className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#09090B] flex items-center gap-0.5 uppercase ${
                                  note.isSettled 
                                    ? 'bg-zinc-900 text-[#C6FF00]' 
                                    : 'bg-white hover:bg-zinc-100 text-[#09090B]'
                                }`}
                              >
                                {note.isSettled ? 'Settled' : 'Unsettled'}
                              </button>

                              {/* Remove Note button */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                className="p-1 hover:bg-black/15 text-[#09090B] rounded transition-transform active:scale-95"
                                title="Resolve & Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 font-mono text-xs text-[#09090B]/40 border-2 border-dashed border-[#09090B]/20 rounded-xl bg-white select-none">
                  📌 No active reminders. Click 'New Note' above to add!
                </div>
              )}
            </div>



          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
