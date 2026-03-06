import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DifficultyLevel } from "./useTankGame";

export interface AccuracyRecord {
  correct: number;
  total: number;
}

export interface SrsEntry {
  box: number;       // 1-4 (Leitner box)
  nextReview: number; // timestamp
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
  phonicsStage: number; // 1-10
  stageAccuracy: Record<number, AccuracyRecord>; // per-stage tracking
  srs: Record<string, SrsEntry>; // spaced repetition per word
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

  // Phonics stage
  updateStageAccuracy: (stage: number, correct: boolean) => void;
  shouldAdvancePhonicsStage: () => boolean;
  advancePhonicsStage: () => void;
  getPhonicsStage: () => number;

  // SRS
  updateSrs: (word: string, correct: boolean) => void;
  getOverdueWords: () => string[];
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
        phonicsStage: 1,
        stageAccuracy: {},
        srs: {},
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

    // ── Phonics stage ──

    updateStageAccuracy: (stage, correct) => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          const acc = { ...(p.stageAccuracy || {}) };
          const existing = acc[stage] || { correct: 0, total: 0 };
          acc[stage] = {
            correct: existing.correct + (correct ? 1 : 0),
            total: existing.total + 1,
          };
          return { ...p, stageAccuracy: acc };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    shouldAdvancePhonicsStage: () => {
      const profile = get().getActiveProfile();
      if (!profile || profile.difficultyLevel !== "words") return false;
      if ((profile.phonicsStage || 1) >= 10) return false;

      const stage = profile.phonicsStage || 1;
      const acc = (profile.stageAccuracy || {})[stage];
      if (!acc || acc.total < 10) return false;
      return acc.correct / acc.total >= 0.8;
    },

    advancePhonicsStage: () => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          const current = p.phonicsStage || 1;
          if (current >= 10) return p;
          return { ...p, phonicsStage: current + 1 };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    getPhonicsStage: () => {
      const profile = get().getActiveProfile();
      return profile?.phonicsStage || 1;
    },

    // ── Spaced repetition ──

    updateSrs: (word, correct) => {
      const { activeProfileId } = get();
      if (!activeProfileId) return;

      const now = Date.now();
      // Box intervals in ms: box1=0 (every session), box2=1 day, box3=3 days, box4=7 days
      const BOX_INTERVALS = [0, 0, 86400000, 259200000, 604800000];

      set((state) => {
        const updated = state.profiles.map((p) => {
          if (p.id !== activeProfileId) return p;
          const srs = { ...(p.srs || {}) };
          const key = word.toLowerCase();
          const entry = srs[key] || { box: 1, nextReview: 0 };

          if (correct) {
            const newBox = Math.min(4, entry.box + 1);
            srs[key] = { box: newBox, nextReview: now + BOX_INTERVALS[newBox] };
          } else {
            // Wrong → back to box 1
            srs[key] = { box: 1, nextReview: 0 };
          }

          return { ...p, srs };
        });
        saveProfiles(updated);
        return { profiles: updated };
      });
    },

    getOverdueWords: () => {
      const profile = get().getActiveProfile();
      if (!profile) return [];
      const now = Date.now();
      const srs = profile.srs || {};
      return Object.entries(srs)
        .filter(([, entry]) => entry.nextReview <= now)
        .sort((a, b) => a[1].box - b[1].box) // lowest box first
        .map(([word]) => word);
    },
  }))
);
