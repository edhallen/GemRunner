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

const QUESTIONS_BANK: Question[] = [
  // Level 1 - Simple 2-3 letter words (covers: A, B, C, D, G, I, N, O, P, R, T, U, X, Z)
  { id: "1", type: "word", question: "Which word is CAT?", options: ["CAT", "BAT", "RAT", "HAT"], correctAnswer: "CAT", level: 1 },
  { id: "2", type: "word", question: "Which word is DOG?", options: ["DOG", "LOG", "FOG", "BOG"], correctAnswer: "DOG", level: 1 },
  { id: "3", type: "word", question: "Which word is BIG?", options: ["BIG", "DIG", "PIG", "FIG"], correctAnswer: "BIG", level: 1 },
  { id: "4", type: "word", question: "Which word is RUN?", options: ["RUN", "BUN", "FUN", "SUN"], correctAnswer: "RUN", level: 1 },
  { id: "5", type: "word", question: "Which word is SIT?", options: ["SIT", "BIT", "HIT", "PIT"], correctAnswer: "SIT", level: 1 },
  { id: "6", type: "word", question: "Which word is CUP?", options: ["CUP", "PUP", "SUP", "UP"], correctAnswer: "CUP", level: 1 },
  { id: "7", type: "word", question: "Which word is PAN?", options: ["PAN", "TAN", "MAN", "VAN"], correctAnswer: "PAN", level: 1 },
  { id: "8", type: "word", question: "Which word is BOX?", options: ["BOX", "FOX", "OX", "SOX"], correctAnswer: "BOX", level: 1 },
  { id: "9", type: "word", question: "Which word is ZOO?", options: ["ZOO", "BOO", "MOO", "TOO"], correctAnswer: "ZOO", level: 1 },
  
  // Level 2 - 3-4 letter words (covers: E, F, H, K, L, M, S, W)
  { id: "10", type: "word", question: "Which word is BED?", options: ["BED", "RED", "FED", "LED"], correctAnswer: "BED", level: 2 },
  { id: "11", type: "word", question: "Which word is HAT?", options: ["HAT", "BAT", "CAT", "MAT"], correctAnswer: "HAT", level: 2 },
  { id: "12", type: "word", question: "Which word is WET?", options: ["WET", "PET", "MET", "JET"], correctAnswer: "WET", level: 2 },
  { id: "13", type: "word", question: "Which word is SUN?", options: ["SUN", "RUN", "BUN", "FUN"], correctAnswer: "SUN", level: 2 },
  { id: "14", type: "word", question: "Which word is KING?", options: ["KING", "RING", "WING", "SING"], correctAnswer: "KING", level: 2 },
  { id: "15", type: "word", question: "Which word is FISH?", options: ["FISH", "DISH", "WISH", "SWISH"], correctAnswer: "FISH", level: 2 },
  { id: "16", type: "word", question: "Which word is LOOK?", options: ["LOOK", "BOOK", "COOK", "HOOK"], correctAnswer: "LOOK", level: 2 },
  { id: "17", type: "word", question: "Which word is JUMP?", options: ["JUMP", "BUMP", "PUMP", "LUMP"], correctAnswer: "JUMP", level: 2 },
  
  // Level 3 - 4-5 letter words (covers: Q, V, Y)
  { id: "18", type: "word", question: "Which word is QUIT?", options: ["QUIT", "QUITE", "QUICK", "QUILT"], correctAnswer: "QUIT", level: 3 },
  { id: "19", type: "word", question: "Which word is VEST?", options: ["VEST", "BEST", "WEST", "REST"], correctAnswer: "VEST", level: 3 },
  { id: "20", type: "word", question: "Which word is YELLOW?", options: ["YELLOW", "MELLOW", "BELLOW", "FELLOW"], correctAnswer: "YELLOW", level: 3 },
  { id: "21", type: "word", question: "Which word is PLAY?", options: ["PLAY", "CLAY", "GRAY", "STAY"], correctAnswer: "PLAY", level: 3 },
  { id: "22", type: "word", question: "Which word is STOP?", options: ["STOP", "SHOP", "DROP", "CROP"], correctAnswer: "STOP", level: 3 },
  { id: "23", type: "word", question: "Which word is TREE?", options: ["TREE", "FREE", "THEE", "THREE"], correctAnswer: "TREE", level: 3 },
  { id: "24", type: "word", question: "Which word is BLUE?", options: ["BLUE", "CLUE", "GLUE", "TRUE"], correctAnswer: "BLUE", level: 3 },
  
  // Level 4 - Mixed lengths (reinforces all letters)
  { id: "25", type: "word", question: "Which word is FROG?", options: ["FROG", "FLOG", "FROM", "FROWN"], correctAnswer: "FROG", level: 4 },
  { id: "26", type: "word", question: "Which word is MILK?", options: ["MILK", "SILK", "BILK", "MINK"], correctAnswer: "MILK", level: 4 },
  { id: "27", type: "word", question: "Which word is NEST?", options: ["NEST", "BEST", "WEST", "REST"], correctAnswer: "NEST", level: 4 },
  { id: "28", type: "word", question: "Which word is CLOCK?", options: ["CLOCK", "BLOCK", "FLOCK", "STOCK"], correctAnswer: "CLOCK", level: 4 },
  { id: "29", type: "word", question: "Which word is GRASS?", options: ["GRASS", "CLASS", "BRASS", "GLASS"], correctAnswer: "GRASS", level: 4 },
  { id: "30", type: "word", question: "Which word is SNAP?", options: ["SNAP", "SNIP", "SNAG", "SLAP"], correctAnswer: "SNAP", level: 4 },
  
  // Level 5 - Longer and more complex words
  { id: "31", type: "word", question: "Which word is QUEEN?", options: ["QUEEN", "QUEER", "QUEST", "QUENCH"], correctAnswer: "QUEEN", level: 5 },
  { id: "32", type: "word", question: "Which word is MIXER?", options: ["MIXER", "FIXER", "BOXER", "MISER"], correctAnswer: "MIXER", level: 5 },
  { id: "33", type: "word", question: "Which word is ZEBRA?", options: ["ZEBRA", "DEBRA", "EXTRA", "COBRA"], correctAnswer: "ZEBRA", level: 5 },
  { id: "34", type: "word", question: "Which word is BRING?", options: ["BRING", "BLING", "BRINE", "BRINK"], correctAnswer: "BRING", level: 5 },
  { id: "35", type: "word", question: "Which word is CRAVE?", options: ["CRAVE", "BRAVE", "GRAVE", "SHAVE"], correctAnswer: "CRAVE", level: 5 },
  { id: "36", type: "word", question: "Which word is THINK?", options: ["THINK", "THICK", "THING", "THANK"], correctAnswer: "THINK", level: 5 },
  { id: "37", type: "word", question: "Which word is DWELL?", options: ["DWELL", "SWELL", "SHELL", "SPELL"], correctAnswer: "DWELL", level: 5 },
  { id: "38", type: "word", question: "Which word is GRAPE?", options: ["GRAPE", "DRAPE", "GRATE", "GRIPE"], correctAnswer: "GRAPE", level: 5 },
];

const getQuestionForLevel = (level: number): Question | null => {
  const levelQuestions = QUESTIONS_BANK.filter(q => q.level === level);
  if (levelQuestions.length === 0) return null;
  return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
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
      const { lessonPoints } = get();
      
      // Gate tank selection and playing behind 10 lesson points
      if ((phase === "tank_selection" || phase === "playing") && lessonPoints < 10) {
        console.log("Need 10 lesson points to play! Current:", lessonPoints);
        const question = getQuestionForLevel(get().currentLevel);
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
