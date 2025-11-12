import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "name_entry" | "menu" | "quiz" | "game_mode_selection" | "tank_selection" | "playing_tank" | "playing_platformer" | "level_complete" | "game_over";

export type GameMode = "tank" | "platformer";

export type TankType = "light" | "medium" | "heavy" | "speed";

export type QuizMode = "multiple_choice" | "typing";

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

export type Question = MultipleChoiceQuestion | TypingQuestion;

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  speed: number;
  lastShot: number;
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
  type: 'enemy1' | 'enemy2' | 'enemy3';
}

export interface Gem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

interface TankGameState {
  phase: GamePhase;
  playerName: string;
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
  platformerMissiles: Bullet[];
  platformerReachedFlag: boolean;
  
  // Shared state
  currentQuestion: Question | null;
  currentQuizMode: "typing" | "multiple_choice" | null;
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
  defeatPlatformerEnemy: (id: string) => void;
  collectGem: (id: string) => void;
  reachFlag: () => void;
  initializePlatformerLevel: () => void;
  setPlatformerMissiles: (missiles: Bullet[]) => void;
  firePlatformerMissile: (x: number, y: number) => void;
  takePlatformerDamage: (amount: number) => void;
}

// Simple word list for typing quiz mode
// Most common English words suitable for typing practice
const TYPING_WORDS = [
  "this", "them", "that", "the", "is", "it", "who", "what", "am", "and",
  "he", "she", "of", "was", "have", "said", "can", "in", "his", "her",
  "your", "game", "from", "are", "name", "lego", "go", "to", "star", "wars"
];

// Comprehensive word bank with 200+ words organized by difficulty
// Includes high-frequency English words and Star Wars vocabulary
const WORD_BANK = {
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
  return 4 + level; // Level 1 = 5, Level 2 = 6, Level 3 = 7, Level 4 = 8, Level 5 = 9
};

// Generate a random question for a given level
const getQuestionForLevel = (level: number, mode?: "typing" | "multiple_choice"): Question | null => {
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
    const levelKey = `level${level}` as keyof typeof WORD_BANK;
    const words = WORD_BANK[levelKey];
    
    if (!words || words.length === 0) return null;
    
    // Pick a random word from the level
    const correctWord = words[Math.floor(Math.random() * words.length)];
    
    // Random number of options between 3 and 9
    const numOptions = Math.floor(Math.random() * 7) + 3; // 3-9 inclusive
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
    phase: "name_entry",
    playerName: "",
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
    platformerMissiles: [],
    platformerReachedFlag: false,
    
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
      console.log("Setting phase to:", phase);
      const { lessonPoints, typingQuizCorrect, currentLevel, currentQuizMode } = get();
      const requiredPoints = getRequiredLessonPoints(currentLevel);
      
      // Clear quiz session state when transitioning to phases that represent session breaks
      if (phase === "menu" || phase === "level_complete" || phase === "game_over") {
        console.log("Ending quiz session, clearing quiz mode and progress");
        set({ 
          phase,
          currentQuizMode: null,
          typingQuizCorrect: 0,
        });
        return;
      }
      
      // Gate game mode selection and playing behind quiz completion requirements
      if (phase === "game_mode_selection" || phase === "tank_selection" || phase === "playing_tank" || phase === "playing_platformer") {
        let canAdvance = false;
        
        // Check requirements based on current quiz mode
        if (currentQuizMode === "typing") {
          canAdvance = typingQuizCorrect >= 3;
          if (!canAdvance) {
            console.log(`Need 3 typing quiz correct! Current:`, typingQuizCorrect);
          }
        } else {
          canAdvance = lessonPoints >= requiredPoints;
          if (!canAdvance) {
            console.log(`Need ${requiredPoints} lesson points to play! Current:`, lessonPoints);
          }
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
        const { currentQuizMode: existingMode } = get();
        
        // Only select new quiz mode if we don't have one (starting fresh session)
        // If we already have a mode, keep it (mid-session retry)
        const quizMode = existingMode || (Math.random() < 0.5 ? "typing" : "multiple_choice");
        const isNewSession = !existingMode;
        
        const question = getQuestionForLevel(get().currentLevel, quizMode);
        
        if (isNewSession) {
          console.log("Starting new quiz session with mode:", quizMode);
          set({ 
            phase, 
            currentQuestion: question,
            currentQuizMode: quizMode,
            quizQuestionsAnswered: 0,
            quizCorrectAnswers: 0,
            typingQuizCorrect: 0, // Reset counters for new session
          });
        } else {
          console.log("Continuing quiz session with mode:", quizMode);
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
      console.log("Setting player name:", name);
      set({ playerName: name });
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
      console.log("Selected tank:", tank);
      set({ playerTank: tank });
    },

    answerQuestion: (answer) => {
      const { currentQuestion, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, lessonPoints, typingQuizCorrect } = get();
      if (!currentQuestion) return false;
      
      // Case-insensitive, trimmed comparison for answer
      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedCorrect = currentQuestion.correctAnswer.trim().toLowerCase();
      const isCorrect = normalizedAnswer === normalizedCorrect;
      console.log("Answer:", answer, "Correct:", isCorrect);
      
      // Different scoring based on quiz mode
      if (currentQuestion.mode === "typing") {
        // Typing mode: no penalty for wrong answers, just track correct count
        const newTypingCorrect = isCorrect ? typingQuizCorrect + 1 : typingQuizCorrect;
        
        set({
          questionsAnswered: questionsAnswered + 1,
          correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
          quizQuestionsAnswered: quizQuestionsAnswered + 1,
          quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
          typingQuizCorrect: newTypingCorrect,
        });
        
        console.log("Typing quiz correct:", newTypingCorrect);
      } else {
        // Multiple choice mode: +1 for correct, -1 for incorrect
        const newLessonPoints = isCorrect ? lessonPoints + 1 : lessonPoints - 1;
        
        set({
          questionsAnswered: questionsAnswered + 1,
          correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
          quizQuestionsAnswered: quizQuestionsAnswered + 1,
          quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
          lessonPoints: newLessonPoints,
        });
        
        console.log("Lesson points:", newLessonPoints);
      }
      
      return isCorrect;
    },

    nextLevel: () => {
      const { currentLevel } = get();
      const newLevel = currentLevel + 1;
      console.log("Advancing to level:", newLevel);
      
      if (newLevel > 5) {
        set({ currentLevel: newLevel, phase: "game_over" });
      } else {
        // Select new quiz mode randomly for new level (50/50 chance)
        const newQuizMode = Math.random() < 0.5 ? "typing" : "multiple_choice";
        console.log("Starting level", newLevel, "with quiz mode:", newQuizMode);
        
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
      console.log("Resetting game");
      const { playerName } = get();
      set({
        phase: "name_entry",
        playerName: "", // Clear name on full reset
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
        platformerMissiles: [],
        platformerReachedFlag: false,
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
      
      console.log("Collected power-up:", type);
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
          console.log("Power-up expired:", type);
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

    defeatPlatformerEnemy: (id) => {
      set((state) => ({
        platformerEnemies: state.platformerEnemies.map(e => 
          e.id === id ? { ...e, isAlive: false } : e
        ),
        enemiesDefeated: state.enemiesDefeated + 1,
      }));
      get().addScore(50);
    },

    collectGem: (id) => {
      set((state) => ({
        platformerGems: state.platformerGems.map(g => 
          g.id === id ? { ...g, collected: true } : g
        ),
      }));
      get().addScore(10);
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

      // Generate gems (more gems at higher levels)
      const numGems = 5 + currentLevel * 2;
      const gems: Gem[] = [];
      for (let i = 0; i < numGems; i++) {
        gems.push({
          id: `gem-${i}`,
          x: 5 + i * 3,
          y: -3 + Math.random() * 6, // Range from -3 to 3, covering low to high
          collected: false,
        });
      }

      // Generate enemies (more enemies at higher levels)
      const numEnemies = 4 + currentLevel * 2; // Increased from 2 + currentLevel
      const enemies: PlatformerEnemy[] = [];
      const enemyTypes: Array<'enemy1' | 'enemy2' | 'enemy3'> = ['enemy1', 'enemy2', 'enemy3'];
      
      for (let i = 0; i < numEnemies; i++) {
        // Spread enemies across the level at varied X positions
        const xPositions = [12, 18, 24, 30, 32, 36, 38, 42];
        const x = xPositions[i % xPositions.length];
        const y = 0.5; // Will be adjusted to terrain height in game loop
        const type = enemyTypes[i % enemyTypes.length]; // Cycle through enemy types
        
        enemies.push({
          id: `enemy-${i}`,
          x: x,
          y: y,
          vx: 0.5,
          patrolLeft: x - 3,
          patrolRight: x + 3,
          isAlive: true,
          type: type,
        });
      }

      set({
        platformerGems: gems,
        platformerEnemies: enemies,
      });
    },

    setPlatformerMissiles: (missiles) => {
      set({ platformerMissiles: missiles });
    },

    firePlatformerMissile: (x, y) => {
      const newMissile: Bullet = {
        id: `missile-${Date.now()}-${Math.random()}`,
        x: x + 0.5, // Spawn slightly ahead of player
        y: y,
        vx: 1, // Horizontal velocity (will be multiplied by speed in scene)
        vy: 0,
        owner: "player",
        isMissile: true,
      };
      
      console.log("Missile created:", newMissile);

      set((state) => ({
        platformerMissiles: [...state.platformerMissiles, newMissile],
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
  }))
);
