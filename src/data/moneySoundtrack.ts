export interface Song {
  title: string;
  artist: string;
  emoji: string;
  audioUrl: string;
}

export const soundTracks: { [key: string]: Song[] } = {
  high: [
    { 
      title: "Apna Time Aayega", 
      artist: "Ranveer Singh & Divine (Gully Boy)", 
      emoji: "🎤🔥",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    { 
      title: "Stronger", 
      artist: "Kanye West", 
      emoji: "🏋️⚡",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    { 
      title: "All I Do Is Win", 
      artist: "DJ Khaled", 
      emoji: "🏆🙌",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    { 
      title: "Started From the Bottom", 
      artist: "Drake", 
      emoji: "⛰️📈",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
  ],
  mid: [
    { 
      title: "Money", 
      artist: "LISA (BLACKPINK)", 
      emoji: "💸💅",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },
    { 
      title: "Millionaire", 
      artist: "Yo Yo Honey Singh", 
      emoji: "🏎️💎",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    },
    { 
      title: "Money Trees", 
      artist: "Kendrick Lamar", 
      emoji: "🌴🕶️",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
    },
    { 
      title: "Sabse Bada Rupaiya", 
      artist: "Alisha Chinai (Bluffmaster)", 
      emoji: "🪙💰",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    }
  ],
  low: [
    { 
      title: "9 to 5", 
      artist: "Dolly Parton", 
      emoji: "☕💼",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
    },
    { 
      title: "Azaadi", 
      artist: "Divine & Dub Sharma (Gully Boy)", 
      emoji: "🕊️💥",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
    },
    { 
      title: "I Want Money", 
      artist: "Govinda (Waah! Tera Kya Kehna)", 
      emoji: "🕺💵",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
    }
  ],
  negative: [
    { 
      title: "Mo Money Mo Problems", 
      artist: "The Notorious B.I.G.", 
      emoji: "🕶️🔥",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
    },
    { 
      title: "Paisa Paisa Karti Hai", 
      artist: "Akshay Kumar (De Dana Dan)", 
      emoji: "💃💸",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
    },
    { 
      title: "Jai Jai Money", 
      artist: "Apna Sapna Money Money", 
      emoji: "🍿😂",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
    }
  ]
};

export function getMoneySoundtrack(savingsPercent: number, streak: number, randomSeed: number = 0): Song {
  let category: 'high' | 'mid' | 'low' | 'negative' = 'mid';

  if (streak >= 7 || savingsPercent >= 30) {
    category = 'high';
  } else if (savingsPercent >= 10 && savingsPercent < 30) {
    category = 'mid';
  } else if (savingsPercent > 0 && savingsPercent < 10) {
    category = 'low';
  } else {
    category = 'negative';
  }

  const list = soundTracks[category];
  const index = Math.abs(randomSeed) % list.length;
  return list[index];
}
