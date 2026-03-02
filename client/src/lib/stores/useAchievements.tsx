import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface AchievementsState {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: (stats: GameStats) => void;
  resetAchievements: () => void;
}

export interface GameStats {
  score: number;
  correctAnswers: number;
  questionsAnswered: number;
  quizCorrectAnswers: number;
  quizQuestionsAnswered: number;
  currentLevel: number;
  enemiesDefeated: number;
  powerUpsCollected: number;
}

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: "first_question", title: "First Steps", description: "Answer your first question", icon: "📚", unlocked: false },
  { id: "perfect_quiz", title: "Quiz Master", description: "Get 100% on a quiz", icon: "🎯", unlocked: false },
  { id: "reach_level_3", title: "Getting Started", description: "Reach level 3", icon: "⭐", unlocked: false },
  { id: "reach_level_5", title: "Almost There", description: "Reach level 5", icon: "🌟", unlocked: false },
  { id: "beat_game", title: "Victory!", description: "Beat all 5 levels", icon: "🏆", unlocked: false },
  { id: "ten_correct", title: "Learning Leader", description: "Answer 10 questions correctly", icon: "✅", unlocked: false },
  { id: "score_1000", title: "Point Collector", description: "Score 1000 points", icon: "💯", unlocked: false },
  { id: "score_5000", title: "High Scorer", description: "Score 5000 points", icon: "💎", unlocked: false },
  { id: "defeat_10_enemies", title: "Tank Commander", description: "Defeat 10 enemies", icon: "💥", unlocked: false },
  { id: "collect_5_powerups", title: "Power Player", description: "Collect 5 power-ups", icon: "⚡", unlocked: false },
];

const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem("tankReaderAchievements");
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      return ACHIEVEMENT_DEFINITIONS.map(def => {
        const saved = savedAchievements.find((a: Achievement) => a.id === def.id);
        return saved || def;
      });
    }
  } catch (error) {
    console.error("Failed to load achievements:", error);
  }
  return ACHIEVEMENT_DEFINITIONS;
};

const saveAchievements = (achievements: Achievement[]) => {
  try {
    localStorage.setItem("tankReaderAchievements", JSON.stringify(achievements));
  } catch (error) {
    console.error("Failed to save achievements:", error);
  }
};

export const useAchievements = create<AchievementsState>()(
  subscribeWithSelector((set, get) => ({
    achievements: loadAchievements(),

    unlockAchievement: (id: string) => {
      set((state) => {
        const achievement = state.achievements.find(a => a.id === id);
        if (!achievement || achievement.unlocked) return state;

        const updated = state.achievements.map(a =>
          a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
        
        saveAchievements(updated);
        return { achievements: updated };
      });
    },

    checkAchievements: (stats: GameStats) => {
      const { unlockAchievement } = get();
      
      if (stats.questionsAnswered > 0) {
        unlockAchievement("first_question");
      }
      
      if (stats.quizQuestionsAnswered > 0 && stats.quizCorrectAnswers === stats.quizQuestionsAnswered) {
        unlockAchievement("perfect_quiz");
      }
      
      if (stats.currentLevel >= 3) {
        unlockAchievement("reach_level_3");
      }
      
      if (stats.currentLevel >= 5) {
        unlockAchievement("reach_level_5");
      }
      
      if (stats.currentLevel > 5) {
        unlockAchievement("beat_game");
      }
      
      if (stats.correctAnswers >= 10) {
        unlockAchievement("ten_correct");
      }
      
      if (stats.score >= 1000) {
        unlockAchievement("score_1000");
      }
      
      if (stats.score >= 5000) {
        unlockAchievement("score_5000");
      }
      
      if (stats.enemiesDefeated >= 10) {
        unlockAchievement("defeat_10_enemies");
      }
      
      if (stats.powerUpsCollected >= 5) {
        unlockAchievement("collect_5_powerups");
      }
    },

    resetAchievements: () => {
      const fresh = ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def }));
      saveAchievements(fresh);
      set({ achievements: fresh });
    },
  }))
);
