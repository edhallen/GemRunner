// Word lists for spelling challenges, combining the 100 most common English words
// and 3rd-grade reading vocabulary (Dolch sight words + grade-level words).
// Tier selection is based on Castle Raider level progression.

import { useProfiles } from "./stores/useProfiles";

// Tier 1: 2-3 letter words (levels 1-3)
// Includes top-100 common words + Dolch sight words + 3rd grade short words
export const TIER_1_WORDS = [
  // Top-100 common (2-3 letter)
  "a", "an", "am", "as", "at", "be", "by", "do", "go", "he",
  "if", "in", "is", "it", "me", "my", "no", "of", "on", "or",
  "so", "to", "up", "us", "we",
  // Dolch sight words (2-3 letter)
  "ah", "aw", "oh",
  // Core short words
  "add", "age", "ago", "air", "all",
  "and", "any", "are", "arm", "art", "ask", "ate", "bad", "bag", "ban",
  "bat", "bed", "big", "bit", "box", "boy", "bug", "bus", "but", "buy",
  "can", "car", "cat", "cup", "cut", "dad", "day", "did", "dig", "dog",
  "dot", "dry", "due", "ear", "eat", "egg", "end", "eye", "fan", "far",
  "fat", "fed", "few", "fig", "fit", "fix", "fly", "for", "fox", "fun",
  "fur", "gas", "get", "god", "got", "gun", "gut", "guy", "had", "has",
  "hat", "her", "hid", "him", "his", "hit", "hot", "how", "hug", "ice",
  "ill", "its", "jar", "jet", "job", "joy", "key", "kid", "kit", "law",
  "lay", "led", "leg", "let", "lid", "lie", "lip", "log", "lot", "low",
  "mad", "man", "map", "mat", "may", "men", "met", "mix", "mom", "mud",
  "mug", "net", "new", "nor", "not", "now", "nut", "odd", "off", "oil",
  "old", "one", "our", "out", "own", "pan", "pay", "pen", "per", "pet",
  "pie", "pig", "pin", "pit", "pop", "pot", "pub", "put", "ran", "rat",
  "raw", "red", "rid", "rob", "rod", "row", "rub", "rug", "run", "sad",
  "sat", "saw", "say", "sea", "set", "she", "sir", "sit", "six", "ski",
  "sky", "son", "spy", "sun", "tab", "tag", "tan", "tap", "tax", "tea",
  "ten", "the", "tie", "tin", "tip", "toe", "too", "top", "toy", "try",
  "tub", "two", "use", "van", "war", "was", "way", "web", "wet", "who",
  "why", "win", "wit", "won", "yes", "yet", "you", "zoo",
];

// Tier 2: 4 letter words (levels 1-6)
// Includes top-100 common words + Dolch 3rd grade sight words + grade-level vocabulary
export const TIER_2_WORDS = [
  "able", "also", "area", "army", "away", "back", "ball", "band", "bank", "base",
  "bear", "beat", "been", "bell", "belt", "bend", "best", "bike", "bill", "bird",
  "blow", "blue", "boat", "body", "bomb", "bone", "book", "born", "boss", "both",
  "bowl", "burn", "busy", "cake", "call", "calm", "came", "camp", "card", "care",
  "case", "cash", "cast", "chip", "city", "club", "coat", "code", "cold", "come",
  "cook", "cool", "copy", "core", "cost", "crew", "crop", "cure", "cute", "dark",
  "data", "date", "dead", "deal", "deep", "dirt", "dish", "dock", "does", "done",
  "door", "down", "draw", "drew", "drop", "drug", "drum", "dump", "dust", "duty",
  "each", "earn", "ease", "east", "easy", "edge", "else", "even", "ever", "evil",
  "exam", "exit", "face", "fact", "fail", "fair", "fall", "fame", "farm", "fast",
  "fate", "fear", "feed", "feel", "feet", "fell", "felt", "file", "fill", "film",
  "find", "fine", "fire", "firm", "fish", "five", "flat", "flew", "flow", "fold",
  "folk", "food", "fool", "foot", "form", "four", "free", "from", "fuel", "full",
  "fund", "gain", "game", "gate", "gave", "gift", "girl", "glad", "goal", "goes",
  "gold", "gone", "good", "grab", "gray", "grew", "grow", "gulf", "hair", "half",
  "hall", "hand", "hang", "hard", "harm", "hate", "have", "head", "hear", "heat",
  "held", "help", "here", "hero", "hide", "high", "hill", "hire", "hold", "hole",
  "home", "hook", "hope", "host", "hour", "huge", "hung", "hunt", "hurt", "idea",
  "inch", "into", "iron", "item", "jack", "jail", "joke", "jump", "jury", "just",
  "keen", "keep", "kept", "kick", "kill", "kind", "king", "kiss", "knee", "knew",
  "knot", "know", "lack", "laid", "lake", "lamp", "land", "lane", "last", "late",
  "lead", "left", "lend", "less", "life", "lift", "like", "line", "link", "list",
  "live", "load", "loan", "lock", "long", "look", "lord", "lose", "loss", "lost",
  "love", "luck", "made", "mail", "main", "make", "male", "many", "mark", "mass",
  "meal", "mean", "meet", "milk", "mind", "mine", "miss", "mode", "mood", "moon",
  "more", "most", "move", "much", "must", "name", "near", "neat", "neck", "need",
  "news", "next", "nice", "nine", "node", "none", "nose", "note", "obey", "odds",
  "once", "only", "onto", "open", "over", "pace", "pack", "page", "paid", "pain",
  "pair", "pale", "palm", "park", "part", "pass", "past", "path", "peak", "pick",
  "pile", "pine", "pink", "pipe", "plan", "play", "plot", "plug", "plus", "poem",
  "poet", "poll", "pool", "poor", "port", "pose", "post", "pour", "pray", "pull",
  "pump", "pure", "push", "quit", "race", "rain", "rank", "rare", "rate", "read",
  "real", "rear", "rely", "rent", "rest", "rice", "rich", "ride", "ring", "rise",
  "risk", "road", "rock", "rode", "role", "roll", "roof", "room", "root", "rope",
  "rose", "ruin", "rule", "rush", "safe", "said", "sake", "sale", "salt", "same",
  "sand", "sang", "save", "seal", "seat", "seed", "seek", "seem", "seen", "self",
  "sell", "send", "sent", "ship", "shop", "shot", "show", "shut", "sick", "side",
  "sign", "sing", "sink", "site", "size", "skin", "slip", "slow", "snap", "snow",
  "soft", "soil", "sold", "sole", "some", "song", "soon", "sort", "soul", "spin",
  "spot", "star", "stay", "stem", "step", "stop", "such", "sure", "swim", "tail",
  "take", "tale", "talk", "tall", "tank", "tape", "task", "team", "tear", "tell",
  "tend", "term", "test", "text", "than", "that", "them", "then", "they", "thin",
  "this", "thus", "tide", "till", "time", "tiny", "tire", "told", "tone", "took",
  "tool", "tops", "tore", "torn", "tour", "town", "trap", "tree", "trim", "trip",
  "true", "tube", "tuck", "tune", "turn", "twin", "type", "unit", "upon", "used",
  "user", "vast", "very", "view", "vote", "wage", "wait", "wake", "walk", "wall",
  "want", "warm", "warn", "wash", "wave", "weak", "wear", "week", "well", "went",
  "were", "west", "what", "when", "whom", "wide", "wife", "wild", "will", "wind",
  "wine", "wing", "wire", "wise", "wish", "with", "wood", "word", "wore", "work",
  "worm", "worn", "wrap", "yard", "year", "yell", "your", "zero", "zone",
  // Dolch 3rd grade sight words (4 letter)
  "does", "done", "draw", "fall", "full", "gave", "goes", "grow", "hold",
  "hurt", "keep", "kind", "made", "much", "must", "only", "pick", "seem",
  "show", "sing", "tell", "upon", "wash", "wish", "work",
  // 3rd grade vocabulary (4 letter)
  "arch", "bake", "barn", "beam", "beef", "bolt", "buzz", "cape", "cave",
  "claw", "clay", "clue", "coil", "colt", "cone", "cord", "cork", "crab",
  "dash", "dawn", "deer", "dime", "dine", "dome", "dove", "dusk", "fade",
  "fawn", "fern", "finn", "foam", "foil", "gale", "gaze", "germ", "glow",
  "gnaw", "grin", "grip", "gulp", "gust", "hare", "hawk", "haze", "heap",
  "herb", "herd", "hike", "hive", "howl", "isle", "jade", "jolt", "kelp",
  "kite", "knob", "lace", "lark", "leaf", "lean", "lime", "limp", "loom",
  "lore", "lump", "mane", "mare", "maze", "melt", "mend", "mesa", "mist",
  "moan", "mole", "moss", "mule", "myth", "nape", "nest", "nook", "oath",
  "orb", "orca", "pane", "pave", "pawn", "pear", "peel", "pier", "plum",
  "poke", "pole", "pond", "pony", "prey", "prod", "prow", "pulp", "raft",
  "reef", "reel", "rein", "roam", "robe", "rust", "sage", "sash", "scan",
  "scar", "shed", "sift", "slab", "slug", "snag", "soak", "soar", "sore",
  "span", "spur", "stag", "stew", "stub", "sway", "tame", "tart", "thorn",
  "toad", "toil", "tomb", "twig", "vale", "vane", "veil", "vine", "void",
  "wade", "wand", "wasp", "weed", "whim", "wick", "wilt", "wisp", "wren",
  "yawn",
];

// Tier 3: 5 letter words (levels 4-10)
// Includes top-100 common + Dolch 3rd grade + 3rd grade curriculum vocabulary
export const TIER_3_WORDS = [
  "about", "above", "admit", "adopt", "after", "again", "agree", "ahead", "alien",
  "alive", "allow", "alone", "along", "angry", "apart", "apple", "arena", "argue",
  "arise", "avoid", "award", "awful", "basic", "beach", "began", "begin", "being",
  "below", "birth", "black", "blade", "blame", "blank", "blast", "bleed", "blend",
  "blind", "block", "blood", "blown", "board", "bonus", "bound", "brain", "brand",
  "brave", "bread", "break", "brick", "brief", "bring", "broad", "broke", "brown",
  "brush", "buddy", "build", "built", "bunch", "burst", "buyer", "cabin", "carry",
  "catch", "cause", "chain", "chair", "cheap", "check", "cheek", "chest", "chief",
  "child", "china", "civil", "claim", "class", "clean", "clear", "climb", "cling",
  "clock", "close", "cloud", "coach", "coast", "color", "could", "count", "court",
  "cover", "crack", "craft", "crash", "crazy", "cream", "crime", "cross", "crowd",
  "crush", "curve", "cycle", "daily", "dance", "death", "delay", "depth", "dirty",
  "doubt", "dozen", "draft", "drain", "drama", "drank", "drawn", "dream", "dress",
  "dried", "drink", "drive", "drove", "dying", "eager", "early", "earth", "eight",
  "elite", "empty", "enemy", "enjoy", "enter", "equal", "error", "essay", "event",
  "every", "exact", "exist", "extra", "faith", "fault", "feast", "field", "fifty",
  "fight", "final", "first", "flame", "flash", "flesh", "float", "flood", "floor",
  "fluid", "focus", "force", "found", "frame", "frank", "fraud", "fresh", "front",
  "fruit", "fully", "giant", "given", "glass", "globe", "going", "grace", "grade",
  "grain", "grand", "grant", "grass", "grave", "great", "green", "gross", "group",
  "grown", "guard", "guess", "guest", "guide", "guilt", "happy", "heard", "heart",
  "heavy", "hello", "hence", "honor", "horse", "hotel", "house", "human", "humor",
  "ideal", "image", "imply", "index", "inner", "input", "issue", "joint", "judge",
  "juice", "known", "label", "large", "later", "laugh", "layer", "learn", "least",
  "leave", "legal", "level", "light", "limit", "live", "local", "lodge", "logic",
  "loose", "lover", "lower", "lucky", "lunch", "magic", "major", "maker", "march",
  "match", "mayor", "meant", "media", "mercy", "metal", "might", "minor", "minus",
  "mixed", "model", "money", "month", "moral", "motor", "mount", "mouse", "mouth",
  "movie", "music", "naked", "nerve", "never", "night", "noble", "noise", "north",
  "noted", "novel", "nurse", "occur", "ocean", "offer", "often", "order", "other",
  "ought", "outer", "owner", "paint", "panel", "paper", "party", "patch", "pause",
  "peace", "penny", "phase", "phone", "photo", "piano", "piece", "pilot", "pitch",
  "place", "plain", "plane", "plant", "plate", "plead", "point", "pound", "power",
  "press", "price", "pride", "prime", "print", "prior", "prize", "proof", "proud",
  "prove", "quick", "quiet", "quite", "quote", "radio", "raise", "range", "rapid",
  "ratio", "reach", "ready", "realm", "refer", "relax", "reply", "rider", "right",
  "river", "robin", "robot", "rocky", "roman", "rough", "round", "route", "royal",
  "ruler", "rural", "sadly", "sauce", "scale", "scene", "scope", "score", "sense",
  "serve", "seven", "shall", "shame", "shape", "share", "sharp", "sheet", "shelf",
  "shell", "shift", "shirt", "shock", "shoot", "shore", "short", "shout", "sight",
  "since", "sixth", "sixty", "skill", "sleep", "slide", "small", "smart", "smell",
  "smile", "smoke", "snake", "solid", "solve", "sorry", "sound", "south", "space",
  "spare", "speak", "speed", "spend", "spent", "spill", "split", "spoke", "sport",
  "spray", "squad", "staff", "stage", "stake", "stand", "stare", "start", "state",
  "steal", "steam", "steel", "steep", "stick", "stiff", "still", "stock", "stone",
  "stood", "store", "storm", "story", "stuff", "style", "sugar", "super", "surge",
  "swear", "sweet", "swing", "table", "taste", "teach", "teeth", "thank", "theme",
  "there", "thick", "thing", "think", "third", "those", "three", "threw", "throw",
  "tight", "tired", "title", "today", "total", "touch", "tough", "tower", "trace",
  "track", "trade", "trail", "train", "trait", "treat", "trend", "trial", "tribe",
  "trick", "tried", "troop", "truck", "truly", "trust", "truth", "twice", "twist",
  "uncle", "under", "union", "unite", "unity", "until", "upper", "upset", "urban",
  "usual", "valid", "value", "video", "virus", "visit", "vital", "vocal", "voice",
  "voter", "waste", "watch", "water", "weigh", "wheel", "where", "which", "while",
  "white", "whole", "whose", "woman", "women", "world", "worry", "worse", "worst",
  "worth", "would", "wound", "write", "wrong", "wrote", "yield", "young", "youth",
  // Dolch 3rd grade sight words (5 letter)
  "about", "bring", "carry", "clean", "could", "drink", "eight", "every",
  "found", "funny", "going", "green", "laugh", "light", "never", "only",
  "shall", "small", "start", "their", "these", "think", "those", "today",
  "under", "which", "would", "write",
  // 3rd grade curriculum vocabulary (5 letter)
  "acorn", "adore", "angel", "badge", "blaze", "bloom", "bluff", "boast",
  "braid", "brisk", "brook", "brood", "cedar", "charm", "chase", "choir",
  "cinch", "clasp", "cliff", "cloak", "comma", "coral", "couch", "crane",
  "creek", "crest", "crisp", "crouch", "crown", "decay", "decoy", "dizzy",
  "dough", "dwarf", "easel", "fable", "fetch", "fiber", "flare", "flock",
  "floss", "forge", "frost", "geese", "genre", "gleam", "glide", "globe",
  "goose", "graft", "grasp", "graze", "grove", "guess", "haiku", "hatch",
  "hedge", "hoist", "ivory", "jolly", "knack", "knead", "kneel", "ledge",
  "lever", "lilac", "linen", "maple", "marsh", "melon", "midge", "mirth",
  "moose", "notch", "novel", "orbit", "otter", "pansy", "perch", "petal",
  "plank", "plaza", "pleat", "pluck", "plumb", "poach", "poise", "poppy",
  "pouch", "prank", "prism", "prong", "prose", "prowl", "quail", "quake",
  "quest", "ranch", "raven", "ridge", "rinse", "ripen", "rival", "roost",
  "scald", "scalp", "scent", "scoop", "scorn", "scout", "scrub", "shale",
  "sheaf", "shear", "shrub", "siege", "sleek", "sleet", "sling", "slope",
  "smelt", "snare", "snout", "spear", "spice", "spine", "spoke", "squid",
  "stalk", "stall", "stomp", "stork", "stove", "strap", "stray", "strut",
  "stump", "swamp", "swarm", "sweep", "swirl", "talon", "thief", "thorn",
  "thump", "torch", "trout", "tulip", "vapor", "verse", "vigor", "wheat",
  "whirl", "wrath", "yacht",
];

// Tier 4: 6+ letter words (levels 7-10)
// Includes existing words + 3rd grade curriculum vocabulary
export const TIER_4_WORDS = [
  "accept", "access", "across", "action", "actual", "advice", "afford", "agency",
  "amount", "annual", "answer", "anyway", "appeal", "appear", "around", "arrive",
  "assess", "assume", "attack", "attend", "battle", "beauty", "became", "become",
  "before", "behind", "belong", "beside", "beyond", "bitter", "border", "bother",
  "bottom", "branch", "breath", "bridge", "bright", "broken", "budget", "burden",
  "butter", "button", "camera", "cancer", "carbon", "career", "castle", "caught",
  "center", "chance", "change", "charge", "choose", "chosen", "church", "circle",
  "client", "closed", "coffee", "column", "combat", "common", "comply", "cookie",
  "corner", "county", "couple", "course", "cousin", "create", "credit", "crisis",
  "custom", "damage", "danger", "dealer", "debate", "decade", "decide", "defeat",
  "defend", "define", "degree", "demand", "denied", "depend", "deploy", "desert",
  "design", "desire", "detail", "device", "differ", "dinner", "direct", "divide",
  "doctor", "dollar", "domain", "double", "driver", "during", "easily", "eating",
  "editor", "effect", "effort", "emerge", "empire", "employ", "enable", "energy",
  "engage", "engine", "enough", "ensure", "entire", "entity", "escape", "estate",
  "ethnic", "evolve", "exceed", "except", "expand", "expect", "expert", "export",
  "expose", "extend", "fabric", "factor", "failed", "fairly", "fallen", "family",
  "famous", "farmer", "father", "feline", "fellow", "female", "figure", "filing",
  "filter", "finger", "finish", "flying", "follow", "forest", "forget", "formal",
  "former", "foster", "frozen", "future", "galaxy", "garden", "gather", "gender",
  "gentle", "global", "golden", "govern", "ground", "growth", "guilty", "handle",
  "happen", "hardly", "health", "heaven", "height", "helped", "hidden", "honest",
  "hunger", "hunter", "ignore", "impact", "impose", "income", "indeed", "inform",
  "injury", "inside", "insist", "intend", "invest", "island", "itself", "jungle",
  "junior", "justice", "kidney", "killer", "kindly", "knight", "launch", "lawyer",
  "leader", "league", "length", "lesson", "letter", "likely", "linear", "listen",
  "little", "living", "lovely", "mainly", "manage", "manner", "marine", "marker",
  "market", "master", "matter", "medium", "member", "memory", "mental", "merely",
  "method", "middle", "mighty", "miller", "minute", "mirror", "misery", "modern",
  "moment", "monkey", "mostly", "mother", "motion", "museum", "mutual", "myself",
  "narrow", "nation", "native", "nature", "nearby", "nearly", "neatly", "nobody",
  "normal", "notice", "number", "object", "obtain", "occupy", "offend", "office",
  "online", "option", "origin", "output", "oxygen", "palace", "parent", "partly",
  "passed", "patent", "patrol", "paying", "people", "period", "permit", "person",
  "phrase", "picked", "planet", "player", "please", "plenty", "pocket", "poetry",
  "poison", "policy", "police", "polite", "prefer", "prince", "prison", "profit",
  "proper", "public", "pursue", "puzzle", "racial", "random", "rarely", "rather",
  "rating", "reader", "reason", "recall", "record", "reduce", "reform", "regard",
  "region", "reject", "relate", "relief", "remain", "remote", "remove", "render",
  "repeat", "report", "rescue", "resist", "resort", "result", "retail", "retain",
  "retire", "return", "reveal", "review", "reward", "rhythm", "riding", "ritual",
  "rocket", "ruling", "runner", "sacred", "safety", "salary", "sample", "saving",
  "scheme", "school", "screen", "search", "season", "secret", "secure", "select",
  "senate", "senior", "series", "settle", "severe", "shadow", "should", "signal",
  "silent", "silver", "simple", "simply", "single", "sister", "slight", "slowly",
  "smooth", "social", "softly", "source", "speech", "spirit", "spread", "spring",
  "square", "stable", "status", "steady", "stolen", "strain", "strand", "stream",
  "street", "stress", "strict", "strike", "string", "strong", "struck", "studio",
  "submit", "sudden", "suffer", "summer", "summit", "supply", "surely", "survey",
  "symbol", "talent", "target", "temple", "tenant", "terror", "thanks", "thirty",
  "threat", "throne", "tissue", "tomato", "tongue", "toward", "travel", "treaty",
  "tribal", "tricky", "trophy", "trying", "tunnel", "twelve", "unique", "united",
  "unlike", "update", "useful", "valley", "varied", "vendor", "versus", "victim",
  "viewer", "virtue", "vision", "visual", "volume", "warmly", "wealth", "weapon",
  "weekly", "weight", "window", "winner", "winter", "wisdom", "within", "wonder",
  "worker", "worthy", "yellow",
  // 3rd grade curriculum vocabulary (6+ letters)
  "absorb", "achieve", "ancient", "arrange", "balance", "bargain", "blossom",
  "boulder", "breathe", "browser", "burrow", "captain", "capture", "caution",
  "chapter", "climate", "collect", "colony", "comfort", "compare", "compass",
  "compete", "complex", "compose", "concert", "confirm", "connect", "contain",
  "content", "context", "control", "convert", "correct", "cottage", "counter",
  "country", "courage", "curious", "current", "cushion", "dazzle", "deliver",
  "describe", "destroy", "develop", "diagram", "diamond", "digital", "dinosaur",
  "discuss", "disease", "display", "distant", "dolphin", "edition", "educate",
  "element", "emerald", "emotion", "enormous", "example", "examine", "exercise",
  "explore", "express", "extreme", "Factory", "failure", "fashion", "feather",
  "fiction", "finally", "flutter", "fountain", "freedom", "frequent", "general",
  "genuine", "giraffe", "glimpse", "gradual", "grocery", "habitat", "halfway",
  "harvest", "history", "holiday", "horizon", "however", "hundred", "icicle",
  "imagine", "improve", "include", "increase", "instead", "insect", "inspect",
  "instant", "invent", "journey", "kitchen", "kingdom", "lantern", "leather",
  "library", "lizard", "machine", "magnify", "measure", "mention", "message",
  "million", "mineral", "mission", "mistake", "mixture", "monster", "morning",
  "mystery", "natural", "neither", "network", "nothing", "observe", "obvious",
  "opinion", "opposite", "orchard", "outline", "outside", "package", "pancake",
  "pattern", "penguin", "perfect", "perhaps", "picture", "pilgrim", "pioneer",
  "pitcher", "plastic", "popular", "portion", "possess", "practice", "predict",
  "prepare", "present", "pretend", "prevent", "primary", "problem", "produce",
  "program", "project", "promise", "protect", "provide", "publish", "pumpkin",
  "purpose", "quarter", "question", "rainbow", "receipt", "recycle", "reflect",
  "regular", "replace", "request", "require", "respect", "respond", "restore",
  "science", "scratch", "section", "selfish", "serious", "service", "shelter",
  "shiver", "silence", "similar", "skeleton", "society", "soldier", "special",
  "stadium", "stomach", "strange", "stretch", "subject", "subtract", "succeed",
  "suggest", "support", "suppose", "surface", "surround", "survive", "teacher",
  "terrific", "theater", "thought", "through", "thunder", "together", "tonight",
  "tornado", "traffic", "treasure", "trouble", "umbrella", "uniform", "vacation",
  "variety", "village", "volcano", "weather", "welcome", "whether", "whisper",
  "whistle", "wonder",
];

/** Get words for a Castle Raider level based on tier progression (deduplicated) */
export function getCRWordsForLevel(level: number): string[] {
  let words: string[];
  if (level <= 3) {
    words = [...TIER_1_WORDS, ...TIER_2_WORDS];
  } else if (level <= 6) {
    words = [...TIER_1_WORDS, ...TIER_2_WORDS, ...TIER_3_WORDS];
  } else {
    words = [...TIER_1_WORDS, ...TIER_2_WORDS, ...TIER_3_WORDS, ...TIER_4_WORDS];
  }
  return Array.from(new Set(words));
}

/** Pick a spelling challenge word, filtering out mastered words */
export function getSpellingChallengeWord(level: number): string {
  const profileState = useProfiles.getState();
  const profile = profileState.getActiveProfile();

  const pool = getCRWordsForLevel(level);

  // Filter out mastered words (SRS box >= 4)
  let filtered = pool;
  if (profile) {
    filtered = pool.filter(w => {
      const entry = profile.srs[w.toLowerCase()];
      return !entry || entry.box < 4;
    });
  }

  // Prefer weak words
  if (profile) {
    const weakWords = profileState.getWeakWords(10).map(w => w.toLowerCase());
    const weakInPool = weakWords.filter(w => filtered.includes(w));
    if (weakInPool.length > 0 && Math.random() < 0.4) {
      return weakInPool[Math.floor(Math.random() * weakInPool.length)];
    }
  }

  if (filtered.length === 0) filtered = pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
