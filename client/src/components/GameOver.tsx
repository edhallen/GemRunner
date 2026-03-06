import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useProfiles } from "@/lib/stores/useProfiles";
import { useAchievements } from "@/lib/stores/useAchievements";
import { apiRequest } from "@/lib/queryClient";

export function GameOver() {
  const { currentLevel, score, resetGame, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, enemiesDefeated, powerUpsCollected, playerName, selectedGameMode } = useTankGame();
  const { updateHighScore, incrementGamesPlayed } = useProfiles();
  const { checkAchievements } = useAchievements();
  const queryClient = useQueryClient();

  const maxLevel = selectedGameMode === "castle_raider" ? 10 : 5;
  const didWin = currentLevel > maxLevel;
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  const saveGameRunMutation = useMutation({
    mutationFn: async (data: { playerName: string; score: number }) => {
      const res = await apiRequest("POST", "/api/game-runs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
  });

  useEffect(() => {
    checkAchievements({
      score,
      correctAnswers,
      questionsAnswered,
      quizCorrectAnswers,
      quizQuestionsAnswered,
      currentLevel,
      enemiesDefeated,
      powerUpsCollected,
    });

    updateHighScore(score);
    incrementGamesPlayed();

    if (playerName && score > 0) {
      saveGameRunMutation.mutate({
        playerName,
        score,
      });
    }
  }, []); // Only run once when component mounts

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              opacity: 0.2 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-lg mx-auto px-4 text-center">
        {didWin ? (
          <>
            <h2
              className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2 font-mono tracking-wide animate-bounce"
              style={{ textShadow: "4px 4px 0px #b45309, 2px 2px 0px #92400e" }}
            >
              YOU WIN!
            </h2>
            <p
              className="text-sm md:text-base text-green-400 font-mono mb-6 tracking-widest"
              style={{ textShadow: "0 0 8px #22c55e" }}
            >
              {playerName ? `${playerName.toUpperCase()}, YOU DID IT!` : "ALL LEVELS COMPLETE!"}
            </p>
          </>
        ) : (
          <>
            <h2
              className="text-4xl md:text-6xl font-bold text-red-500 mb-2 font-mono tracking-wide"
              style={{ textShadow: "4px 4px 0px #7f1d1d, 2px 2px 0px #450a0a" }}
            >
              GAME OVER
            </h2>
            <p
              className="text-sm md:text-base text-cyan-400 font-mono mb-6 tracking-widest"
              style={{ textShadow: "0 0 8px #22d3ee" }}
            >
              {playerName ? `DON'T GIVE UP, ${playerName.toUpperCase()}!` : "DON'T GIVE UP!"}
            </p>
          </>
        )}

        {/* Stats box */}
        <div className="border-2 border-gray-600 p-4 mb-6">
          <div className="text-sm font-mono text-yellow-400 mb-3 tracking-wide">FINAL STATS</div>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
              <span className="text-xs text-gray-500">LEVEL</span>
              <div className="text-xl md:text-2xl font-bold text-white">{currentLevel}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">SCORE</span>
              <div className="text-xl md:text-2xl font-bold text-yellow-400">{score.toString().padStart(6, "0")}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">QUESTIONS</span>
              <div className="text-xl md:text-2xl font-bold text-white">{questionsAnswered}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">ACCURACY</span>
              <div className="text-xl md:text-2xl font-bold text-green-400">{accuracy}%</div>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full min-h-[52px] py-3 text-xl md:text-2xl font-bold font-mono text-white border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/30 active:bg-cyan-500/50 transition-colors tracking-wide mb-4"
        >
          PLAY AGAIN
        </button>

        {didWin && (
          <p
            className="text-sm font-mono text-yellow-400 animate-pulse tracking-widest"
            style={{ textShadow: "0 0 8px #eab308" }}
          >
            READING CHAMPION
          </p>
        )}
      </div>
    </div>
  );
}
