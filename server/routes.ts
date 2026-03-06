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

  // ElevenLabs TTS proxy — keeps API key server-side
  app.post("/api/tts", async (req, res) => {
    const { text, voice_id = "21m00Tcm4TlvDq8ikWAM" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "TTS not configured" });
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice_id)}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.7 },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        console.error("ElevenLabs error:", response.status, errBody);
        return res.status(502).json({ error: "TTS API error" });
      }

      res.set("Content-Type", "audio/mpeg");
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("TTS proxy error:", error);
      res.status(502).json({ error: "TTS API error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
