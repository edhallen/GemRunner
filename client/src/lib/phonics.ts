// Structured phonics word bank following research-backed progression.
// 10 stages from simple CVC words through vowel teams.

export interface WordFamily {
  pattern: string; // e.g. "-at"
  words: string[];
}

export interface PhonicsStage {
  id: number;
  name: string;
  skill: string;
  words: string[];
  families: WordFamily[];
}

export const PHONICS_STAGES: PhonicsStage[] = [
  {
    id: 1,
    name: "Short A CVC",
    skill: "short a",
    words: ["cat", "bat", "hat", "mat", "sat", "fan", "can", "man", "ran", "van", "cap", "map", "tap", "nap", "bag"],
    families: [
      { pattern: "-at", words: ["cat", "bat", "hat", "mat", "sat"] },
      { pattern: "-an", words: ["can", "man", "ran", "van", "fan"] },
      { pattern: "-ap", words: ["cap", "map", "tap", "nap"] },
    ],
  },
  {
    id: 2,
    name: "Short I CVC",
    skill: "short i",
    words: ["sit", "bit", "hit", "fit", "pig", "big", "dig", "fig", "pin", "fin", "tip", "lip", "rip", "dip", "kid"],
    families: [
      { pattern: "-it", words: ["sit", "bit", "hit", "fit"] },
      { pattern: "-ig", words: ["pig", "big", "dig", "fig"] },
      { pattern: "-ip", words: ["tip", "lip", "rip", "dip"] },
      { pattern: "-in", words: ["pin", "fin"] },
    ],
  },
  {
    id: 3,
    name: "Short O CVC",
    skill: "short o",
    words: ["dog", "log", "hog", "fog", "hot", "pot", "dot", "cot", "mop", "top", "hop", "pop", "box", "fox", "job"],
    families: [
      { pattern: "-og", words: ["dog", "log", "hog", "fog"] },
      { pattern: "-ot", words: ["hot", "pot", "dot", "cot"] },
      { pattern: "-op", words: ["mop", "top", "hop", "pop"] },
    ],
  },
  {
    id: 4,
    name: "Short U CVC",
    skill: "short u",
    words: ["bug", "rug", "mug", "hug", "cup", "pup", "sun", "run", "fun", "bun", "bus", "gum", "mud", "nut", "tub"],
    families: [
      { pattern: "-ug", words: ["bug", "rug", "mug", "hug"] },
      { pattern: "-up", words: ["cup", "pup"] },
      { pattern: "-un", words: ["sun", "run", "fun", "bun"] },
    ],
  },
  {
    id: 5,
    name: "Short E CVC",
    skill: "short e",
    words: ["bed", "red", "fed", "led", "hen", "pen", "ten", "men", "pet", "net", "wet", "set", "jet", "leg", "beg"],
    families: [
      { pattern: "-ed", words: ["bed", "red", "fed", "led"] },
      { pattern: "-en", words: ["hen", "pen", "ten", "men"] },
      { pattern: "-et", words: ["pet", "net", "wet", "set", "jet"] },
      { pattern: "-eg", words: ["leg", "beg"] },
    ],
  },
  {
    id: 6,
    name: "Digraphs",
    skill: "digraphs",
    words: ["ship", "shop", "chin", "chop", "thin", "them", "whip", "when", "duck", "back", "kick", "lock", "rich", "much", "fish"],
    families: [
      { pattern: "sh-", words: ["ship", "shop"] },
      { pattern: "ch-", words: ["chin", "chop"] },
      { pattern: "th-", words: ["thin", "them"] },
      { pattern: "-ck", words: ["duck", "back", "kick", "lock"] },
    ],
  },
  {
    id: 7,
    name: "Initial Blends",
    skill: "initial blends",
    words: ["stop", "step", "slip", "clap", "crab", "frog", "trip", "drum", "swim", "snap", "flag", "glad", "plan", "flat", "grip"],
    families: [
      { pattern: "st-", words: ["stop", "step"] },
      { pattern: "sl-/cl-", words: ["slip", "clap"] },
      { pattern: "cr-/fr-", words: ["crab", "frog"] },
      { pattern: "tr-/dr-", words: ["trip", "drum"] },
      { pattern: "sn-/sw-", words: ["snap", "swim"] },
      { pattern: "fl-/gl-", words: ["flag", "glad", "flat"] },
    ],
  },
  {
    id: 8,
    name: "Final Blends",
    skill: "final blends",
    words: ["lamp", "milk", "fast", "jump", "tent", "hand", "sink", "help", "gift", "dust", "belt", "gold", "pond", "bump", "risk"],
    families: [
      { pattern: "-mp", words: ["lamp", "jump", "bump"] },
      { pattern: "-lk/-lt", words: ["milk", "belt", "gold"] },
      { pattern: "-st", words: ["fast", "dust"] },
      { pattern: "-nt/-nd", words: ["tent", "hand", "pond"] },
      { pattern: "-nk", words: ["sink", "risk"] },
      { pattern: "-lp/-ft", words: ["help", "gift"] },
    ],
  },
  {
    id: 9,
    name: "Silent-e (CVCe)",
    skill: "silent e",
    words: ["cake", "bike", "home", "cute", "lane", "pine", "bone", "tube", "make", "ride", "hope", "like", "name", "time", "nose"],
    families: [
      { pattern: "-ake", words: ["cake", "make"] },
      { pattern: "-ike/-ine", words: ["bike", "like", "pine"] },
      { pattern: "-ome/-one", words: ["home", "bone"] },
      { pattern: "-ane/-ame", words: ["lane", "name"] },
      { pattern: "-ide/-ime", words: ["ride", "time"] },
      { pattern: "-ose/-ope", words: ["nose", "hope"] },
    ],
  },
  {
    id: 10,
    name: "Vowel Teams",
    skill: "vowel teams",
    words: ["rain", "boat", "sea", "play", "feet", "read", "coat", "green", "team", "road", "sail", "deep", "goat", "keep", "tray"],
    families: [
      { pattern: "-ai-", words: ["rain", "sail"] },
      { pattern: "-oa-", words: ["boat", "coat", "goat", "road"] },
      { pattern: "-ea-", words: ["sea", "read", "team"] },
      { pattern: "-ee-", words: ["feet", "green", "deep", "keep"] },
      { pattern: "-ay", words: ["play", "tray"] },
    ],
  },
];

// Truly irregular words — always available regardless of stage
export const SIGHT_WORDS = [
  "the", "said", "was", "of", "is", "are", "you", "they", "have", "do",
  "to", "one", "two", "were", "there", "what", "who", "come", "some",
  "give", "live",
];

// Get all words for a stage (and optionally prior stages for review)
export function getStageWords(stage: number): string[] {
  const s = PHONICS_STAGES.find((p) => p.id === stage);
  return s ? s.words : [];
}

export function getReviewWords(currentStage: number): string[] {
  return PHONICS_STAGES
    .filter((s) => s.id < currentStage)
    .flatMap((s) => s.words);
}

// Get word families for a stage
export function getStageFamilies(stage: number): WordFamily[] {
  const s = PHONICS_STAGES.find((p) => p.id === stage);
  return s ? s.families : [];
}

// Find the word family a word belongs to (within a stage)
export function findWordFamily(word: string, stage: number): WordFamily | null {
  const families = getStageFamilies(stage);
  const lower = word.toLowerCase();
  for (const fam of families) {
    if (fam.words.includes(lower)) return fam;
  }
  return null;
}

// Find the family a word belongs to across all stages
export function findWordFamilyGlobal(word: string): WordFamily | null {
  const lower = word.toLowerCase();
  for (const stage of PHONICS_STAGES) {
    for (const fam of stage.families) {
      if (fam.words.includes(lower)) return fam;
    }
  }
  return null;
}

// All phonics words (flat list) for backward-compatible WORD_BANK
export function getAllPhonicsWords(): string[] {
  return PHONICS_STAGES.flatMap((s) => s.words);
}

// Flatten into 5 levels for backward-compatible WORD_BANK export
// Stages 1-2 → level1, 3-4 → level2, 5-6 → level3, 7-8 → level4, 9-10 → level5
export function getWordBankByLevel(): Record<string, string[]> {
  return {
    level1: [...PHONICS_STAGES[0].words, ...PHONICS_STAGES[1].words].map((w) => w.toUpperCase()),
    level2: [...PHONICS_STAGES[2].words, ...PHONICS_STAGES[3].words].map((w) => w.toUpperCase()),
    level3: [...PHONICS_STAGES[4].words, ...PHONICS_STAGES[5].words].map((w) => w.toUpperCase()),
    level4: [...PHONICS_STAGES[6].words, ...PHONICS_STAGES[7].words].map((w) => w.toUpperCase()),
    level5: [...PHONICS_STAGES[8].words, ...PHONICS_STAGES[9].words].map((w) => w.toUpperCase()),
  };
}
