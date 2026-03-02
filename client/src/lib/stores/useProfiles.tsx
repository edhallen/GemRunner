import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DifficultyLevel } from "./useTankGame";

export interface AccuracyRecord {
  correct: number;
  total: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  difficultyLevel: DifficultyLevel;
  wordLevel: number;
  highScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
  lettersAccuracy: Record<string, AccuracyRecord>;
  wordsAccuracy: Record<string, AccuracyRecord>;
  createdAt: number;
}

interface ProfilesState {
  profiles: ChildProfile[];
  activeProfileId: string | null;

  addProfile: (name: string, avatar: string, difficulty: DifficultyLevel) => ChildProfile;
  removeProfile: (id: string) => void;
  selectProfile: (id: string) => void;
  clearActiveProfile: () => void;
  getActiveProfile: () => ChildProfile | null;

  updateAccuracy: (item: string, type: "letter" | "word", correct: boolean) => void;
  updateHighScore: (score: number) => void;
  incrementGamesPlayed: () => void;

  getWeakLetters: (count: number) => string[];
  getWeakWords: (count: number) => string[];
  shouldAdvanceWordLevel: () => boolean;
  advanceWordLevel: () => void;
}

const STORAGE_KEY = "tankReaderProfiles";
const ACTIVE_PROFILE_KEY = "tankReaderActiveProfile";

const AVATARS = ["🦁", "🐸", "🦊", "🐼", "🦄", "🐶", "🐱", "🐰", "🐻", "🦋", "🐲", "🦖"];

export { AVATARS };

function loadProfiles(): ChildProfile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: ChildProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // localStorage full or unavailable
  }
}

function loadActiveProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

function saveActiveProfileId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

export const useProfiles = create<ProfilesState>()(
  subscribeWithSelector((set, get) => ({
    profiles: loadProfiles(),
    activeProfileId: loadActiveProfileId(),

    addProfile: (name, avatar, difficulty) => {
      const newProfile: ChildProfile = {
        id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        avatar,
        difficultyLevel: difficulty,
        wordLevel: 1,
        highScore: 0,
        gamesPlayed: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        lettersAccuracy: {},
        wordsAccuracy: {},
        createdAt: Date.now(),
      };

      set((state) => {
        const updated = [...state.profiles, newProfile];
        saveProfiles(updated);
        return { profiles: updated };
      });

      return newProfile;
    },

    removeProfile: (id) => {
      set((state) => {
        const updated = state.profiles.filter((p) => p.id !== id);
        saveProfiles(updated);
        const newActiveId = state.activeProfileId === id ? null : state.activeProfileId;
        if (newActiveId !== state.activeProfileId) {
          saveActiveProfileId(newActiveId);
        }
        return { profiles: updated, activeProfileId: newActiveId };
      });
    },

    selectProfile: (id) => {
      saveActiveProfileId(id);
      set({ activeProfileId: id });
    },

    clearActiveProfile: () => {
      saveActiveProfileId(null);
      set({ activeProfileId: null });
    },

    getActiveProfile: () => {
      const { profiles, activeProfileId } = get();
      if (!activeProfileId) return null;
      return profiles.find((p) => p.id === activeProfileId) || null;
    },

    updateAccuracy: (item, type, correct) => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;

          const accuracyMap = type === "letter" ? { ...p.lettersAccuracy } : { ...p.wordsAccuracy };
          const key = item.toUpperCase();
          const existing = accuracyMap[key] || { correct: 0, total: 0 };
          accuracyMap[key] = {
            correct: existing.correct + (correct ? 1 : 0),
            total: existing.total + 1,
          };

          return {
            ...p,
            ...(type === "letter" ? { lettersAccuracy: accuracyMap } : { wordsAccuracy: accuracyMap }),
            totalCorrect: p.totalCorrect + (correct ? 1 : 0),
            totalAnswered: p.totalAnswered + 1,
          };
        });

        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    updateHighScore: (score) => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          if (score <= p.highScore) return p;
          return { ...p, highScore: score };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    incrementGamesPlayed: () => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          return { ...p, gamesPlayed: p.gamesPlayed + 1 };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    getWeakLetters: (count) => {
      const profile = get().getActiveProfile();
      if (!profile) return [];

      const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      // Score each letter: lower accuracy = higher priority, unseen letters get medium priority
      const scored = ALL_LETTERS.map((letter) => {
        const record = profile.lettersAccuracy[letter];
        if (!record || record.total === 0) {
          return { letter, score: 0.5 }; // unseen = medium priority
        }
        return { letter, score: record.correct / record.total };
      });

      // Sort by accuracy ascending (weakest first), with some randomness for ties
      scored.sort((a, b) => a.score - b.score + (Math.random() - 0.5) * 0.1);

      return scored.slice(0, count).map((s) => s.letter);
    },

    getWeakWords: (count) => {
      const profile = get().getActiveProfile();
      if (!profile) return [];

      const entries = Object.entries(profile.wordsAccuracy);
      if (entries.length === 0) return [];

      const scored = entries.map(([word, record]) => ({
        word,
        score: record.total === 0 ? 0.5 : record.correct / record.total,
      }));

      scored.sort((a, b) => a.score - b.score + (Math.random() - 0.5) * 0.1);

      return scored.slice(0, count).map((s) => s.word);
    },

    shouldAdvanceWordLevel: () => {
      const profile = get().getActiveProfile();
      if (!profile || profile.difficultyLevel !== "words") return false;
      if (profile.wordLevel >= 5) return false;

      // Check if overall word accuracy exceeds 80% over at least 5 attempts
      const entries = Object.entries(profile.wordsAccuracy);
      let totalCorrect = 0;
      let totalAttempts = 0;

      for (const [, record] of entries) {
        totalCorrect += record.correct;
        totalAttempts += record.total;
      }

      if (totalAttempts < 5) return false;
      return totalCorrect / totalAttempts > 0.8;
    },

    advanceWordLevel: () => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          if (p.wordLevel >= 5) return p;
          // Reset word accuracy when advancing so they build up stats at the new level
          return { ...p, wordLevel: p.wordLevel + 1, wordsAccuracy: {} };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },
  }))
);
