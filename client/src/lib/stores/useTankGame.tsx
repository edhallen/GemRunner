import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useProfiles } from "./useProfiles";
import {
  LESSON_POINTS_BASE, SCORE_GEM, SCORE_LETTER_GEM_BONUS,
  SCORE_SPELLING_LETTER, SCORE_SPELLING_COMPLETE,
  SCORE_DEFEAT_PLATFORMER_ENEMY, MAX_PLATFORMER_MISSILES,
  SPEECH_RATE_SLOW, SPEECH_RATE_NORMAL,
  getTerrainHeight,
  CR_MAX_FIREBALLS, CR_FIREBALL_SPEED,
  CR_SCORE_GEM, CR_SCORE_COIN, CR_SCORE_DEFEAT_KNIGHT, CR_SCORE_SPELLING_CORRECT,
  CR_SCORE_BOSS_DEFEAT, CR_PIT_DAMAGE, CR_PIT_INVINCIBILITY_MS,
  CR_PRICE_HEALTH_POTION, CR_PRICE_EXTRA_LIFE, CR_PRICE_FLIGHT_POTION,
  CR_FLIGHT_DURATION_MS,
} from "@/lib/constants";
import { getSpellingChallengeWord } from "@/lib/topWords";
import { generateCastleRaiderLevel } from "@/lib/castleRaiderLevels";
import { speak, speakWord, speakLetter } from "@/lib/speech";
import {
  PHONICS_STAGES, SIGHT_WORDS, getStageWords, getReviewWords,
  getStageFamilies, findWordFamily, findWordFamilyGlobal, getWordBankByLevel,
  type WordFamily,
} from "@/lib/phonics";

export type GamePhase = "menu" | "quiz" | "game_mode_selection" | "tank_selection" | "dragon_selection" | "playing_tank" | "playing_platformer" | "playing_castle_raider" | "castle_raider_store" | "level_complete" | "game_over" | "leaderboard";

export type GameMode = "tank" | "platformer" | "castle_raider";

export type TankType = "light" | "medium" | "heavy" | "speed";

export type DragonType = "og" | "explorer" | "wizard" | "warrior" | "monk";

export const DRAGON_IMAGES: Record<DragonType, string> = {
  og: "/dragon-og.png",
  explorer: "/dragon-explorer.png",
  wizard: "/dragon-wizard.png",
  warrior: "/dragon-warrior.png",
  monk: "/dragon-monk.png",
};

export type QuizMode = "multiple_choice" | "typing" | "letter_sounds" | "word_family";

export interface BaseQuestion {
  id: string;
  type: "word" | "letter_recognition" | "letter_sound" | "letter_combination" | "sight_word" | "cvc_word";
  question: string;
  correctAnswer: string;
  level: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  mode: "multiple_choice";
  options: string[];
}

export interface TypingQuestion extends BaseQuestion {
  mode: "typing";
}

export interface LetterSoundsQuestion extends BaseQuestion {
  mode: "letter_sounds";
  options: string[];
  letterSound: string;
}

export interface WordFamilyQuestion extends BaseQuestion {
  mode: "word_family";
  options: string[];
  familyPattern: string; // e.g. "-at"
}

export type Question = MultipleChoiceQuestion | TypingQuestion | LetterSoundsQuestion | WordFamilyQuestion;

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  speed: number;
  lastShot: number;
  word?: string; // Sight word label for learning integration
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: "player" | "enemy";
  isMissile?: boolean;
}

export type PowerUpType = "health" | "speed" | "rapid_fire";

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
}

// Platformer-specific types
export interface PlatformerEnemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  isAlive: boolean;
  type: 'enemy1' | 'enemy2' | 'enemy3' | 'bird';
  health: number;
  maxHealth: number;
  // Bird-specific properties for arc movement
  arcStartX?: number;
  arcEndX?: number;
  arcHeight?: number;
  arcTime?: number; // Current time in arc (0 to 1)
  arcSpeed?: number; // Speed of arc traversal
  vy?: number; // Vertical velocity for birds
}

export interface Gem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  letter?: string; // Letter or word shown on the gem (for learning integration)
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PoopBlob {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Castle Raider types
export type CRKnightType = "basic_knight" | "armored_knight" | "dark_knight" | "skeleton" | "evil_knight" | "evil_dragon" | "beast" | "goblin";

export interface CastleRaiderKnight {
  id: string;
  x: number;
  y: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  isAlive: boolean;
  type: CRKnightType;
  health: number;
  maxHealth: number;
  speed: number;
}

export interface CastleRaiderGem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface CastleRaiderCoin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface CastleRaiderPit {
  id: string;
  startX: number;
  endX: number;
}

export interface CastleRaiderFireball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface CastleRaiderBossProjectile {
  id: string;
  x: number;
  y: number;
  vy: number;
  vx?: number;
}

export interface CRBossConfig {
  health: number;
  maxHealth: number;
  x: number;
}

export type DifficultyLevel = "letters" | "words";

interface TankGameState {
  phase: GamePhase;
  playerName: string;
  difficultyLevel: DifficultyLevel;
  selectedGameMode: GameMode | null;
  currentLevel: number;
  score: number;
  highScore: number;
  
  // Tank-specific state
  playerHealth: number;
  maxHealth: number;
  playerTank: TankType | null;
  playerX: number;
  playerY: number;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  activePowerUps: Set<PowerUpType>;
  powerUpEndTimes: Map<PowerUpType, number>;
  missileCount: number;
  
  // Platformer-specific state
  platformerPlayerX: number;
  platformerPlayerY: number;
  platformerPlayerVX: number;
  platformerPlayerVY: number;
  platformerIsGrounded: boolean;
  platformerPlayerHealth: number;
  platformerMaxHealth: number;
  platformerEnemies: PlatformerEnemy[];
  platformerGems: Gem[];
  platformerPlatforms: Platform[];
  platformerPoopBlobs: PoopBlob[];
  platformerMissiles: Bullet[];
  platformerReachedFlag: boolean;
  
  // Tank word-target state
  tankTargetWord: string | null; // The word the player must shoot
  tankTargetSpoken: boolean; // Whether the target has been spoken aloud

  // Platformer spelling challenge state
  spellingTargetWord: string | null; // Target word to spell by collecting letters in order
  spellingCollected: string[]; // Letters collected so far

  // Platformer word door state
  wordDoorActive: boolean;
  wordDoorWord: string | null; // correct word
  wordDoorOptions: string[]; // 3 options
  wordDoorCount: number; // doors shown this level (max 3)

  // Castle Raider state
  crPlayerX: number;
  crPlayerY: number;
  crPlayerVX: number;
  crPlayerVY: number;
  crIsGrounded: boolean;
  crPlayerHealth: number;
  crMaxHealth: number;
  crLives: number;
  crGemCount: number;
  crCoinCount: number;
  crKnights: CastleRaiderKnight[];
  crGems: CastleRaiderGem[];
  crCoins: CastleRaiderCoin[];
  crPlatforms: Platform[];
  crPits: CastleRaiderPit[];
  crFireballs: CastleRaiderFireball[];
  crBossProjectiles: CastleRaiderBossProjectile[];
  crBoss: CRBossConfig | null;
  crBossActive: boolean;
  crFacingRight: boolean;
  crLastSafeX: number;
  crLastSafeY: number;
  crInvincibleUntil: number;
  crFlightUntil: number;
  crFlightPotions: number;
  crHealthPotions: number;
  crSpellingChallengeActive: boolean;
  crSpellingWord: string | null;
  crSpellingCorrectCount: number; // counts toward treasure chest (3 needed)
  crLevelLength: number;

  // Shared state
  currentQuestion: Question | null;
  currentQuizMode: QuizMode | null;
  questionsAnswered: number;
  correctAnswers: number;
  quizQuestionsAnswered: number;
  quizCorrectAnswers: number;
  typingQuizCorrect: number;
  enemiesDefeated: number;
  powerUpsCollected: number;
  lessonPoints: number;

  setPhase: (phase: GamePhase) => void;
  setPlayerName: (name: string) => void;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  selectGameMode: (mode: GameMode) => void;
  selectedDragon: DragonType | null;
  selectDragon: (dragon: DragonType) => void;
  selectTank: (tank: TankType) => void;
  answerQuestion: (answer: string) => boolean;
  nextLevel: () => void;
  resetGame: () => void;
  
  // Tank methods
  updatePlayerPosition: (x: number, y: number) => void;
  takeDamage: (amount: number) => void;
  addScore: (points: number) => void;
  setEnemies: (enemies: Enemy[]) => void;
  setBullets: (bullets: Bullet[]) => void;
  removeEnemy: (id: string) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  setPowerUps: (powerUps: PowerUp[]) => void;
  collectPowerUp: (id: string, type: PowerUpType) => void;
  updatePowerUps: () => void;
  healPlayer: (amount: number) => void;
  fireMissile: () => boolean;
  
  // Platformer methods
  updatePlatformerPlayer: (x: number, y: number, vx: number, vy: number, grounded: boolean) => void;
  setPlatformerEnemies: (enemies: PlatformerEnemy[]) => void;
  updatePlatformerEnemy: (id: string, updates: Partial<PlatformerEnemy>) => void;
  damagePlatformerEnemy: (id: string, damage: number) => void;
  defeatPlatformerEnemy: (id: string) => void;
  collectGem: (id: string) => void;
  reachFlag: () => void;
  initializePlatformerLevel: () => void;
  setPlatformerMissiles: (missiles: Bullet[]) => void;
  firePlatformerMissile: (x: number, y: number) => void;
  destroyPoopBlob: (id: string) => void;
  takePlatformerDamage: (amount: number) => void;

  // Learning integration methods
  setTankTargetWord: (word: string | null) => void;
  checkTankTargetHit: (enemyId: string) => boolean; // Returns true if this enemy had the target word
  setSpellingTarget: (word: string | null) => void;
  collectSpellingLetter: (letter: string) => boolean; // Returns true if letter was next in sequence

  // Word door methods
  triggerWordDoor: () => void;
  answerWordDoor: (answer: string) => boolean;
  dismissWordDoor: () => void;

  // Castle Raider methods
  initializeCastleRaiderLevel: () => void;
  updateCRPlayer: (x: number, y: number, vx: number, vy: number, grounded: boolean) => void;
  setCRFacing: (right: boolean) => void;
  fireCRFireball: (x: number, y: number, facingRight: boolean) => void;
  setCRFireballs: (fireballs: CastleRaiderFireball[]) => void;
  setCRBossProjectiles: (projectiles: CastleRaiderBossProjectile[]) => void;
  damageCRKnight: (id: string, damage: number) => void;
  defeatCRKnight: (id: string) => void;
  setCRKnights: (knights: CastleRaiderKnight[]) => void;
  collectCRGem: (id: string) => void;
  collectCRCoin: (id: string) => void;
  takeCRDamage: (amount: number) => void;
  crFallInPit: () => void;
  damageCRBoss: (damage: number) => void;
  defeatCRBoss: () => void;
  startSpellingChallenge: () => void;
  answerSpellingChallenge: (answer: string) => boolean;
  dismissSpellingChallenge: () => void;
  useCRHealthPotion: () => void;
  useCRFlightPotion: () => void;
  buyCRItem: (item: "health_potion" | "extra_life" | "flight_potion") => boolean;
  updateCRLastSafe: (x: number, y: number) => void;
  setCRBossActive: (active: boolean) => void;
}

// Letter sounds for letter learning mode
// Maps each letter to its primary phonetic sound
const LETTER_SOUNDS: { [key: string]: string } = {
  'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh', 
  'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh', 
  'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh', 
  'P': 'puh', 'Q': 'kwuh', 'R': 'ruh', 'S': 'sss', 'T': 'tuh', 
  'U': 'uh', 'V': 'vuh', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zzz'
};

const ALL_LETTERS = Object.keys(LETTER_SOUNDS);

// Backward-compatible WORD_BANK export — now sourced from phonics stages
export const WORD_BANK = getWordBankByLevel();

// All phonics words (uppercase) for distractor generation
const ALL_PHONICS_WORDS = PHONICS_STAGES.flatMap(s => s.words.map(w => w.toUpperCase()));

// Select words for a quiz based on phonics stage and SRS priority
function selectQuizWord(): string {
  const profileState = useProfiles.getState();
  const profile = profileState.getActiveProfile();
  const stage = profile?.phonicsStage || 1;

  // 1. Overdue SRS words first
  const overdue = profileState.getOverdueWords();
  if (overdue.length > 0 && Math.random() < 0.4) {
    return overdue[Math.floor(Math.random() * overdue.length)];
  }

  // 2. Current stage words (60%)
  const stageWords = getStageWords(stage);
  // 3. Review from prior stages (30%)
  const reviewWords = getReviewWords(stage);
  // 4. Sight words (10%)

  const roll = Math.random();
  let pool: string[];
  if (roll < 0.6 || reviewWords.length === 0) {
    pool = stageWords;
  } else if (roll < 0.9) {
    pool = reviewWords.length > 0 ? reviewWords : stageWords;
  } else {
    pool = SIGHT_WORDS;
  }

  // Try weak words first
  const weakWords = profileState.getWeakWords(5).map(w => w.toLowerCase());
  const weakInPool = weakWords.filter(w => pool.includes(w));
  if (weakInPool.length > 0 && Math.random() < 0.6) {
    return weakInPool[Math.floor(Math.random() * weakInPool.length)];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// Generate distractors preferring same word family (harder, more educational)
const generateDistractors = (correctWord: string, count: number): string[] => {
  const distractors: string[] = [];
  const upper = correctWord.toUpperCase();

  // Try same family distractors first
  const family = findWordFamilyGlobal(correctWord);
  if (family) {
    const familyDistractors = family.words
      .filter(w => w.toUpperCase() !== upper)
      .map(w => w.toUpperCase());
    const shuffledFamily = familyDistractors.sort(() => Math.random() - 0.5);
    for (const d of shuffledFamily) {
      if (distractors.length >= count) break;
      distractors.push(d);
    }
  }

  // Fill remaining from similar-length words
  const wordLength = correctWord.length;
  const similarWords = ALL_PHONICS_WORDS.filter(w =>
    w !== upper &&
    !distractors.includes(w) &&
    Math.abs(w.length - wordLength) <= 1
  ).sort(() => Math.random() - 0.5);

  for (const w of similarWords) {
    if (distractors.length >= count) break;
    distractors.push(w);
  }

  // Last resort: any word
  if (distractors.length < count) {
    const remaining = ALL_PHONICS_WORDS.filter(w => w !== upper && !distractors.includes(w))
      .sort(() => Math.random() - 0.5);
    for (const w of remaining) {
      if (distractors.length >= count) break;
      distractors.push(w);
    }
  }

  return distractors.slice(0, count);
};

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get required lesson points for a given level
export const getRequiredLessonPoints = (level: number): number => {
  return LESSON_POINTS_BASE + level;
};

// Generate a letter sound question for letter learning mode
const getLetterSoundQuestion = (): LetterSoundsQuestion => {
  // Try to pick the correct answer from weak letters (adaptive)
  const weakLetters = useProfiles.getState().getWeakLetters(5);
  let correctLetter: string;
  if (weakLetters.length > 0 && Math.random() < 0.7) {
    // 70% chance to use a weak letter as the correct answer
    correctLetter = weakLetters[Math.floor(Math.random() * weakLetters.length)];
  } else {
    correctLetter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  }
  const correctLetterIndex = ALL_LETTERS.indexOf(correctLetter);

  // Pick 8 more unique letters for distractors
  const selectedLetterIndices: number[] = [correctLetterIndex];
  while (selectedLetterIndices.length < 9) {
    const randomIndex = Math.floor(Math.random() * ALL_LETTERS.length);
    if (!selectedLetterIndices.includes(randomIndex)) {
      selectedLetterIndices.push(randomIndex);
    }
  }

  const letterSound = LETTER_SOUNDS[correctLetter];
  
  // Create mix of upper and lower case letters from selected indices
  // Guarantee at least one uppercase and one lowercase letter
  const allOptions = selectedLetterIndices.map((index, i) => {
    const baseLetter = ALL_LETTERS[index];
    // First letter is always uppercase, second is always lowercase
    // Remaining 7 are randomly assigned
    if (i === 0) {
      return baseLetter.toUpperCase();
    } else if (i === 1) {
      return baseLetter.toLowerCase();
    } else {
      return Math.random() < 0.5 ? baseLetter.toUpperCase() : baseLetter.toLowerCase();
    }
  });
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(allOptions);
  
  return {
    id: `q-${Date.now()}-${Math.random()}`,
    type: "letter_sound",
    mode: "letter_sounds",
    question: `Click the letter you hear`,
    options: shuffledOptions,
    correctAnswer: correctLetter,
    letterSound: letterSound,
    level: 1
  };
};

// Generate a word_family question
const getWordFamilyQuestion = (level: number): WordFamilyQuestion | null => {
  const profileState = useProfiles.getState();
  const stage = profileState.getPhonicsStage();
  const families = getStageFamilies(stage);

  // Also include families from prior stages
  const allFamilies = [...families];
  for (let s = Math.max(1, stage - 2); s < stage; s++) {
    allFamilies.push(...getStageFamilies(s));
  }

  // Need a family with at least 3 words
  const usable = allFamilies.filter(f => f.words.length >= 3);
  if (usable.length === 0) return null;

  const family = usable[Math.floor(Math.random() * usable.length)];
  const correctWord = family.words[Math.floor(Math.random() * family.words.length)];

  // Options are all from the same family (shuffle)
  const options = shuffleArray([...family.words]).slice(0, Math.min(4, family.words.length))
    .map(w => w.toUpperCase());

  // Ensure correct answer is in options
  const upperCorrect = correctWord.toUpperCase();
  if (!options.includes(upperCorrect)) {
    options[0] = upperCorrect;
  }

  return {
    id: `q-${Date.now()}-${Math.random()}`,
    type: "word",
    mode: "word_family",
    question: `Which word do you hear?`,
    options: shuffleArray(options),
    correctAnswer: upperCorrect,
    familyPattern: family.pattern,
    level,
  };
};

// Generate a random question for a given level
const getQuestionForLevel = (level: number, mode?: QuizMode): Question | null => {
  // If letter_sounds mode, generate letter question
  if (mode === "letter_sounds") {
    return getLetterSoundQuestion();
  }

  // For words difficulty, select mode using rotation if not specified:
  // 33% multiple_choice, 33% word_family, 33% typing
  let quizMode: QuizMode = mode || (() => {
    const r = Math.random();
    if (r < 0.33) return "multiple_choice";
    if (r < 0.66) return "word_family";
    return "typing";
  })();

  if (quizMode === "word_family") {
    const q = getWordFamilyQuestion(level);
    if (q) return q;
    // Fallback to multiple_choice if no families available
    quizMode = "multiple_choice";
  }

  if (quizMode === "typing") {
    // Typing mode draws from phonics stage words (prefer 3-4 letter words)
    const word = selectQuizWord();
    const correctWord = word.length <= 4 ? word : selectQuizWord(); // prefer short words

    return {
      id: `q-${Date.now()}-${Math.random()}`,
      type: "word",
      mode: "typing",
      question: `Type the word you hear:`,
      correctAnswer: correctWord,
      level
    };
  }

  // multiple_choice
  const correctWord = selectQuizWord().toUpperCase();

  // Fewer options for younger/newer players, more as they improve
  const profileState = useProfiles.getState();
  const profile = profileState.getActiveProfile();
  const effectiveLevel = profile?.phonicsStage || 1;
  const baseOptions = profile && profile.totalAnswered < 10 ? 3 : 4;
  const numOptions = Math.min(9, Math.max(3, baseOptions + Math.floor(effectiveLevel / 3)));
  const numDistractors = numOptions - 1;

  const distractors = generateDistractors(correctWord, numDistractors);
  const allOptions = shuffleArray([correctWord, ...distractors]);

  return {
    id: `q-${Date.now()}-${Math.random()}`,
    type: "word",
    mode: "multiple_choice",
    question: `Which word is ${correctWord}?`,
    options: allOptions,
    correctAnswer: correctWord,
    level
  };
};

const loadHighScore = (): number => {
  try {
    const saved = localStorage.getItem("tankReaderHighScore");
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

const saveHighScore = (score: number) => {
  try {
    localStorage.setItem("tankReaderHighScore", score.toString());
  } catch (error) {
    console.error("Failed to save high score:", error);
  }
};

export const useTankGame = create<TankGameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    playerName: "",
    difficultyLevel: "words",
    selectedGameMode: null,
    currentLevel: 1,
    score: 0,
    highScore: loadHighScore(),
    
    // Tank state
    playerHealth: 100,
    maxHealth: 100,
    playerTank: null,
    selectedDragon: null,
    playerX: -8,
    playerY: 0,
    enemies: [],
    bullets: [],
    powerUps: [],
    activePowerUps: new Set(),
    powerUpEndTimes: new Map(),
    missileCount: 3,
    
    // Platformer state
    platformerPlayerX: 0,
    platformerPlayerY: 0,
    platformerPlayerVX: 0,
    platformerPlayerVY: 0,
    platformerIsGrounded: false,
    platformerPlayerHealth: 100,
    platformerMaxHealth: 100,
    platformerEnemies: [],
    platformerGems: [],
    platformerPlatforms: [],
    platformerPoopBlobs: [],
    platformerMissiles: [],
    platformerReachedFlag: false,
    
    // Tank word-target state
    tankTargetWord: null,
    tankTargetSpoken: false,

    // Platformer spelling challenge state
    spellingTargetWord: null,
    spellingCollected: [],

    // Platformer word door state
    wordDoorActive: false,
    wordDoorWord: null,
    wordDoorOptions: [],
    wordDoorCount: 0,

    // Castle Raider state
    crPlayerX: 2,
    crPlayerY: 0,
    crPlayerVX: 0,
    crPlayerVY: 0,
    crIsGrounded: false,
    crPlayerHealth: 100,
    crMaxHealth: 100,
    crLives: 1,
    crGemCount: 0,
    crCoinCount: 0,
    crKnights: [],
    crGems: [],
    crCoins: [],
    crPlatforms: [],
    crPits: [],
    crFireballs: [],
    crBossProjectiles: [],
    crBoss: null,
    crBossActive: false,
    crFacingRight: true,
    crLastSafeX: 2,
    crLastSafeY: 0,
    crInvincibleUntil: 0,
    crFlightUntil: 0,
    crFlightPotions: 0,
    crHealthPotions: 0,
    crSpellingChallengeActive: false,
    crSpellingWord: null,
    crSpellingCorrectCount: 0,
    crLevelLength: 120,

    // Shared state
    currentQuestion: null,
    currentQuizMode: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    quizQuestionsAnswered: 0,
    quizCorrectAnswers: 0,
    typingQuizCorrect: 0,
    enemiesDefeated: 0,
    powerUpsCollected: 0,
    lessonPoints: 0,

    setPhase: (phase) => {
      const { lessonPoints, typingQuizCorrect, currentLevel, currentQuizMode } = get();
      const requiredPoints = getRequiredLessonPoints(currentLevel);
      
      // Clear quiz session state when transitioning to phases that represent session breaks
      if (phase === "menu" || phase === "level_complete" || phase === "game_over" || phase === "castle_raider_store") {
        set({
          phase,
          currentQuizMode: null,
          typingQuizCorrect: 0,
        });
        return;
      }
      
      // Gate game mode selection and playing behind quiz completion requirements
      // BUT allow direct access to playing_platformer and playing_castle_raider (for TEST button)
      if (phase === "game_mode_selection" || phase === "tank_selection" || phase === "playing_tank") {
        let canAdvance = false;
        
        // Check requirements based on current quiz mode
        if (currentQuizMode === "typing" || currentQuizMode === "letter_sounds" || currentQuizMode === "word_family") {
          canAdvance = typingQuizCorrect >= 3;
        } else {
          canAdvance = lessonPoints >= requiredPoints;
        }
        
        if (!canAdvance) {
          // Continue with same quiz mode
          const question = getQuestionForLevel(currentLevel, currentQuizMode || undefined);
          set({ 
            phase: "quiz", 
            currentQuestion: question,
            quizQuestionsAnswered: 0,
            quizCorrectAnswers: 0,
            // Don't reset typing counter or quiz mode when re-entering quiz due to unmet requirements
          });
          return;
        }
      }
      
      if (phase === "quiz") {
        const { currentQuizMode: existingMode, difficultyLevel } = get();
        
        // Only select new quiz mode if we don't have one (starting fresh session)
        // If we already have a mode, keep it (mid-session retry)
        // For "letters" difficulty, use letter_sounds mode
        // For "words" difficulty, randomly choose between typing and multiple_choice
        const quizMode = existingMode || (
          difficultyLevel === "letters"
            ? "letter_sounds"
            : (() => {
                // Rotate through quiz modes for variety
                const r = Math.random();
                if (r < 0.33) return "multiple_choice" as const;
                if (r < 0.66) return "word_family" as const;
                return "typing" as const;
              })()
        );
        const isNewSession = !existingMode;
        
        const question = getQuestionForLevel(get().currentLevel, quizMode);
        
        if (isNewSession) {
          set({
            phase, 
            currentQuestion: question,
            currentQuizMode: quizMode,
            quizQuestionsAnswered: 0,
            quizCorrectAnswers: 0,
            typingQuizCorrect: 0, // Reset counters for new session
          });
        } else {
          set({
            phase, 
            currentQuestion: question,
            // Don't reset currentQuizMode or typingQuizCorrect for mid-session retry
            quizQuestionsAnswered: 0,
            quizCorrectAnswers: 0,
          });
        }
      } else {
        set({ phase });
      }
    },

    setPlayerName: (name) => {
      set({ playerName: name });
    },

    setDifficultyLevel: (level) => {
      set({ difficultyLevel: level });
    },

    selectGameMode: (mode) => {
      set({ selectedGameMode: mode });
      if (mode === "tank") {
        set({ phase: "tank_selection" });
      } else if (mode === "castle_raider") {
        set({ phase: "dragon_selection" });
      } else {
        // Platformer mode - initialize level and go straight to playing
        get().initializePlatformerLevel();
        set({ phase: "playing_platformer" });
      }
    },

    selectDragon: (dragon) => {
      set({ selectedDragon: dragon });
    },

    selectTank: (tank) => {
      set({ playerTank: tank });
    },

    answerQuestion: (answer) => {
      const { currentQuestion, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, lessonPoints, typingQuizCorrect } = get();
      if (!currentQuestion) return false;
      
      // Case-insensitive, trimmed comparison for answer
      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedCorrect = currentQuestion.correctAnswer.trim().toLowerCase();
      const isCorrect = normalizedAnswer === normalizedCorrect;

      // Track accuracy in profile
      const profileStore = useProfiles.getState();
      if (currentQuestion.mode === "letter_sounds") {
        profileStore.updateAccuracy(currentQuestion.correctAnswer, "letter", isCorrect);
      } else {
        profileStore.updateAccuracy(currentQuestion.correctAnswer, "word", isCorrect);
        // Update SRS for word-based questions
        profileStore.updateSrs(currentQuestion.correctAnswer, isCorrect);
        // Update phonics stage accuracy
        const stage = profileStore.getPhonicsStage();
        profileStore.updateStageAccuracy(stage, isCorrect);
      }

      // Check if word level should advance
      if (profileStore.shouldAdvanceWordLevel()) {
        profileStore.advanceWordLevel();
      }

      // Check if phonics stage should advance
      if (profileStore.shouldAdvancePhonicsStage()) {
        profileStore.advancePhonicsStage();
      }

      // Different scoring based on quiz mode
      if (currentQuestion.mode === "typing" || currentQuestion.mode === "letter_sounds" || currentQuestion.mode === "word_family") {
        // Typing, letter_sounds, word_family: no penalty for wrong answers, just track correct count
        const newTypingCorrect = isCorrect ? typingQuizCorrect + 1 : typingQuizCorrect;
        
        set({
          questionsAnswered: questionsAnswered + 1,
          correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
          quizQuestionsAnswered: quizQuestionsAnswered + 1,
          quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
          typingQuizCorrect: newTypingCorrect,
        });
      } else {
        // Multiple choice mode: +1 for correct, -1 for incorrect
        const newLessonPoints = isCorrect ? lessonPoints + 1 : Math.max(0, lessonPoints - 1);
        
        set({
          questionsAnswered: questionsAnswered + 1,
          correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
          quizQuestionsAnswered: quizQuestionsAnswered + 1,
          quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
          lessonPoints: newLessonPoints,
        });
      }

      return isCorrect;
    },

    nextLevel: () => {
      const { currentLevel, difficultyLevel, selectedGameMode } = get();
      const newLevel = currentLevel + 1;

      // Castle Raider has 10 levels
      const maxLevel = selectedGameMode === "castle_raider" ? 10 : 5;
      if (newLevel > maxLevel) {
        set({ currentLevel: newLevel, phase: "game_over" });
      } else if (selectedGameMode === "castle_raider") {
        // For castle raider, go to store between levels
        set({
          currentLevel: newLevel,
          phase: "castle_raider_store",
        });
      } else {
        // Select quiz mode based on difficulty level
        // For "letters" difficulty, use letter_sounds mode
        // For "words" difficulty, randomly choose between typing and multiple_choice
        const newQuizMode: QuizMode = difficultyLevel === "letters"
          ? "letter_sounds"
          : (() => {
              const r = Math.random();
              if (r < 0.33) return "multiple_choice";
              if (r < 0.66) return "word_family";
              return "typing";
            })();

        set({
          currentLevel: newLevel,
          phase: "quiz",
          selectedGameMode: null, // Reset game mode for new level
          currentQuizMode: newQuizMode, // Set new quiz mode for this level
          playerHealth: 100,
          playerX: -8,
          playerY: 0,
          enemies: [],
          bullets: [],
          // Reset platformer state
          platformerPlayerX: 0,
          platformerPlayerY: 0,
          platformerPlayerVX: 0,
          platformerPlayerVY: 0,
          platformerIsGrounded: false,
          platformerEnemies: [],
          platformerGems: [],
          platformerPlatforms: [],
          platformerPoopBlobs: [],
          platformerMissiles: [],
          platformerReachedFlag: false,
          wordDoorActive: false,
          wordDoorWord: null,
          wordDoorOptions: [],
          wordDoorCount: 0,
          currentQuestion: getQuestionForLevel(newLevel, newQuizMode),
          quizQuestionsAnswered: 0,
          quizCorrectAnswers: 0,
          typingQuizCorrect: 0, // Reset typing progress for new level
          lessonPoints: 0, // Reset lesson points for new level
          missileCount: 3, // Reset missiles for new level
        });
      }
    },

    resetGame: () => {
      set({
        phase: "menu",
        selectedGameMode: null,
        currentLevel: 1,
        score: 0,
        playerHealth: 100,
        maxHealth: 100,
        playerTank: null,
        selectedDragon: null,
        playerX: -8,
        playerY: 0,
        enemies: [],
        bullets: [],
        powerUps: [],
        activePowerUps: new Set(),
        powerUpEndTimes: new Map(),
        // Reset platformer state
        platformerPlayerX: 0,
        platformerPlayerY: 0,
        platformerPlayerVX: 0,
        platformerPlayerVY: 0,
        platformerIsGrounded: false,
        platformerEnemies: [],
        platformerGems: [],
        platformerPlatforms: [],
        platformerPoopBlobs: [],
        platformerMissiles: [],
        platformerReachedFlag: false,
        tankTargetWord: null,
        tankTargetSpoken: false,
        spellingTargetWord: null,
        spellingCollected: [],
        wordDoorActive: false,
        wordDoorWord: null,
        wordDoorOptions: [],
        wordDoorCount: 0,
        // Reset Castle Raider state
        crPlayerX: 2,
        crPlayerY: 0,
        crPlayerVX: 0,
        crPlayerVY: 0,
        crIsGrounded: false,
        crPlayerHealth: 100,
        crMaxHealth: 100,
        crLives: 1,
        crGemCount: 0,
        crCoinCount: 0,
        crKnights: [],
        crGems: [],
        crCoins: [],
        crPlatforms: [],
        crPits: [],
        crFireballs: [],
        crBossProjectiles: [],
        crBoss: null,
        crBossActive: false,
        crFacingRight: true,
        crLastSafeX: 2,
        crLastSafeY: 0,
        crInvincibleUntil: 0,
        crFlightUntil: 0,
        crFlightPotions: 0,
        crHealthPotions: 0,
        crSpellingChallengeActive: false,
        crSpellingWord: null,
        crSpellingCorrectCount: 0,
        crLevelLength: 120,
        enemiesDefeated: 0,
        powerUpsCollected: 0,
        currentQuestion: null,
        currentQuizMode: null, // Reset quiz mode
        questionsAnswered: 0,
        correctAnswers: 0,
        quizQuestionsAnswered: 0,
        quizCorrectAnswers: 0,
        typingQuizCorrect: 0,
        lessonPoints: 0,
        missileCount: 3,
      });
    },

    updatePlayerPosition: (x, y) => {
      set({ playerX: x, playerY: y });
    },

    takeDamage: (amount) => {
      const { playerHealth } = get();
      const newHealth = Math.max(0, playerHealth - amount);
      set({ playerHealth: newHealth });
      
      if (newHealth <= 0) {
        set({ phase: "game_over" });
      }
    },

    addScore: (points) => {
      set((state) => {
        const newScore = state.score + points;
        if (newScore > state.highScore) {
          saveHighScore(newScore);
          return { score: newScore, highScore: newScore };
        }
        return { score: newScore };
      });
    },

    setEnemies: (enemies) => {
      set({ enemies });
    },

    setBullets: (bullets) => {
      set({ bullets });
    },

    removeEnemy: (id) => {
      set((state) => ({
        enemies: state.enemies.filter(e => e.id !== id),
        enemiesDefeated: state.enemiesDefeated + 1,
      }));
    },

    updateEnemy: (id, updates) => {
      set((state) => ({
        enemies: state.enemies.map(e => 
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    },

    setPowerUps: (powerUps) => {
      set({ powerUps });
    },

    collectPowerUp: (id, type) => {
      const { activePowerUps, powerUpEndTimes, maxHealth, playerHealth } = get();
      const now = Date.now();
      
      const newActive = new Set(activePowerUps);
      newActive.add(type);
      
      const newEndTimes = new Map(powerUpEndTimes);
      newEndTimes.set(type, now + 10000);
      
      set((state) => ({
        powerUps: state.powerUps.filter(p => p.id !== id),
        activePowerUps: newActive,
        powerUpEndTimes: newEndTimes,
        powerUpsCollected: state.powerUpsCollected + 1,
      }));
      
      if (type === "health") {
        set({ playerHealth: Math.min(playerHealth + 30, maxHealth) });
      }
    },

    updatePowerUps: () => {
      const { activePowerUps, powerUpEndTimes } = get();
      const now = Date.now();
      const newActive = new Set(activePowerUps);
      const newEndTimes = new Map(powerUpEndTimes);
      
      let changed = false;
      activePowerUps.forEach(type => {
        const endTime = powerUpEndTimes.get(type);
        if (endTime && now > endTime) {
          newActive.delete(type);
          newEndTimes.delete(type);
          changed = true;
        }
      });
      
      if (changed) {
        set({ activePowerUps: newActive, powerUpEndTimes: newEndTimes });
      }
    },

    healPlayer: (amount) => {
      const { playerHealth, maxHealth } = get();
      set({ playerHealth: Math.min(playerHealth + amount, maxHealth) });
    },

    fireMissile: () => {
      return true;
    },

    // Platformer methods
    updatePlatformerPlayer: (x, y, vx, vy, grounded) => {
      set({ 
        platformerPlayerX: x, 
        platformerPlayerY: y, 
        platformerPlayerVX: vx, 
        platformerPlayerVY: vy,
        platformerIsGrounded: grounded
      });
    },

    setPlatformerEnemies: (enemies) => {
      set({ platformerEnemies: enemies });
    },

    updatePlatformerEnemy: (id, updates) => {
      set((state) => ({
        platformerEnemies: state.platformerEnemies.map(e =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    },

    damagePlatformerEnemy: (id, damage) => {
      const enemy = get().platformerEnemies.find(e => e.id === id);
      if (!enemy || !enemy.isAlive) return;
      
      const newHealth = Math.max(0, enemy.health - damage);
      
      if (newHealth <= 0) {
        // Enemy defeated
        get().defeatPlatformerEnemy(id);
      } else {
        // Enemy damaged but still alive
        set((state) => ({
          platformerEnemies: state.platformerEnemies.map(e =>
            e.id === id ? { ...e, health: newHealth } : e
          ),
        }));
      }
    },

    defeatPlatformerEnemy: (id) => {
      set((state) => ({
        platformerEnemies: state.platformerEnemies.map(e => 
          e.id === id ? { ...e, isAlive: false, health: 0 } : e
        ),
        enemiesDefeated: state.enemiesDefeated + 1,
      }));
      get().addScore(SCORE_DEFEAT_PLATFORMER_ENEMY);
    },

    collectGem: (id) => {
      const gem = get().platformerGems.find(g => g.id === id);
      if (!gem || gem.collected) return;

      set((state) => ({
        platformerGems: state.platformerGems.map(g =>
          g.id === id ? { ...g, collected: true } : g
        ),
      }));

      let bonusPoints = 0;

      // Speak the letter/word aloud when collected
      if (gem.letter) {
        speak(gem.letter.toLowerCase(), SPEECH_RATE_NORMAL);

        // Check spelling challenge
        const { spellingTargetWord, spellingCollected } = get();
        if (spellingTargetWord) {
          const nextLetter = spellingTargetWord[spellingCollected.length];
          if (gem.letter === nextLetter) {
            const newCollected = [...spellingCollected, gem.letter];
            set({ spellingCollected: newCollected });
            bonusPoints = SCORE_SPELLING_LETTER;

            // Completed the word!
            if (newCollected.length === spellingTargetWord.length) {
              bonusPoints = SCORE_SPELLING_COMPLETE;
              // Speak the completed word
              setTimeout(() => speakWord(spellingTargetWord), 500);
            }
          }
        }

        bonusPoints += SCORE_LETTER_GEM_BONUS;
      }

      get().addScore(SCORE_GEM + bonusPoints);
    },

    reachFlag: () => {
      set({ platformerReachedFlag: true });
      setTimeout(() => {
        set({ phase: "level_complete" });
      }, 1000);
    },

    initializePlatformerLevel: () => {
      const { currentLevel } = get();
      
      // Initialize player position
      set({
        platformerPlayerX: 2,
        platformerPlayerY: 2,
        platformerPlayerVX: 0,
        platformerPlayerVY: 0,
        platformerIsGrounded: false,
        platformerPlayerHealth: 100,
        platformerMissiles: [],
        platformerReachedFlag: false,
      });

      // Generate platforms - varied heights, all reachable, Mario/Sonic style
      // Positioned at least 1 character height above highest mountain (y >= -1.5)
      // 36 platforms spread across the 240-unit level
      const platforms: Platform[] = [
        { id: 'plat-1', x: 10, y: -0.9, width: 4, height: 0.5 },
        { id: 'plat-2', x: 16, y: -0.9, width: 3, height: 0.5 },
        { id: 'plat-3', x: 22, y: -0.9, width: 4, height: 0.5 },
        { id: 'plat-4', x: 28, y: -0.9, width: 3, height: 0.5 },
        { id: 'plat-5', x: 34, y: -0.0, width: 4, height: 0.5 },
        { id: 'plat-6', x: 40, y: -1.0, width: 3, height: 0.5 },
        { id: 'plat-7', x: 46, y: -0.8, width: 4, height: 0.5 },
        { id: 'plat-8', x: 52, y: -1.5, width: 3, height: 0.5 },
        { id: 'plat-9', x: 58, y: -1.1, width: 4, height: 0.5 },
        { id: 'plat-10', x: 64, y: -1.3, width: 3, height: 0.5 },
        { id: 'plat-11', x: 70, y: -1.5, width: 4, height: 0.5 },
        { id: 'plat-12', x: 76, y: -1.0, width: 3, height: 0.5 },
        { id: 'plat-13', x: 82, y: -1.4, width: 4, height: 0.5 },
        { id: 'plat-14', x: 88, y: -1.5, width: 3, height: 0.5 },
        { id: 'plat-15', x: 94, y: -1.1, width: 4, height: 0.5 },
        { id: 'plat-16', x: 100, y: -1.3, width: 3, height: 0.5 },
        { id: 'plat-17', x: 106, y: -1.5, width: 4, height: 0.5 },
        { id: 'plat-18', x: 112, y: -1.2, width: 3, height: 0.5 },
        { id: 'plat-19', x: 118, y: -1.4, width: 4, height: 0.5 },
        { id: 'plat-20', x: 124, y: -0.9, width: 3, height: 0.5 },
        { id: 'plat-21', x: 130, y: -1.3, width: 4, height: 0.5 },
        { id: 'plat-22', x: 136, y: -1.5, width: 3, height: 0.5 },
        { id: 'plat-23', x: 142, y: -1.0, width: 4, height: 0.5 },
        { id: 'plat-24', x: 148, y: -1.2, width: 3, height: 0.5 },
        { id: 'plat-25', x: 154, y: -1.5, width: 4, height: 0.5 },
        { id: 'plat-26', x: 160, y: -1.1, width: 3, height: 0.5 },
        { id: 'plat-27', x: 166, y: -1.4, width: 4, height: 0.5 },
        { id: 'plat-28', x: 172, y: -1.5, width: 3, height: 0.5 },
        { id: 'plat-29', x: 178, y: -0.9, width: 4, height: 0.5 },
        { id: 'plat-30', x: 184, y: -1.3, width: 3, height: 0.5 },
        { id: 'plat-31', x: 190, y: -1.5, width: 4, height: 0.5 },
        { id: 'plat-32', x: 196, y: -1.0, width: 3, height: 0.5 },
        { id: 'plat-33', x: 202, y: -1.4, width: 4, height: 0.5 },
        { id: 'plat-34', x: 208, y: -1.5, width: 3, height: 0.5 },
        { id: 'plat-35', x: 214, y: -1.1, width: 4, height: 0.5 },
        { id: 'plat-36', x: 220, y: -1.3, width: 3, height: 0.5 },
      ];

      // Lower all platforms, then ensure none overlap with terrain (hills)
      const adjustedPlatforms: Platform[] = platforms.map((platform) => {
        let adjustedY = platform.y - 2.5;
        // Check terrain height across the platform's horizontal span
        const halfW = platform.width / 2;
        let maxTerrain = -Infinity;
        for (let sx = platform.x - halfW; sx <= platform.x + halfW; sx += 0.5) {
          maxTerrain = Math.max(maxTerrain, getTerrainHeight(sx));
        }
        // Platform bottom must be above the highest terrain point under it (with 0.5 gap)
        const platformBottom = adjustedY - platform.height / 2;
        const minBottom = maxTerrain + 0.5;
        if (platformBottom < minBottom) {
          adjustedY = minBottom + platform.height / 2;
        }
        return { ...platform, y: adjustedY };
      });

      // Determine difficulty and pick letters/words for labeled gems
      const { difficultyLevel } = get();
      const profileState = useProfiles.getState();
      const profile = profileState.getActiveProfile();

      // Pick a spelling target word for platformer mode using phonics stage
      let spellingWord: string | null = null;
      if (difficultyLevel === "words" && profile) {
        const stage = profile.phonicsStage || 1;
        const words = getStageWords(stage).map(w => w.toUpperCase());
        const shortWords = words.filter(w => w.length >= 3 && w.length <= 5);
        if (shortWords.length > 0) {
          spellingWord = shortWords[Math.floor(Math.random() * shortWords.length)];
        }
      } else if (difficultyLevel === "letters") {
        // Use CVC words from stage 1 for letters difficulty
        const words = getStageWords(1).map(w => w.toUpperCase());
        const simpleWords = words.filter(w => w.length === 3);
        if (simpleWords.length > 0) {
          spellingWord = simpleWords[Math.floor(Math.random() * simpleWords.length)];
        }
      }

      // Generate gems on platforms and scattered on terrain
      const gems: Gem[] = [];
      let gemIdCounter = 0;

      // For spelling challenge: place spelling letters on the first few platforms in order
      const spellingLetters = spellingWord ? spellingWord.split("") : [];
      let spellingLetterIndex = 0;

      // Add rows of gems on top of each platform
      adjustedPlatforms.forEach((platform, platformIndex) => {
        const numGemsOnPlatform = Math.floor(platform.width / 0.8);
        const startX = platform.x - (numGemsOnPlatform - 1) * 0.8 / 2;
        const gemY = platform.y + platform.height / 2 + 0.8;

        for (let i = 0; i < numGemsOnPlatform; i++) {
          let letter: string | undefined;

          // Place spelling letters on center gems of early platforms
          if (spellingLetterIndex < spellingLetters.length && i === Math.floor(numGemsOnPlatform / 2)) {
            letter = spellingLetters[spellingLetterIndex];
            spellingLetterIndex++;
          }
          // For remaining gems, ~30% get a random letter/word label
          else if (Math.random() < 0.3) {
            if (difficultyLevel === "letters") {
              letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
            } else {
              // Show individual letters from the word bank for word mode too
              letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
            }
          }

          gems.push({
            id: `gem-${gemIdCounter++}`,
            x: startX + i * 0.8,
            y: gemY,
            collected: false,
            letter,
          });
        }
      });

      // Add some scattered gems on terrain for variety
      const numScatteredGems = 3 + currentLevel;
      for (let i = 0; i < numScatteredGems; i++) {
        let letter: string | undefined;
        if (Math.random() < 0.4) {
          letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
        }
        gems.push({
          id: `gem-${gemIdCounter++}`,
          x: 5 + i * 4,
          y: -3 + Math.random() * 2,
          collected: false,
          letter,
        });
      }

      // Generate enemies (many more enemies for longer levels)
      const numEnemies = 5 + currentLevel * 2;
      const enemies: PlatformerEnemy[] = [];
      const enemyTypes: Array<'enemy1' | 'enemy2' | 'enemy3' | 'bird'> = ['enemy1', 'enemy2', 'enemy3', 'bird'];
      
      // Spread enemies evenly across the level (from x=8 to x=235)
      const levelStart = 8;
      const levelEnd = 235; // Leave space before flag at 240
      const spacing = (levelEnd - levelStart) / Math.max(1, numEnemies - 1);
      
      for (let i = 0; i < numEnemies; i++) {
        const x = levelStart + (i * spacing);
        const y = 0.5; // Will be adjusted to terrain height in game loop
        const type = enemyTypes[i % enemyTypes.length]; // Cycle through enemy types
        
        // Different enemy types have different health
        let maxHealth = 3; // Default health (requires 3 missile hits)
        if (type === 'enemy2') {
          maxHealth = 4; // Green blob is tougher
        } else if (type === 'enemy3') {
          maxHealth = 5; // Robot skeleton is toughest
        } else if (type === 'bird') {
          maxHealth = 2; // Birds are lighter/faster
        }
        
        const baseEnemy: PlatformerEnemy = {
          id: `enemy-${i}`,
          x: x,
          y: y,
          vx: 0.5 + (Math.random() * 0.3), // Varied speed for variety
          patrolLeft: Math.max(levelStart, x - 4),
          patrolRight: Math.min(levelEnd, x + 4),
          isAlive: true,
          type: type,
          health: maxHealth,
          maxHealth: maxHealth,
        };
        
        // Add bird-specific arc movement properties
        if (type === 'bird') {
          // Birds fly in arcs across the screen
          const arcWidth = 15 + Math.random() * 10; // Arc width between 15-25 units
          const arcStartX = Math.max(levelStart, x - arcWidth / 2);
          const arcEndX = Math.min(levelEnd, x + arcWidth / 2);
          const arcHeight = 3 + Math.random() * 4; // Arc height between 3-7 units above ground
          
          baseEnemy.arcStartX = arcStartX;
          baseEnemy.arcEndX = arcEndX;
          baseEnemy.arcHeight = arcHeight;
          baseEnemy.arcTime = Math.random(); // Start at random point in arc
          baseEnemy.arcSpeed = (0.3 + Math.random() * 0.2) * 0.25; // 25% of previous speed
          baseEnemy.vy = 0; // Will be calculated in movement loop
          baseEnemy.y = -2 + Math.random() * 2; // Start at random height in air
        }
        
        enemies.push(baseEnemy);
      }

      // Generate poop blobs (obstacles on the ground that player must jump over)
      const numPoopBlobs = 3 + currentLevel * 2;
      const poopBlobs: PoopBlob[] = [];
      const blobWidth = 1.2;
      
      // Spread poop blobs evenly across the level, accounting for their width
      const blobStart = 12 + blobWidth / 2; // Account for left edge
      const blobEnd = 228 - blobWidth / 2; // Account for right edge, leave space before flag at 240
      const blobSpacing = numPoopBlobs > 1 ? (blobEnd - blobStart) / (numPoopBlobs - 1) : 0;
      
      for (let i = 0; i < numPoopBlobs; i++) {
        const x = blobStart + (i * blobSpacing);
        poopBlobs.push({
          id: `poop-${i}`,
          x: x,
          y: -4.75, // Ground level (GROUND_Y is -5)
          width: blobWidth,
          height: 0.8,
        });
      }

      set({
        platformerGems: gems,
        platformerEnemies: enemies,
        platformerPlatforms: adjustedPlatforms,
        platformerPoopBlobs: poopBlobs,
        spellingTargetWord: spellingWord,
        spellingCollected: [],
      });
    },

    setPlatformerMissiles: (missiles) => {
      set({ platformerMissiles: missiles });
    },

    firePlatformerMissile: (x, y) => {
      if (get().platformerMissiles.length >= MAX_PLATFORMER_MISSILES) return;

      const newMissile: Bullet = {
        id: `missile-${Date.now()}-${Math.random()}`,
        x: x + 0.5, // Spawn slightly ahead of player
        y: y,
        vx: 1, // Horizontal velocity (will be multiplied by speed in scene)
        vy: 0,
        owner: "player",
        isMissile: true,
      };
      
      set((state) => ({
        platformerMissiles: [...state.platformerMissiles, newMissile],
      }));
    },

    destroyPoopBlob: (id) => {
      set((state) => ({
        platformerPoopBlobs: state.platformerPoopBlobs.filter(blob => blob.id !== id),
      }));
    },

    takePlatformerDamage: (amount) => {
      const { platformerPlayerHealth } = get();
      const newHealth = Math.max(0, platformerPlayerHealth - amount);

      set({ platformerPlayerHealth: newHealth });

      if (newHealth <= 0) {
        set({ phase: "game_over" });
      }
    },

    // Learning integration methods
    setTankTargetWord: (word) => {
      set({ tankTargetWord: word, tankTargetSpoken: false });
    },

    checkTankTargetHit: (enemyId) => {
      const { enemies, tankTargetWord } = get();
      const enemy = enemies.find(e => e.id === enemyId);
      if (!enemy || !tankTargetWord || !enemy.word) return false;
      return enemy.word.toUpperCase() === tankTargetWord.toUpperCase();
    },

    setSpellingTarget: (word) => {
      set({ spellingTargetWord: word, spellingCollected: [] });
    },

    collectSpellingLetter: (letter) => {
      const { spellingTargetWord, spellingCollected } = get();
      if (!spellingTargetWord) return false;
      const nextLetter = spellingTargetWord[spellingCollected.length];
      if (letter.toUpperCase() === nextLetter?.toUpperCase()) {
        set({ spellingCollected: [...spellingCollected, letter] });
        return true;
      }
      return false;
    },

    // Word door methods
    triggerWordDoor: () => {
      const { wordDoorCount, wordDoorActive } = get();
      if (wordDoorActive || wordDoorCount >= 3) return;

      const profileState = useProfiles.getState();
      const stage = profileState.getPhonicsStage();
      const words = getStageWords(stage);
      if (words.length < 3) return;

      const shuffled = [...words].sort(() => Math.random() - 0.5);
      const correct = shuffled[0].toUpperCase();
      const options = shuffleArray([
        correct,
        shuffled[1].toUpperCase(),
        shuffled[2].toUpperCase(),
      ]);

      speakWord(correct);
      set({
        wordDoorActive: true,
        wordDoorWord: correct,
        wordDoorOptions: options,
        wordDoorCount: wordDoorCount + 1,
      });
    },

    answerWordDoor: (answer) => {
      const { wordDoorWord } = get();
      const correct = answer.toUpperCase() === wordDoorWord?.toUpperCase();

      if (correct) {
        speak(`Yes! ${wordDoorWord?.toLowerCase()}!`, 1.0);
      } else {
        speakWord(wordDoorWord || "");
      }

      // Dismiss after brief delay
      setTimeout(() => {
        set({ wordDoorActive: false, wordDoorWord: null, wordDoorOptions: [] });
      }, correct ? 1000 : 2000);

      return correct;
    },

    dismissWordDoor: () => {
      set({ wordDoorActive: false, wordDoorWord: null, wordDoorOptions: [] });
    },

    // Castle Raider methods
    initializeCastleRaiderLevel: () => {
      const { currentLevel, crGemCount, crCoinCount, crLives, crFlightPotions, crHealthPotions, difficultyLevel } = get();
      const level = generateCastleRaiderLevel(currentLevel, difficultyLevel);

      set({
        crPlayerX: 2,
        crPlayerY: 0,
        crPlayerVX: 0,
        crPlayerVY: 0,
        crIsGrounded: false,
        crPlayerHealth: 100,
        crMaxHealth: 100,
        // Preserve gems/coins/lives/potions across levels
        crGemCount,
        crCoinCount,
        crLives,
        crFlightPotions,
        crHealthPotions,
        crKnights: level.knights,
        crGems: level.gems,
        crCoins: level.coins,
        crPlatforms: level.platforms,
        crPits: level.pits,
        crFireballs: [],
        crBossProjectiles: [],
        crBoss: level.boss,
        crBossActive: false,
        crFacingRight: true,
        crLastSafeX: 2,
        crLastSafeY: 0,
        crInvincibleUntil: 0,
        crFlightUntil: 0,
        crSpellingChallengeActive: false,
        crSpellingWord: null,
        crSpellingCorrectCount: 0,
        crLevelLength: level.levelLength,
      });
    },

    updateCRPlayer: (x, y, vx, vy, grounded) => {
      set({ crPlayerX: x, crPlayerY: y, crPlayerVX: vx, crPlayerVY: vy, crIsGrounded: grounded });
    },

    setCRFacing: (right) => {
      set({ crFacingRight: right });
    },

    fireCRFireball: (x, y, facingRight) => {
      if (get().crFireballs.length >= CR_MAX_FIREBALLS) return;
      const fb: CastleRaiderFireball = {
        id: `fb-${Date.now()}-${Math.random()}`,
        x: x + (facingRight ? 0.5 : -0.5),
        y,
        vx: facingRight ? CR_FIREBALL_SPEED : -CR_FIREBALL_SPEED,
        vy: 0,
      };
      set(state => ({ crFireballs: [...state.crFireballs, fb] }));
    },

    setCRFireballs: (fireballs) => {
      set({ crFireballs: fireballs });
    },

    setCRBossProjectiles: (projectiles) => {
      set({ crBossProjectiles: projectiles });
    },

    damageCRKnight: (id, damage) => {
      const knight = get().crKnights.find(k => k.id === id);
      if (!knight || !knight.isAlive) return;
      const newHealth = Math.max(0, knight.health - damage);
      if (newHealth <= 0) {
        get().defeatCRKnight(id);
      } else {
        set(state => ({
          crKnights: state.crKnights.map(k => k.id === id ? { ...k, health: newHealth } : k),
        }));
      }
    },

    defeatCRKnight: (id) => {
      set(state => ({
        crKnights: state.crKnights.map(k => k.id === id ? { ...k, isAlive: false, health: 0 } : k),
        enemiesDefeated: state.enemiesDefeated + 1,
      }));
      get().addScore(CR_SCORE_DEFEAT_KNIGHT);
    },

    setCRKnights: (knights) => {
      set({ crKnights: knights });
    },

    collectCRGem: (id) => {
      const gem = get().crGems.find(g => g.id === id);
      if (!gem || gem.collected) return;
      set(state => ({
        crGems: state.crGems.map(g => g.id === id ? { ...g, collected: true } : g),
        crGemCount: state.crGemCount + 1,
      }));
      get().addScore(CR_SCORE_GEM);
    },

    collectCRCoin: (id) => {
      const coin = get().crCoins.find(c => c.id === id);
      if (!coin || coin.collected) return;
      set(state => ({
        crCoins: state.crCoins.map(c => c.id === id ? { ...c, collected: true } : c),
        crCoinCount: state.crCoinCount + 1,
      }));
      get().addScore(CR_SCORE_COIN);
    },

    takeCRDamage: (amount) => {
      const { crPlayerHealth, crInvincibleUntil, crLives } = get();
      if (Date.now() < crInvincibleUntil) return;
      const newHealth = Math.max(0, crPlayerHealth - amount);
      set({ crPlayerHealth: newHealth });
      if (newHealth <= 0) {
        if (crLives > 0) {
          // Use a life - respawn
          set({
            crLives: crLives - 1,
            crPlayerHealth: 100,
            crPlayerX: get().crLastSafeX,
            crPlayerY: get().crLastSafeY,
            crPlayerVX: 0,
            crPlayerVY: 0,
            crInvincibleUntil: Date.now() + CR_PIT_INVINCIBILITY_MS,
          });
        } else {
          set({ phase: "game_over" });
        }
      }
    },

    crFallInPit: () => {
      const { crInvincibleUntil } = get();
      if (Date.now() < crInvincibleUntil) return;
      const { crPlayerHealth, crLives, crLastSafeX, crLastSafeY } = get();
      const newHealth = Math.max(0, crPlayerHealth - CR_PIT_DAMAGE);
      if (newHealth <= 0 && crLives <= 0) {
        set({ crPlayerHealth: 0, phase: "game_over" });
        return;
      }
      if (newHealth <= 0 && crLives > 0) {
        set({
          crLives: crLives - 1,
          crPlayerHealth: 100,
          crPlayerX: crLastSafeX,
          crPlayerY: crLastSafeY,
          crPlayerVX: 0,
          crPlayerVY: 0,
          crInvincibleUntil: Date.now() + CR_PIT_INVINCIBILITY_MS,
        });
      } else {
        set({
          crPlayerHealth: newHealth,
          crPlayerX: crLastSafeX,
          crPlayerY: crLastSafeY,
          crPlayerVX: 0,
          crPlayerVY: 0,
          crInvincibleUntil: Date.now() + CR_PIT_INVINCIBILITY_MS,
        });
      }
    },

    damageCRBoss: (damage) => {
      const boss = get().crBoss;
      if (!boss) return;
      const newHealth = Math.max(0, boss.health - damage);
      set({ crBoss: { ...boss, health: newHealth } });
      if (newHealth <= 0) {
        get().defeatCRBoss();
      }
    },

    defeatCRBoss: () => {
      get().addScore(CR_SCORE_BOSS_DEFEAT);
      set({ crBoss: null, crBossActive: false, crBossProjectiles: [] });
      setTimeout(() => {
        set({ phase: "level_complete" });
      }, 1500);
    },

    startSpellingChallenge: () => {
      const { currentLevel, difficultyLevel } = get();
      if (difficultyLevel === "letters") {
        const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
        speakLetter(letter);
        set({ crSpellingChallengeActive: true, crSpellingWord: letter });
      } else {
        const word = getSpellingChallengeWord(currentLevel);
        speakWord(word);
        set({ crSpellingChallengeActive: true, crSpellingWord: word });
      }
    },

    answerSpellingChallenge: (answer) => {
      const { crSpellingWord, crSpellingCorrectCount, crPlayerHealth, crMaxHealth, crLives, difficultyLevel } = get();
      if (!crSpellingWord) return false;
      const correct = answer.trim().toLowerCase() === crSpellingWord.toLowerCase();

      const profileStore = useProfiles.getState();
      profileStore.updateSrs(crSpellingWord, correct);
      profileStore.updateAccuracy(crSpellingWord, difficultyLevel === "letters" ? "letter" : "word", correct);

      if (correct) {
        get().addScore(CR_SCORE_SPELLING_CORRECT);
        const newCount = crSpellingCorrectCount + 1;
        set({ crSpellingCorrectCount: newCount });

        // Treasure chest every 3 correct
        if (newCount % 3 === 0) {
          const roll = Math.random();
          if (roll < 0.4) {
            // Health restore
            set({ crPlayerHealth: crMaxHealth });
          } else if (roll < 0.7) {
            // Extra life
            set({ crLives: crLives + 1 });
          } else {
            // Flight potion
            set(state => ({ crFlightPotions: state.crFlightPotions + 1 }));
          }
        }
      } else {
        // Show correct answer via speech
        if (difficultyLevel === "letters") {
          setTimeout(() => speakLetter(crSpellingWord || ""), 500);
        } else {
          setTimeout(() => speakWord(crSpellingWord || ""), 500);
        }
      }

      return correct;
    },

    dismissSpellingChallenge: () => {
      set({ crSpellingChallengeActive: false, crSpellingWord: null });
    },

    useCRHealthPotion: () => {
      const { crHealthPotions, crPlayerHealth, crMaxHealth } = get();
      if (crHealthPotions <= 0) return;
      set({
        crHealthPotions: crHealthPotions - 1,
        crPlayerHealth: Math.min(crPlayerHealth + 50, crMaxHealth),
      });
    },

    useCRFlightPotion: () => {
      const { crFlightPotions } = get();
      if (crFlightPotions <= 0) return;
      set({
        crFlightPotions: crFlightPotions - 1,
        crFlightUntil: Date.now() + CR_FLIGHT_DURATION_MS,
      });
    },

    buyCRItem: (item) => {
      const { crGemCount } = get();
      let cost = 0;
      if (item === "health_potion") cost = CR_PRICE_HEALTH_POTION;
      else if (item === "extra_life") cost = CR_PRICE_EXTRA_LIFE;
      else if (item === "flight_potion") cost = CR_PRICE_FLIGHT_POTION;

      if (crGemCount < cost) return false;

      set({ crGemCount: crGemCount - cost });
      if (item === "health_potion") {
        set(state => ({ crHealthPotions: state.crHealthPotions + 1 }));
      } else if (item === "extra_life") {
        set(state => ({ crLives: state.crLives + 1 }));
      } else if (item === "flight_potion") {
        set(state => ({ crFlightPotions: state.crFlightPotions + 1 }));
      }
      return true;
    },

    updateCRLastSafe: (x, y) => {
      set({ crLastSafeX: x, crLastSafeY: y });
    },

    setCRBossActive: (active) => {
      set({ crBossActive: active });
    },
  }))
);
