// Lightweight Unicode Emoji helper with on-demand open-source dataset loading

export interface EmojiItem {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export const EMOJI_CATEGORIES = [
  { id: "smileys", name: "Smileys & Emotion" },
  { id: "people", name: "People & Body" },
  { id: "nature", name: "Animals & Nature" },
  { id: "food", name: "Food & Drink" },
  { id: "activities", name: "Activities" },
  { id: "travel", name: "Travel & Places" },
  { id: "objects", name: "Objects" },
  { id: "symbols", name: "Symbols" },
  { id: "flags", name: "Flags" },
];

// Core curated emojis for instant 0ms offline rendering
export const CORE_EMOJIS: EmojiItem[] = [
  // Smileys
  {
    emoji: "😀",
    name: "grinning face",
    category: "smileys",
    keywords: ["smile", "happy"],
  },
  {
    emoji: "😃",
    name: "grinning face with big eyes",
    category: "smileys",
    keywords: ["smile", "happy"],
  },
  {
    emoji: "😄",
    name: "grinning face with smiling eyes",
    category: "smileys",
    keywords: ["smile", "laugh"],
  },
  {
    emoji: "😁",
    name: "beaming face",
    category: "smileys",
    keywords: ["smile", "grin"],
  },
  {
    emoji: "😆",
    name: "squinting face",
    category: "smileys",
    keywords: ["laugh", "lol"],
  },
  {
    emoji: "😅",
    name: "sweat smile",
    category: "smileys",
    keywords: ["relief", "sweat"],
  },
  {
    emoji: "🤣",
    name: "rofl",
    category: "smileys",
    keywords: ["rofl", "lol", "laugh"],
  },
  {
    emoji: "😂",
    name: "joy",
    category: "smileys",
    keywords: ["cry", "laugh", "joy"],
  },
  {
    emoji: "🙂",
    name: "slightly smiling",
    category: "smileys",
    keywords: ["smile"],
  },
  {
    emoji: "😉",
    name: "winking",
    category: "smileys",
    keywords: ["wink", "flirt"],
  },
  {
    emoji: "😊",
    name: "smiling eyes",
    category: "smileys",
    keywords: ["blush", "happy"],
  },
  { emoji: "😇", name: "halo", category: "smileys", keywords: ["angel"] },
  {
    emoji: "🥰",
    name: "hearts face",
    category: "smileys",
    keywords: ["love", "heart"],
  },
  {
    emoji: "😍",
    name: "heart eyes",
    category: "smileys",
    keywords: ["love", "crush"],
  },
  {
    emoji: "🤩",
    name: "star-struck",
    category: "smileys",
    keywords: ["wow", "stars"],
  },
  {
    emoji: "😘",
    name: "kissing",
    category: "smileys",
    keywords: ["kiss", "love"],
  },
  {
    emoji: "😋",
    name: "yummy",
    category: "smileys",
    keywords: ["yummy", "food"],
  },
  { emoji: "😎", name: "sunglasses", category: "smileys", keywords: ["cool"] },
  {
    emoji: "🥳",
    name: "party",
    category: "smileys",
    keywords: ["celebrate", "birthday"],
  },
  {
    emoji: "🤔",
    name: "thinking",
    category: "smileys",
    keywords: ["think", "wonder"],
  },
  {
    emoji: "🤫",
    name: "shushing",
    category: "smileys",
    keywords: ["quiet", "secret"],
  },
  {
    emoji: "😴",
    name: "sleeping",
    category: "smileys",
    keywords: ["sleep", "zzz"],
  },
  {
    emoji: "🤯",
    name: "mind blown",
    category: "smileys",
    keywords: ["explode", "shock"],
  },
  {
    emoji: "😭",
    name: "loudly crying",
    category: "smileys",
    keywords: ["cry", "sad"],
  },
  {
    emoji: "😱",
    name: "screaming",
    category: "smileys",
    keywords: ["shock", "scared"],
  },
  {
    emoji: "🔥",
    name: "fire",
    category: "smileys",
    keywords: ["lit", "hot", "flame"],
  },
  {
    emoji: "✨",
    name: "sparkles",
    category: "smileys",
    keywords: ["magic", "shine"],
  },
  {
    emoji: "🎉",
    name: "party popper",
    category: "smileys",
    keywords: ["tada", "congrats"],
  },
  {
    emoji: "❤️",
    name: "red heart",
    category: "smileys",
    keywords: ["love", "heart"],
  },
  {
    emoji: "💯",
    name: "hundred",
    category: "smileys",
    keywords: ["100", "perfect"],
  },

  // People
  {
    emoji: "👋",
    name: "wave",
    category: "people",
    keywords: ["hello", "hi", "bye"],
  },
  { emoji: "✋", name: "hand", category: "people", keywords: ["stop", "five"] },
  {
    emoji: "👌",
    name: "ok",
    category: "people",
    keywords: ["perfect", "agree"],
  },
  {
    emoji: "✌️",
    name: "peace",
    category: "people",
    keywords: ["victory", "two"],
  },
  {
    emoji: "🤞",
    name: "crossed fingers",
    category: "people",
    keywords: ["luck", "hope"],
  },
  {
    emoji: "👍",
    name: "thumbs up",
    category: "people",
    keywords: ["like", "yes", "good"],
  },
  {
    emoji: "👎",
    name: "thumbs down",
    category: "people",
    keywords: ["dislike", "no"],
  },
  {
    emoji: "👏",
    name: "clap",
    category: "people",
    keywords: ["applause", "bravo"],
  },
  {
    emoji: "🙌",
    name: "raising hands",
    category: "people",
    keywords: ["hooray", "praise"],
  },
  {
    emoji: "🤝",
    name: "handshake",
    category: "people",
    keywords: ["deal", "partner"],
  },
  {
    emoji: "🙏",
    name: "pray",
    category: "people",
    keywords: ["please", "thank you"],
  },
  {
    emoji: "💪",
    name: "biceps",
    category: "people",
    keywords: ["muscle", "strong", "gym"],
  },
  { emoji: "👀", name: "eyes", category: "people", keywords: ["look", "see"] },
  {
    emoji: "🧑‍💻",
    name: "coder",
    category: "people",
    keywords: ["developer", "tech"],
  },

  // Nature
  { emoji: "🐶", name: "dog", category: "nature", keywords: ["puppy", "pet"] },
  { emoji: "🐱", name: "cat", category: "nature", keywords: ["kitten", "pet"] },
  { emoji: "🦁", name: "lion", category: "nature", keywords: ["king", "wild"] },
  {
    emoji: "🦄",
    name: "unicorn",
    category: "nature",
    keywords: ["magic", "fantasy"],
  },
  {
    emoji: "🌸",
    name: "cherry blossom",
    category: "nature",
    keywords: ["flower", "pink"],
  },
  {
    emoji: "🌹",
    name: "rose",
    category: "nature",
    keywords: ["flower", "love"],
  },
  {
    emoji: "🌲",
    name: "tree",
    category: "nature",
    keywords: ["forest", "pine"],
  },
  { emoji: "☀️", name: "sun", category: "nature", keywords: ["sunny", "warm"] },
  {
    emoji: "⭐",
    name: "star",
    category: "nature",
    keywords: ["favorite", "gold"],
  },
  {
    emoji: "🌈",
    name: "rainbow",
    category: "nature",
    keywords: ["colors", "sky"],
  },
  {
    emoji: "⚡",
    name: "voltage",
    category: "nature",
    keywords: ["lightning", "power"],
  },

  // Food
  {
    emoji: "🍎",
    name: "apple",
    category: "food",
    keywords: ["fruit", "healthy"],
  },
  { emoji: "🍌", name: "banana", category: "food", keywords: ["fruit"] },
  {
    emoji: "🍕",
    name: "pizza",
    category: "food",
    keywords: ["fast food", "cheese"],
  },
  { emoji: "🍔", name: "burger", category: "food", keywords: ["fast food"] },
  { emoji: "🍟", name: "fries", category: "food", keywords: ["chips"] },
  {
    emoji: "🍩",
    name: "donut",
    category: "food",
    keywords: ["sweet", "dessert"],
  },
  {
    emoji: "🎂",
    name: "cake",
    category: "food",
    keywords: ["birthday", "party"],
  },
  {
    emoji: "☕",
    name: "coffee",
    category: "food",
    keywords: ["cafe", "morning", "tea"],
  },
  { emoji: "🍺", name: "beer", category: "food", keywords: ["drink", "pub"] },

  // Activities
  {
    emoji: "⚽",
    name: "soccer",
    category: "activities",
    keywords: ["football", "sport"],
  },
  {
    emoji: "🏀",
    name: "basketball",
    category: "activities",
    keywords: ["sport", "nba"],
  },
  { emoji: "🎾", name: "tennis", category: "activities", keywords: ["sport"] },
  {
    emoji: "🎯",
    name: "target",
    category: "activities",
    keywords: ["bullseye", "goal"],
  },
  {
    emoji: "🎮",
    name: "gamepad",
    category: "activities",
    keywords: ["gaming", "gamer"],
  },
  {
    emoji: "🎨",
    name: "palette",
    category: "activities",
    keywords: ["art", "paint"],
  },
  {
    emoji: "🎬",
    name: "clapper",
    category: "activities",
    keywords: ["movie", "film"],
  },
  {
    emoji: "🏆",
    name: "trophy",
    category: "activities",
    keywords: ["win", "winner"],
  },

  // Travel
  {
    emoji: "🚗",
    name: "car",
    category: "travel",
    keywords: ["vehicle", "drive"],
  },
  { emoji: "🚕", name: "taxi", category: "travel", keywords: ["cab"] },
  {
    emoji: "✈️",
    name: "airplane",
    category: "travel",
    keywords: ["flight", "plane"],
  },
  {
    emoji: "🚀",
    name: "rocket",
    category: "travel",
    keywords: ["launch", "space"],
  },
  { emoji: "🏠", name: "house", category: "travel", keywords: ["home"] },
  { emoji: "🏢", name: "office", category: "travel", keywords: ["building"] },

  // Objects
  {
    emoji: "💻",
    name: "laptop",
    category: "objects",
    keywords: ["computer", "pc"],
  },
  { emoji: "📱", name: "phone", category: "objects", keywords: ["mobile"] },
  {
    emoji: "💡",
    name: "light bulb",
    category: "objects",
    keywords: ["idea", "bright"],
  },
  {
    emoji: "💰",
    name: "money bag",
    category: "objects",
    keywords: ["cash", "rich"],
  },
  {
    emoji: "🔒",
    name: "lock",
    category: "objects",
    keywords: ["security", "safe"],
  },
  { emoji: "🔑", name: "key", category: "objects", keywords: ["password"] },
  { emoji: "⚙️", name: "gear", category: "objects", keywords: ["settings"] },

  // Symbols
  {
    emoji: "✅",
    name: "check mark",
    category: "symbols",
    keywords: ["done", "yes", "ok"],
  },
  {
    emoji: "❌",
    name: "cross mark",
    category: "symbols",
    keywords: ["no", "cancel"],
  },
  {
    emoji: "⚠️",
    name: "warning",
    category: "symbols",
    keywords: ["alert", "danger"],
  },
  {
    emoji: "ℹ️",
    name: "info",
    category: "symbols",
    keywords: ["help", "information"],
  },
  {
    emoji: "💬",
    name: "speech",
    category: "symbols",
    keywords: ["comment", "chat"],
  },
  {
    emoji: "➡️",
    name: "right arrow",
    category: "symbols",
    keywords: ["next", "forward"],
  },
  { emoji: "⬅️", name: "left arrow", category: "symbols", keywords: ["back"] },

  // Flags
  {
    emoji: "🇧🇩",
    name: "Bangladesh",
    category: "flags",
    keywords: ["bd", "bangladesh"],
  },
  {
    emoji: "🇺🇸",
    name: "United States",
    category: "flags",
    keywords: ["usa", "america"],
  },
  {
    emoji: "🇬🇧",
    name: "United Kingdom",
    category: "flags",
    keywords: ["uk", "britain"],
  },
  { emoji: "🇨🇦", name: "Canada", category: "flags", keywords: ["canada"] },
  {
    emoji: "🇦🇺",
    name: "Australia",
    category: "flags",
    keywords: ["australia"],
  },
  { emoji: "🇩🇪", name: "Germany", category: "flags", keywords: ["germany"] },
  { emoji: "🇫🇷", name: "France", category: "flags", keywords: ["france"] },
  { emoji: "🇯🇵", name: "Japan", category: "flags", keywords: ["japan"] },
  {
    emoji: "🏁",
    name: "checkered flag",
    category: "flags",
    keywords: ["finish", "race"],
  },
  {
    emoji: "🚩",
    name: "red flag",
    category: "flags",
    keywords: ["flag", "marker"],
  },
];

let fullEmojiList: EmojiItem[] | null = null;

/** Lazily load full open-source Unicode Emoji dataset in background */
export async function getFullEmojiList(): Promise<EmojiItem[]> {
  if (fullEmojiList) return fullEmojiList;

  try {
    const res = await fetch(
      "https://unpkg.com/unicode-emoji-json@latest/data-by-emoji.json",
    );
    if (!res.ok) throw new Error("Failed to load full emoji dataset");
    const data: Record<
      string,
      { name: string; group: string; sub_group?: string }
    > = await res.json();

    const categoryMap: Record<string, string> = {
      "Smileys & Emotion": "smileys",
      "People & Body": "people",
      "Animals & Nature": "nature",
      "Food & Drink": "food",
      "Travel & Places": "travel",
      Activities: "activities",
      Objects: "objects",
      Symbols: "symbols",
      Flags: "flags",
    };

    const items: EmojiItem[] = Object.entries(data).map(([emoji, info]) => {
      const category = categoryMap[info.group] || "smileys";
      const name = info.name.toLowerCase();
      const keywords = name.split(" ");
      return { emoji, name, category, keywords };
    });

    fullEmojiList = items;
    return items;
  } catch (err) {
    console.warn("Could not fetch remote emoji list, using core emojis:", err);
    fullEmojiList = CORE_EMOJIS;
    return CORE_EMOJIS;
  }
}
