import { gameRuns, type GameRun, type InsertGameRun } from "@shared/schema";

export interface IStorage {
  createGameRun(gameRun: InsertGameRun): Promise<GameRun>;
  getLeaderboard(limit?: number): Promise<GameRun[]>;
}

export class MemStorage implements IStorage {
  private gameRuns: Map<number, GameRun>;
  currentGameRunId: number;

  constructor() {
    this.gameRuns = new Map();
    this.currentGameRunId = 1;
  }

  async createGameRun(insertGameRun: InsertGameRun): Promise<GameRun> {
    const id = this.currentGameRunId++;
    const gameRun: GameRun = {
      ...insertGameRun,
      id,
      createdAt: new Date(),
    };
    this.gameRuns.set(id, gameRun);
    return gameRun;
  }

  async getLeaderboard(limit: number = 10): Promise<GameRun[]> {
    return Array.from(this.gameRuns.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
