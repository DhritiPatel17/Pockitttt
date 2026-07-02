export interface Song {
  id: string;
  title: string;
  artist: string;
  language: "hindi" | "english" | "punjabi";
  vibe: "hustle" | "celebrate" | "mindful" | "comeback" | "grind" | "chill" | "motivate";
  savingsBracket: "low" | "medium" | "high" | "negative"; // which savings% to show this song
  spotifyPreviewUrl: string; // 30-second preview (using highly reliable public MP3 tracks)
  youtubeId?: string; // fallback
  duration: number; // in seconds
  emoji?: string;
}

export const songLibrary: Song[] = [
  // ========== HIGH SAVINGS (30%+) - HUSTLE / GRIND (16 songs) ==========
  {
    id: "apna-time-aayega",
    title: "Apna Time Aayega",
    artist: "Ranveer Singh & Divine",
    language: "hindi",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    youtubeId: "bUqQC4vUBds",
    duration: 30,
    emoji: "🎤🔥"
  },
  {
    id: "all-i-do-is-win",
    title: "All I Do Is Win",
    artist: "DJ Khaled ft. T-Pain",
    language: "english",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    youtubeId: "GxBSyx85Kp8",
    duration: 30,
    emoji: "🏆🙌"
  },
  {
    id: "stronger",
    title: "Stronger",
    artist: "Kanye West",
    language: "english",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    youtubeId: "PsO6ZnUZI0g",
    duration: 30,
    emoji: "🏋️⚡"
  },
  {
    id: "started-from-the-bottom",
    title: "Started From the Bottom",
    artist: "Drake",
    language: "english",
    vibe: "grind",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    youtubeId: "tYzGQOT0b-M",
    duration: 30,
    emoji: "⛰️📈"
  },
  {
    id: "jai-jai-money",
    title: "Jai Jai Money",
    artist: "Apna Sapna Money Money",
    language: "hindi",
    vibe: "grind",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    youtubeId: "pR8_6D0SHVQ",
    duration: 30,
    emoji: "🪙💰"
  },
  {
    id: "azaadi",
    title: "Azaadi",
    artist: "Divine & Dub Sharma",
    language: "hindi",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    youtubeId: "vXx9V9J20OE",
    duration: 30,
    emoji: "🕊️💥"
  },
  {
    id: "paisa-paisa-karti-hai",
    title: "Paisa Paisa Karti Hai",
    artist: "Akshay Kumar (De Dana Dan)",
    language: "hindi",
    vibe: "celebrate",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    youtubeId: "P1h-Qr6wNkY",
    duration: 30,
    emoji: "💃💸"
  },
  {
    id: "money-trees",
    title: "Money Trees",
    artist: "Kendrick Lamar ft. Jay Rock",
    language: "english",
    vibe: "grind",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    youtubeId: "xyz789",
    duration: 30,
    emoji: "🌴🕶️"
  },
  {
    id: "millionaire",
    title: "Millionaire",
    artist: "Yo Yo Honey Singh",
    language: "punjabi",
    vibe: "celebrate",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    youtubeId: "pqr123",
    duration: 30,
    emoji: "🏎️💎"
  },
  {
    id: "remember-the-name",
    title: "Remember The Name",
    artist: "Fort Minor",
    language: "english",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    youtubeId: "VDvr08sC24c",
    duration: 30,
    emoji: "🔥🦾"
  },
  {
    id: "lose-yourself",
    title: "Lose Yourself",
    artist: "Eminem",
    language: "english",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    youtubeId: "_Yhyp-_hK7c",
    duration: 30,
    emoji: "🎤⚡"
  },
  {
    id: "ameer-emiway",
    title: "Ameer",
    artist: "Emiway Bantai",
    language: "hindi",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: 30,
    emoji: "💎💸"
  },
  {
    id: "kalaastar-singh",
    title: "Kalaastar",
    artist: "Yo Yo Honey Singh",
    language: "punjabi",
    vibe: "celebrate",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    duration: 30,
    emoji: "🕶️🔥"
  },
  {
    id: "money-power-glory",
    title: "Money Power Glory",
    artist: "Lana Del Rey",
    language: "english",
    vibe: "grind",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    duration: 30,
    emoji: "🥀👑"
  },
  {
    id: "rich-flex-drake",
    title: "Rich Flex",
    artist: "Drake & 21 Savage",
    language: "english",
    vibe: "hustle",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    duration: 30,
    emoji: "💅💵"
  },
  {
    id: "paisa-vishal",
    title: "Paisa",
    artist: "Vishal Dadlani",
    language: "hindi",
    vibe: "grind",
    savingsBracket: "high",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    duration: 30,
    emoji: "💰🏦"
  },

  // ========== MEDIUM SAVINGS (10-30%) - CELEBRATE (14 songs) ==========
  {
    id: "money-lisa",
    title: "Money",
    artist: "LISA (BLACKPINK)",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    youtubeId: "lz4FPpqlQJA",
    duration: 30,
    emoji: "💸💅"
  },
  {
    id: "good-as-hell",
    title: "Good as Hell",
    artist: "Lizzo",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    youtubeId: "viv789",
    duration: 30,
    emoji: "💃✨"
  },
  {
    id: "walking-on-sunshine",
    title: "Walking on Sunshine",
    artist: "Katrina & The Waves",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    youtubeId: "wxy123",
    duration: 30,
    emoji: "☀️🕶️"
  },
  {
    id: "uptown-funk",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    youtubeId: "zab456",
    duration: 30,
    emoji: "🕺🎷"
  },
  {
    id: "dont-stop-me-now",
    title: "Don't Stop Me Now",
    artist: "Queen",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    youtubeId: "cde789",
    duration: 30,
    emoji: "🚀⚡"
  },
  {
    id: "levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    youtubeId: "fgh123",
    duration: 30,
    emoji: "🌌🪐"
  },
  {
    id: "kya-baat-ay",
    title: "Kya Baat Ay",
    artist: "Harrdy Sandhu",
    language: "punjabi",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    youtubeId: "ijk456",
    duration: 30,
    emoji: "🕺💥"
  },
  {
    id: "sabse-bada-rupaiya",
    title: "Sabse Bada Rupaiya",
    artist: "Alisha Chinai",
    language: "hindi",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    youtubeId: "abc123",
    duration: 30,
    emoji: "🪙💰"
  },
  {
    id: "high-rated-gabru",
    title: "High Rated Gabru",
    artist: "Guru Randhawa",
    language: "punjabi",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    youtubeId: "Hyy7S89J0fA",
    duration: 30,
    emoji: "😎💥"
  },
  {
    id: "billionaire-travie",
    title: "Billionaire",
    artist: "Travie McCoy ft. Bruno Mars",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: 30,
    emoji: "🎸🚀"
  },
  {
    id: "seven-rings",
    title: "7 rings",
    artist: "Ariana Grande",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    duration: 30,
    emoji: "💍🛍️"
  },
  {
    id: "dope-shope-honey",
    title: "Dope Shope",
    artist: "Deep Money & Yo Yo Honey Singh",
    language: "punjabi",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: 30,
    emoji: "🕺😎"
  },
  {
    id: "cant-buy-me-love",
    title: "Can't Buy Me Love",
    artist: "The Beatles",
    language: "english",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    duration: 30,
    emoji: "❤️🎸"
  },
  {
    id: "kbc-theme",
    title: "Kaun Banega Crorepati Theme",
    artist: "KBC Orchestra",
    language: "hindi",
    vibe: "celebrate",
    savingsBracket: "medium",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    duration: 30,
    emoji: "📺🎰"
  },

  // ========== LOW SAVINGS (0-10%) - MINDFUL / CHILL (11 songs) ==========
  {
    id: "9-to-5",
    title: "9 to 5",
    artist: "Dolly Parton",
    language: "english",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    youtubeId: "UPA3DRrD6KE",
    duration: 30,
    emoji: "☕💼"
  },
  {
    id: "dont-worry-be-happy",
    title: "Don't Worry Be Happy",
    artist: "Bobby McFerrin",
    language: "english",
    vibe: "chill",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    youtubeId: "stu456",
    duration: 30,
    emoji: "🧘‍♂️🍃"
  },
  {
    id: "good-life",
    title: "Good Life",
    artist: "OneRepublic",
    language: "english",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    youtubeId: "vwx789",
    duration: 30,
    emoji: "🗺️✨"
  },
  {
    id: "tum-hi-ho",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    language: "hindi",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    youtubeId: "bcd456",
    duration: 30,
    emoji: "🌧️🎸"
  },
  {
    id: "kabira",
    title: "Kabira",
    artist: "Arijit Singh & Harshdeep Kaur",
    language: "hindi",
    vibe: "chill",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    youtubeId: "jHNNMj5bLuI",
    duration: 30,
    emoji: "🕯️🕉️"
  },
  {
    id: "kun-faya-kun",
    title: "Kun Faya Kun",
    artist: "A.R. Rahman",
    language: "hindi",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    youtubeId: "T94PHkuyd8c",
    duration: 30,
    emoji: "🕌✨"
  },
  {
    id: "love-yourself",
    title: "Love Yourself",
    artist: "Justin Bieber",
    language: "english",
    vibe: "chill",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    youtubeId: "S5uS9uS-Jsw",
    duration: 30,
    emoji: "📱🎸"
  },
  {
    id: "price-tag-jessie",
    title: "Price Tag",
    artist: "Jessie J",
    language: "english",
    vibe: "chill",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 30,
    emoji: "🏷️🍃"
  },
  {
    id: "kabira-encore",
    title: "Kabira (Encore)",
    artist: "Arijit Singh",
    language: "hindi",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 30,
    emoji: "🧘🏕️"
  },
  {
    id: "safarnama-lucky",
    title: "Safarnama",
    artist: "Lucky Ali",
    language: "hindi",
    vibe: "chill",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 30,
    emoji: "🚗🌅"
  },
  {
    id: "she-works-hard",
    title: "She Works Hard for the Money",
    artist: "Donna Summer",
    language: "english",
    vibe: "mindful",
    savingsBracket: "low",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 30,
    emoji: "👩‍💻💼"
  },

  // ========== NEGATIVE SAVINGS (<0%) - COMEBACK / MOTIVATE (10 songs) ==========
  {
    id: "mo-money-mo-problems",
    title: "Mo Money Mo Problems",
    artist: "The Notorious B.I.G.",
    language: "english",
    vibe: "comeback",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    youtubeId: "efg789",
    duration: 30,
    emoji: "🕶️💵"
  },
  {
    id: "rise-up",
    title: "Rise Up",
    artist: "Andra Day",
    language: "english",
    vibe: "motivate",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    youtubeId: "hij123",
    duration: 30,
    emoji: "🌄🛡️"
  },
  {
    id: "eye-of-the-tiger",
    title: "Eye of the Tiger",
    artist: "Survivor",
    language: "english",
    vibe: "motivate",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    youtubeId: "klm456",
    duration: 30,
    emoji: "🐅🥊"
  },
  {
    id: "stronger-clarkson",
    title: "Stronger (What Doesn't Kill You)",
    artist: "Kelly Clarkson",
    language: "english",
    vibe: "comeback",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    youtubeId: "Xn676-y4v6s",
    duration: 30,
    emoji: "💪🔥"
  },
  {
    id: "phir-bhi-dil-hai-hindustani",
    title: "Phir Bhi Dil Hai Hindustani",
    artist: "Udit Narayan",
    language: "hindi",
    vibe: "motivate",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    youtubeId: "qrs123",
    duration: 30,
    emoji: "🇮🇳❤️"
  },
  {
    id: "dil-chahta-hai",
    title: "Dil Chahta Hai",
    artist: "Shankar Mahadevan",
    language: "hindi",
    vibe: "chill",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    youtubeId: "tuv456",
    duration: 30,
    emoji: "🚗🏖️"
  },
  {
    id: "kala-chashma-badshah",
    title: "Kaala Chashma",
    artist: "Badshah & Neha Kakkar",
    language: "punjabi",
    vibe: "comeback",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    duration: 30,
    emoji: "🕶️🔥"
  },
  {
    id: "zindagi-der-lagegi",
    title: "Der Lagegi (ZNMD)",
    artist: "Shankar Ehsaan Loy",
    language: "hindi",
    vibe: "chill",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 30,
    emoji: "🌊🕊️"
  },
  {
    id: "i-will-survive-gloria",
    title: "I Will Survive",
    artist: "Gloria Gaynor",
    language: "english",
    vibe: "comeback",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 30,
    emoji: "💃✨"
  },
  {
    id: "challa-rabbi",
    title: "Challa",
    artist: "Rabbi Shergill",
    language: "punjabi",
    vibe: "motivate",
    savingsBracket: "negative",
    spotifyPreviewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 30,
    emoji: "🎸🌾"
  }
];

export function getRandomSongForUser(savingsPercent: number): Song {
  let bracket: "low" | "medium" | "high" | "negative";

  if (savingsPercent >= 30) {
    bracket = "high";
  } else if (savingsPercent >= 10) {
    bracket = "medium";
  } else if (savingsPercent >= 0) {
    bracket = "low";
  } else {
    bracket = "negative";
  }

  const matchingSongs = songLibrary.filter(song => song.savingsBracket === bracket);
  const randomIndex = Math.floor(Math.random() * matchingSongs.length);
  return matchingSongs[randomIndex] || songLibrary[0];
}

export function getMultipleRandomSongs(savingsPercent: number, count: number = 5): Song[] {
  let bracket: "low" | "medium" | "high" | "negative";

  if (savingsPercent >= 30) {
    bracket = "high";
  } else if (savingsPercent >= 10) {
    bracket = "medium";
  } else if (savingsPercent >= 0) {
    bracket = "low";
  } else {
    bracket = "negative";
  }

  const matchingSongs = songLibrary.filter(song => song.savingsBracket === bracket);
  const shuffled = [...matchingSongs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
