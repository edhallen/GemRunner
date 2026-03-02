import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameRuns = pgTable("game_runs", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGameRunSchema = createInsertSchema(gameRuns).pick({
  playerName: true,
  score: true,
});

export type InsertGameRun = z.infer<typeof insertGameRunSchema>;
export type GameRun = typeof gameRuns.$inferSelect;
