import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useProfiles } from "./useProfiles";
import {
  LESSON_POINTS_BASE, SCORE_GEM, SCORE_LETTER_GEM_BONUS,
  SCORE_SPELLING_LETTER, SCORE_SPELLING_COMPLETE,
  SCORE_DEFEAT_PLATFORMER_ENEMY, MAX_PLATFORMER_MISSILES,
  SPEECH_RATE_SLOW, SPEECH_RATE_NORMAL,
} from "@/lib/constants";
import { speak } from "@/lib/speech";

export type GamePhase = "menu" | "quiz" | "game_mode_selection" | "tank_selection" | "playing_tank" | "playing_platformer" | "level_complete" | "game_over" | "leaderboard";

export type GameMode = "tank" | "platformer";

export type TankType = "light" | "medium" | "heavy" | "speed";

export type QuizMode = "multiple_choice" | "typing" | "letter_sounds";

export interface BaseQuestion {
  id: string;
  type: "word" | "letter_recognition" | "letter_sound" | "letter_combination" | "sight_word" | "cvc_word" | "blend_sound";
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

export type Question = MultipleChoiceQuestion | TypingQuestion | LetterSoundsQuestion;

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

  // Shared state
  currentQuestion: Question | null;
  currentQuizMode: "typing" | "multiple_choice" | "letter_sounds" | null;
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

// Simple word list for typing quiz mode
// Most common English words suitable for typing practice
const TYPING_WORDS = [
  "this", "them", "that", "the", "is", "it", "who", "what", "am", "and",
  "he", "she", "of", "was", "have", "said", "can", "in", "his", "her",
  "your", "game", "from", "are", "name", "lego", "go", "to", "star", "wars"
];

// Comprehensive word bank with 200+ words organized by difficulty (exported for use in game scenes)
// Includes high-frequency English words and Star Wars vocabulary
export const WORD_BANK = {
  level1: [
    // Basic sight words and simple 2-3 letter words
    "IT", "IS", "THE", "CAT", "DOG", "BIG", "RUN", "SIT", "CUP", "PAN", 
    "BOX", "ZOO", "RED", "HOT", "EAT", "END", "BAT", "HAT", "SUN", "BED",
    "FLY", "LOW", "GO", "GET", "SEE", "SAW", "DAY", "WAY", "BOY", "MAN",
    "OLD", "NEW", "TOP", "POP", "MOM", "DAD", "YES", "HIM", "HER", "SHE",
    "HIS", "HAS", "HAD", "CAN", "MAY", "BUT", "NOT", "OUT", "OFF", "NOW"
  ],
  level2: [
    // Common 4-letter words and basic Star Wars terms
    "THIS", "THAT", "WHAT", "WHO", "HOW", "FISH", "JUMP", "STOP", "FOOD", 
    "COLD", "HIGH", "BLUE", "PINK", "TANK", "GAME", "STAR", "SHIP", "LOOK", "KING", "WET",
    "WARS", "GOOD", "HELP", "OVER", "COME", "MADE", "TAKE", "JUST", "KNOW", "OPEN",
    "GIRL", "BABY", "HOME", "MAKE", "THEM", "WANT", "FIND", "WENT", "CALL", "LIVE",
    "BEEN", "WORK", "HOPE", "HERO", "SAVE", "FREE", "DARK", "TURN", "FIRE", "WAR"
  ],
  level3: [
    // Intermediate words with blends and common vocabulary
    "WHICH", "START", "CHOOSE", "YELLOW", "GREEN", "BLACK", "WHITE", "PLAY", 
    "TREE", "QUIT", "VEST", "NEST", "BEST", "WEST", "FROG", "MILK", "CLOCK", "GRASS", "SNAP", "WHEN",
    "THINK", "WATER", "THEIR", "PLACE", "POWER", "SPACE", "FORCE", "LIGHT", "FIGHT", "REBEL",
    "PEACE", "YOUNG", "BRAVE", "TRUST", "WORLD", "FOUND", "DREAM", "HEART", "HAPPY", "FRIEND",
    "SMALL", "WHERE", "WRITE", "ABOUT", "OFTEN", "FIRST", "HOUSE", "STORY", "TEACH", "LEARN"
  ],
  level4: [
    // Advanced words with complex patterns (50 words)
    "QUICK", "BRING", "THANK", "PLANT", "STAND", "GRAND", "BRAND",
    "BLEND", "SPEND", "TREND", "FLOAT", "GREAT", "TREAT", "SPEED", "QUEEN", "GRAPE", "CRAVE", "SWING",
    "ESCAPE", "ATTACK", "MASTER", "RESCUE", "DANGER", "SHIELD", "WEAPON", "EMPIRE", "GALAXY", "PLANET",
    "BEFORE", "ALWAYS", "SECOND", "FAMILY", "SCHOOL", "BELONG", "NUMBER", "LETTER", "FATHER",
    "MOTHER", "PEOPLE", "LISTEN", "SHOULD", "RETURN", "ENOUGH", "OTHERS", "TRAVEL", "APPEAR", "FOLLOW",
    "SISTER", "AROUND", "ANSWER"
  ],
  level5: [
    // Complex and longer words (50 words)
    "FLIGHT", "BRIGHT", "FROZEN", "BROKEN", "SPOKEN", "CHANGE",
    "STRANGE", "ORANGE", "PURPLE", "SILVER", "GOLDEN", "ROCKET", "CASTLE", "DRAGON", "WIZARD", "KNIGHT", "BATTLE", "SPRING", "STRONG",
    "FREEDOM", "MISSION", "SOLDIER", "DESTROY", "BELIEVE", "PRINCESS", "TOGETHER", "CHILDREN", "BETWEEN", "NOTHING",
    "WITHOUT", "AGAINST", "ANOTHER", "PRESENT", "THROUGH", "SPECIAL", "CAPTAIN", "FORWARD", "COMMAND", "PROTECT",
    "SEVERAL", "BECAUSE", "JOURNEY", "PICTURE", "THOUGHT", "MACHINE", "QUESTION", "COMPLETE", "DARKNESS", "POWERFUL",
    "IMPORTANT"
  ]
};

// All words combined for generating distractors
const ALL_WORDS = [
  ...WORD_BANK.level1,
  ...WORD_BANK.level2,
  ...WORD_BANK.level3,
  ...WORD_BANK.level4,
  ...WORD_BANK.level5
];

// Function to generate similar-looking distractor words
const generateDistractors = (correctWord: string, count: number): string[] => {
  const distractors: string[] = [];
  const wordLength = correctWord.length;
  
  // Get words of similar length from the word bank
  const similarWords = ALL_WORDS.filter(w => 
    w !== correctWord && 
    Math.abs(w.length - wordLength) <= 1
  );
  
  // Shuffle and take unique distractors
  const shuffled = similarWords.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    distractors.push(shuffled[i]);
  }
  
  // If we don't have enough distractors, generate some by modifying letters
  while (distractors.length < count && distractors.length < ALL_WORDS.length - 1) {
    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    if (randomWord !== correctWord && !distractors.includes(randomWord)) {
      distractors.push(randomWord);
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

// Generate a random question for a given level
const getQuestionForLevel = (level: number, mode?: "typing" | "multiple_choice" | "letter_sounds"): Question | null => {
  // If letter_sounds mode, generate letter question
  if (mode === "letter_sounds") {
    return getLetterSoundQuestion();
  }
  
  // Use provided mode or randomly choose quiz mode (50/50 chance)
  const quizMode = mode || (Math.random() < 0.5 ? "typing" : "multiple_choice");
  
  if (quizMode === "typing") {
    // Generate typing question from simple word list
    const correctWord = TYPING_WORDS[Math.floor(Math.random() * TYPING_WORDS.length)];
    
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      type: "word",
      mode: "typing",
      question: `Type the word you hear:`,
      correctAnswer: correctWord,
      level
    };
  } else {
    // Generate multiple choice question from level word bank
    // Use profile's word level if available, otherwise use game level
    const profileState = useProfiles.getState();
    const profile = profileState.getActiveProfile();
    const effectiveLevel = profile?.difficultyLevel === "words" ? profile.wordLevel : level;
    const levelKey = `level${effectiveLevel}` as keyof typeof WORD_BANK;
    const words = WORD_BANK[levelKey];

    if (!words || words.length === 0) return null;

    // Try to pick from weak words, otherwise random
    const weakWords = profileState.getWeakWords(5);
    let correctWord: string;
    if (weakWords.length > 0 && Math.random() < 0.6) {
      // 60% chance to focus on weak words
      const weakInLevel = weakWords.filter(w => words.includes(w));
      correctWord = weakInLevel.length > 0
        ? weakInLevel[Math.floor(Math.random() * weakInLevel.length)]
        : words[Math.floor(Math.random() * words.length)];
    } else {
      correctWord = words[Math.floor(Math.random() * words.length)];
    }

    // Fewer options for younger/newer players, more as they improve
    const baseOptions = profile && profile.totalAnswered < 10 ? 3 : 4;
    const numOptions = Math.min(9, Math.max(3, baseOptions + Math.floor(effectiveLevel / 2)));
    const numDistractors = numOptions - 1; // Subtract 1 for the correct answer
    
    // Generate random number of distractor words
    const distractors = generateDistractors(correctWord, numDistractors);
    
    // Combine correct answer with distractors and shuffle
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
  }
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
      if (phase === "menu" || phase === "level_complete" || phase === "game_over") {
        set({
          phase,
          currentQuizMode: null,
          typingQuizCorrect: 0,
        });
        return;
      }
      
      // Gate game mode selection and playing behind quiz completion requirements
      // BUT allow direct access to playing_platformer (for TEST button)
      if (phase === "game_mode_selection" || phase === "tank_selection" || phase === "playing_tank") {
        let canAdvance = false;
        
        // Check requirements based on current quiz mode
        if (currentQuizMode === "typing" || currentQuizMode === "letter_sounds") {
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
            : (Math.random() < 0.5 ? "typing" : "multiple_choice")
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
      } else {
        // Platformer mode - initialize level and go straight to playing
        get().initializePlatformerLevel();
        set({ phase: "playing_platformer" });
      }
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
      }

      // Check if word level should advance
      if (profileStore.shouldAdvanceWordLevel()) {
        profileStore.advanceWordLevel();
      }

      // Different scoring based on quiz mode
      if (currentQuestion.mode === "typing" || currentQuestion.mode === "letter_sounds") {
        // Typing and letter_sounds mode: no penalty for wrong answers, just track correct count
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
      const { currentLevel, difficultyLevel } = get();
      const newLevel = currentLevel + 1;

      if (newLevel > 5) {
        set({ currentLevel: newLevel, phase: "game_over" });
      } else {
        // Select quiz mode based on difficulty level
        // For "letters" difficulty, use letter_sounds mode
        // For "words" difficulty, randomly choose between typing and multiple_choice
        const newQuizMode = difficultyLevel === "letters"
          ? "letter_sounds"
          : (Math.random() < 0.5 ? "typing" : "multiple_choice");

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
              setTimeout(() => speak(spellingTargetWord, SPEECH_RATE_SLOW), 500);
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

      // Lower all platforms significantly so player is fully visible when on them
      const adjustedPlatforms: Platform[] = platforms.map((platform) => ({
        ...platform,
        y: platform.y - 2.5, // Lower by 2.5 units total (was -1, now -2.5)
      }));

      // Determine difficulty and pick letters/words for labeled gems
      const { difficultyLevel } = get();
      const profileState = useProfiles.getState();
      const profile = profileState.getActiveProfile();

      // Pick a spelling target word for word mode
      let spellingWord: string | null = null;
      if (difficultyLevel === "words" && profile) {
        const effectiveLevel = profile.wordLevel || 1;
        const levelKey = `level${effectiveLevel}` as keyof typeof WORD_BANK;
        const words = WORD_BANK[levelKey] || WORD_BANK.level1;
        // Pick a short word (3-5 letters) for the spelling challenge
        const shortWords = words.filter(w => w.length >= 3 && w.length <= 5);
        if (shortWords.length > 0) {
          spellingWord = shortWords[Math.floor(Math.random() * shortWords.length)];
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
  }))
);
