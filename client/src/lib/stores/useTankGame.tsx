import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "name_entry" | "menu" | "quiz" | "tank_selection" | "playing" | "level_complete" | "game_over";

export type TankType = "light" | "medium" | "heavy" | "speed";

export interface Question {
  id: string;
  type: "word" | "letter_recognition" | "letter_sound" | "letter_combination" | "sight_word" | "cvc_word" | "blend_sound";
  question: string;
  options: string[];
  correctAnswer: string;
  level: number;
}

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
}

export type PowerUpType = "health" | "speed" | "rapid_fire";

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
}

interface TankGameState {
  phase: GamePhase;
  playerName: string;
  currentLevel: number;
  score: number;
  highScore: number;
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
  currentQuestion: Question | null;
  questionsAnswered: number;
  correctAnswers: number;
  quizQuestionsAnswered: number;
  quizCorrectAnswers: number;
  enemiesDefeated: number;
  powerUpsCollected: number;
  lessonPoints: number;

  setPhase: (phase: GamePhase) => void;
  setPlayerName: (name: string) => void;
  selectTank: (tank: TankType) => void;
  answerQuestion: (answer: string) => boolean;
  nextLevel: () => void;
  resetGame: () => void;
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
}

// Comprehensive word bank with 100+ words organized by difficulty
const WORD_BANK = {
  level1: [
    "IT", "IS", "THE", "CAT", "DOG", "BIG", "RUN", "SIT", "CUP", "PAN", 
    "BOX", "ZOO", "RED", "HOT", "EAT", "END", "BAT", "HAT", "SUN", "BED",
    "FLY", "LOW"
  ],
  level2: [
    "THIS", "THAT", "WHAT", "WHO", "HOW", "FISH", "JUMP", "STOP", "FOOD", 
    "COLD", "HIGH", "BLUE", "PINK", "TANK", "GAME", "STAR", "SHIP", "LOOK", "KING", "WET",
    "WARS"
  ],
  level3: [
    "WHICH", "START", "CHOOSE", "YELLOW", "GREEN", "BLACK", "WHITE", "PLAY", 
    "TREE", "QUIT", "VEST", "NEST", "BEST", "WEST", "FROG", "MILK", "CLOCK", "GRASS", "SNAP", "WHEN"
  ],
  level4: [
    "QUICK", "THINK", "BRING", "THANK", "PLANT", "STAND", "GRAND", "BRAND",
    "BLEND", "SPEND", "TREND", "FLOAT", "GREAT", "TREAT", "SPEED", "QUEEN", "MIXER", "GRAPE", "CRAVE", "SWING"
  ],
  level5: [
    "FLIGHT", "BRIGHT", "FROZEN", "BROKEN", "SPOKEN", "CHANGE",
    "STRANGE", "ORANGE", "PURPLE", "SILVER", "GOLDEN", "ROCKET", "PLANET", "CASTLE", "DRAGON", "WIZARD", "KNIGHT", "BATTLE", "SPRING", "STRONG"
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
const getQuestionForLevel = (level: number): Question | null => {
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
    phase: "name_entry",
    playerName: "",
    currentLevel: 1,
    score: 0,
    highScore: loadHighScore(),
    playerHealth: 100,
    maxHealth: 100,
    playerTank: null,
    playerX: 0,
    playerY: -8,
    enemies: [],
    bullets: [],
    powerUps: [],
    activePowerUps: new Set(),
    powerUpEndTimes: new Map(),
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    quizQuestionsAnswered: 0,
    quizCorrectAnswers: 0,
    enemiesDefeated: 0,
    powerUpsCollected: 0,
    lessonPoints: 0,

    setPhase: (phase) => {
      console.log("Setting phase to:", phase);
      const { lessonPoints, currentLevel } = get();
      const requiredPoints = getRequiredLessonPoints(currentLevel);
      
      // Gate tank selection and playing behind required lesson points for the level
      if ((phase === "tank_selection" || phase === "playing") && lessonPoints < requiredPoints) {
        console.log(`Need ${requiredPoints} lesson points to play! Current:`, lessonPoints);
        const question = getQuestionForLevel(currentLevel);
        set({ 
          phase: "quiz", 
          currentQuestion: question,
          quizQuestionsAnswered: 0,
          quizCorrectAnswers: 0,
        });
        return;
      }
      
      if (phase === "quiz") {
        const question = getQuestionForLevel(get().currentLevel);
        set({ 
          phase, 
          currentQuestion: question,
          quizQuestionsAnswered: 0,
          quizCorrectAnswers: 0,
        });
      } else {
        set({ phase });
      }
    },

    setPlayerName: (name) => {
      console.log("Setting player name:", name);
      set({ playerName: name });
    },

    selectTank: (tank) => {
      console.log("Selected tank:", tank);
      set({ playerTank: tank });
    },

    answerQuestion: (answer) => {
      const { currentQuestion, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, lessonPoints } = get();
      if (!currentQuestion) return false;
      
      const isCorrect = answer === currentQuestion.correctAnswer;
      console.log("Answer:", answer, "Correct:", isCorrect);
      
      // Award 1 point for correct answers, subtract 1 point for incorrect answers (can go negative)
      const newLessonPoints = isCorrect ? lessonPoints + 1 : lessonPoints - 1;
      
      set({
        questionsAnswered: questionsAnswered + 1,
        correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
        quizQuestionsAnswered: quizQuestionsAnswered + 1,
        quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
        lessonPoints: newLessonPoints,
      });
      
      console.log("Lesson points:", newLessonPoints);
      return isCorrect;
    },

    nextLevel: () => {
      const { currentLevel } = get();
      const newLevel = currentLevel + 1;
      console.log("Advancing to level:", newLevel);
      
      if (newLevel > 5) {
        set({ currentLevel: newLevel, phase: "game_over" });
      } else {
        set({
          currentLevel: newLevel,
          phase: "quiz",
          playerHealth: 100,
          playerX: 0,
          playerY: -8,
          enemies: [],
          bullets: [],
          currentQuestion: getQuestionForLevel(newLevel),
          quizQuestionsAnswered: 0,
          quizCorrectAnswers: 0,
          lessonPoints: 0, // Reset lesson points for new level
        });
      }
    },

    resetGame: () => {
      console.log("Resetting game");
      const { playerName } = get();
      set({
        phase: "name_entry",
        playerName: "", // Clear name on full reset
        currentLevel: 1,
        score: 0,
        playerHealth: 100,
        maxHealth: 100,
        playerTank: null,
        playerX: 0,
        playerY: -8,
        enemies: [],
        bullets: [],
        powerUps: [],
        activePowerUps: new Set(),
        powerUpEndTimes: new Map(),
        enemiesDefeated: 0,
        powerUpsCollected: 0,
        currentQuestion: null,
        questionsAnswered: 0,
        correctAnswers: 0,
        quizQuestionsAnswered: 0,
        quizCorrectAnswers: 0,
        lessonPoints: 0,
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
  }))
);
