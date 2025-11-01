import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "quiz" | "tank_selection" | "playing" | "level_complete" | "game_over";

export type TankType = "light" | "medium" | "heavy" | "speed";

export interface Question {
  id: string;
  type: "letter_recognition" | "letter_sound" | "letter_combination" | "sight_word" | "cvc_word" | "blend_sound";
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
  // Level 1 - Basic Letter Recognition
  { id: "1", type: "letter_recognition", question: "Which letter is this: A?", options: ["A", "B", "C", "D"], correctAnswer: "A", level: 1 },
  { id: "2", type: "letter_recognition", question: "Which letter is this: B?", options: ["A", "B", "C", "D"], correctAnswer: "B", level: 1 },
  { id: "3", type: "letter_sound", question: "What sound does 'M' make?", options: ["mmm", "sss", "fff", "zzz"], correctAnswer: "mmm", level: 1 },
  { id: "4", type: "letter_sound", question: "What sound does 'S' make?", options: ["mmm", "sss", "fff", "zzz"], correctAnswer: "sss", level: 1 },
  
  // Level 2 - More Letters
  { id: "5", type: "letter_recognition", question: "Which letter is this: T?", options: ["T", "F", "L", "I"], correctAnswer: "T", level: 2 },
  { id: "6", type: "letter_sound", question: "What sound does 'T' make?", options: ["tuh", "duh", "buh", "puh"], correctAnswer: "tuh", level: 2 },
  { id: "7", type: "letter_recognition", question: "Which letter is this: N?", options: ["M", "N", "H", "U"], correctAnswer: "N", level: 2 },
  { id: "8", type: "letter_sound", question: "What sound does 'P' make?", options: ["tuh", "duh", "buh", "puh"], correctAnswer: "puh", level: 2 },
  
  // Level 3 - Letter Combinations
  { id: "9", type: "letter_combination", question: "What word starts with 'C-A'?", options: ["CAT", "DOG", "BAT", "RAT"], correctAnswer: "CAT", level: 3 },
  { id: "10", type: "letter_combination", question: "What word starts with 'D-O'?", options: ["CAT", "DOG", "BAT", "RAT"], correctAnswer: "DOG", level: 3 },
  { id: "11", type: "letter_sound", question: "What sound does 'D' make?", options: ["tuh", "duh", "buh", "puh"], correctAnswer: "duh", level: 3 },
  { id: "12", type: "letter_combination", question: "What word starts with 'B-A'?", options: ["CAT", "DOG", "BAT", "RAT"], correctAnswer: "BAT", level: 3 },
  
  // Level 4 - Advanced
  { id: "13", type: "letter_combination", question: "Which letters make the 'SH' sound?", options: ["SH", "CH", "TH", "PH"], correctAnswer: "SH", level: 4 },
  { id: "14", type: "letter_combination", question: "Which letters make the 'CH' sound?", options: ["SH", "CH", "TH", "PH"], correctAnswer: "CH", level: 4 },
  { id: "15", type: "letter_recognition", question: "Which letter is this: K?", options: ["K", "R", "X", "Y"], correctAnswer: "K", level: 4 },
  { id: "16", type: "letter_sound", question: "What sound does 'K' make?", options: ["kuh", "guh", "huh", "juh"], correctAnswer: "kuh", level: 4 },
  
  // Level 5 - Challenge
  { id: "17", type: "letter_combination", question: "What word is this: R-U-N?", options: ["RUN", "FUN", "SUN", "BUN"], correctAnswer: "RUN", level: 5 },
  { id: "18", type: "letter_combination", question: "What word is this: S-U-N?", options: ["RUN", "FUN", "SUN", "BUN"], correctAnswer: "SUN", level: 5 },
  { id: "19", type: "letter_sound", question: "What sound does 'F' make?", options: ["fff", "vvv", "sss", "zzz"], correctAnswer: "fff", level: 5 },
  { id: "20", type: "letter_combination", question: "What word is this: F-U-N?", options: ["RUN", "FUN", "SUN", "BUN"], correctAnswer: "FUN", level: 5 },
  
  // Level 1 - Additional CVC Words
  { id: "21", type: "cvc_word", question: "What is this word: C-A-T?", options: ["CAT", "BAT", "RAT", "HAT"], correctAnswer: "CAT", level: 1 },
  { id: "22", type: "cvc_word", question: "What is this word: D-O-G?", options: ["DOG", "LOG", "FOG", "HOG"], correctAnswer: "DOG", level: 1 },
  
  // Level 2 - Sight Words
  { id: "23", type: "sight_word", question: "Which is the word 'THE'?", options: ["THE", "HE", "SHE", "WE"], correctAnswer: "THE", level: 2 },
  { id: "24", type: "sight_word", question: "Which is the word 'AND'?", options: ["AND", "END", "ADD", "ANT"], correctAnswer: "AND", level: 2 },
  { id: "25", type: "cvc_word", question: "What is this word: R-U-N?", options: ["RUN", "BUN", "FUN", "SUN"], correctAnswer: "RUN", level: 2 },
  
  // Level 3 - Blend Sounds
  { id: "26", type: "blend_sound", question: "Which word starts with 'BL'?", options: ["BLUE", "CLUE", "TRUE", "GLUE"], correctAnswer: "BLUE", level: 3 },
  { id: "27", type: "blend_sound", question: "Which word starts with 'CR'?", options: ["CRAB", "GRAB", "BLAB", "DRAB"], correctAnswer: "CRAB", level: 3 },
  { id: "28", type: "sight_word", question: "Which is the word 'YOU'?", options: ["YOU", "YOUR", "OUT", "YES"], correctAnswer: "YOU", level: 3 },
  
  // Level 4 - Advanced Blends & CVC
  { id: "29", type: "blend_sound", question: "Which word starts with 'ST'?", options: ["STOP", "SHOP", "CROP", "DROP"], correctAnswer: "STOP", level: 4 },
  { id: "30", type: "blend_sound", question: "Which word starts with 'TR'?", options: ["TREE", "FREE", "BREE", "GREE"], correctAnswer: "TREE", level: 4 },
  { id: "31", type: "cvc_word", question: "What is this word: B-E-D?", options: ["BED", "RED", "FED", "LED"], correctAnswer: "BED", level: 4 },
  { id: "32", type: "sight_word", question: "Which is the word 'SEE'?", options: ["SEE", "BEE", "TEE", "FEE"], correctAnswer: "SEE", level: 4 },
  
  // Level 5 - Advanced
  { id: "33", type: "blend_sound", question: "Which word starts with 'FL'?", options: ["FLAG", "DRAG", "SLAG", "BRAG"], correctAnswer: "FLAG", level: 5 },
  { id: "34", type: "blend_sound", question: "Which word starts with 'GR'?", options: ["GRASS", "CLASS", "BRASS", "PASS"], correctAnswer: "GRASS", level: 5 },
  { id: "35", type: "sight_word", question: "Which is the word 'PLAY'?", options: ["PLAY", "CLAY", "GRAY", "STAY"], correctAnswer: "PLAY", level: 5 },
  { id: "36", type: "cvc_word", question: "What is this word: P-I-G?", options: ["PIG", "BIG", "DIG", "FIG"], correctAnswer: "PIG", level: 5 },
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
    phase: "menu",
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

    selectTank: (tank) => {
      console.log("Selected tank:", tank);
      set({ playerTank: tank });
    },

    answerQuestion: (answer) => {
      const { currentQuestion, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, lessonPoints } = get();
      if (!currentQuestion) return false;
      
      const isCorrect = answer === currentQuestion.correctAnswer;
      console.log("Answer:", answer, "Correct:", isCorrect);
      
      set({
        questionsAnswered: questionsAnswered + 1,
        correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
        quizQuestionsAnswered: quizQuestionsAnswered + 1,
        quizCorrectAnswers: isCorrect ? quizCorrectAnswers + 1 : quizCorrectAnswers,
        lessonPoints: isCorrect ? lessonPoints + 1 : lessonPoints,
      });
      
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
        });
      }
    },

    resetGame: () => {
      console.log("Resetting game");
      set({
        phase: "menu",
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
