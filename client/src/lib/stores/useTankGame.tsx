import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "quiz" | "tank_selection" | "playing" | "level_complete" | "game_over";

export type TankType = "light" | "medium" | "heavy" | "speed";

export interface Question {
  id: string;
  type: "letter_recognition" | "letter_sound" | "letter_combination";
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

interface TankGameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  playerHealth: number;
  maxHealth: number;
  playerTank: TankType | null;
  playerX: number;
  playerY: number;
  enemies: Enemy[];
  bullets: Bullet[];
  currentQuestion: Question | null;
  questionsAnswered: number;
  correctAnswers: number;

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
];

const getQuestionForLevel = (level: number): Question | null => {
  const levelQuestions = QUESTIONS_BANK.filter(q => q.level === level);
  if (levelQuestions.length === 0) return null;
  return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
};

export const useTankGame = create<TankGameState>()(
  subscribeWithSelector((set, get) => ({
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
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,

    setPhase: (phase) => {
      console.log("Setting phase to:", phase);
      if (phase === "quiz") {
        const question = getQuestionForLevel(get().currentLevel);
        set({ phase, currentQuestion: question });
      } else {
        set({ phase });
      }
    },

    selectTank: (tank) => {
      console.log("Selected tank:", tank);
      set({ playerTank: tank });
    },

    answerQuestion: (answer) => {
      const { currentQuestion, correctAnswers, questionsAnswered } = get();
      if (!currentQuestion) return false;
      
      const isCorrect = answer === currentQuestion.correctAnswer;
      console.log("Answer:", answer, "Correct:", isCorrect);
      
      set({
        questionsAnswered: questionsAnswered + 1,
        correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
      });
      
      return isCorrect;
    },

    nextLevel: () => {
      const { currentLevel } = get();
      const newLevel = currentLevel + 1;
      console.log("Advancing to level:", newLevel);
      
      if (newLevel > 5) {
        set({ phase: "game_over" });
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
        currentQuestion: null,
        questionsAnswered: 0,
        correctAnswers: 0,
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
      set((state) => ({ score: state.score + points }));
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
      }));
    },

    updateEnemy: (id, updates) => {
      set((state) => ({
        enemies: state.enemies.map(e => 
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    },
  }))
);
