import { useEffect } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useAchievements } from "@/lib/stores/useAchievements";
import { Button } from "@/components/ui/button";

export function GameOver() {
  const { currentLevel, score, resetGame, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, enemiesDefeated, powerUpsCollected, playerName } = useTankGame();
  const { checkAchievements } = useAchievements();

  const didWin = currentLevel > 5;
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

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
  }, [score, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, currentLevel, enemiesDefeated, powerUpsCollected, checkAchievements]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-2xl w-full mx-4 text-center">
        {didWin ? (
          <>
            <h2 
              className="text-8xl font-bold text-yellow-400 mb-6 font-mono animate-bounce"
              style={{ textShadow: "8px 8px 0px #000" }}
            >
              🏆 YOU WIN! 🏆
            </h2>
            <p className="text-4xl text-green-400 font-bold mb-8">
              {playerName ? `${playerName.toUpperCase()}, YOU DID IT!` : "ALL LEVELS COMPLETE!"}
            </p>
          </>
        ) : (
          <>
            <h2 
              className="text-7xl font-bold text-red-500 mb-6 font-mono"
              style={{ textShadow: "6px 6px 0px #000" }}
            >
              GAME OVER
            </h2>
            <p className="text-3xl text-white font-bold mb-8">
              {playerName ? `Don't give up, ${playerName}! Try again!` : "Don't give up! Try again!"}
            </p>
          </>
        )}

        <div className="bg-black/80 border-4 border-yellow-400 rounded-lg p-8 mb-8">
          <div className="text-3xl font-bold text-yellow-400 mb-6">FINAL STATS</div>
          <div className="grid grid-cols-2 gap-6 text-white text-xl font-mono">
            <div>
              <div className="text-gray-400">Level Reached</div>
              <div className="text-3xl font-bold">{currentLevel}</div>
            </div>
            <div>
              <div className="text-gray-400">Final Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-gray-400">Questions</div>
              <div className="text-3xl font-bold">{questionsAnswered}</div>
            </div>
            <div>
              <div className="text-gray-400">Accuracy</div>
              <div className="text-3xl font-bold">{accuracy}%</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={resetGame}
            className="w-full h-20 text-3xl font-bold bg-blue-500 hover:bg-blue-600 text-white font-mono"
          >
            PLAY AGAIN
          </Button>
        </div>

        {didWin && (
          <p className="mt-8 text-2xl text-yellow-400 font-bold animate-pulse">
            ⭐ You're a Reading Champion! ⭐
          </p>
        )}
      </div>
    </div>
  );
}
