import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game run
  app.post("/api/game-runs", async (req, res) => {
    try {
      const { playerName, score } = req.body;

      if (!playerName || typeof score !== "number") {
        return res.status(400).json({ 
          message: "playerName and score are required" 
        });
      }

      const gameRun = await storage.createGameRun({
        playerName: String(playerName),
        score: Math.floor(score),
      });

      res.status(201).json(gameRun);
    } catch (error) {
      console.error("Error creating game run:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit 
        ? parseInt(String(req.query.limit), 10) 
        : 10;
      
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
