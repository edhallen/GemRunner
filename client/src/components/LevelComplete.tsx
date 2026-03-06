import { useEffect } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useAchievements } from "@/lib/stores/useAchievements";

export function LevelComplete() {
  const { currentLevel, score, nextLevel, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, enemiesDefeated, powerUpsCollected, playerName, selectedGameMode } = useTankGame();
  const { checkAchievements } = useAchievements();

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
        <h2
          className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2 font-mono tracking-wide animate-bounce"
          style={{ textShadow: "4px 4px 0px #b45309, 2px 2px 0px #92400e" }}
        >
          LEVEL {currentLevel} COMPLETE!
        </h2>

        <p
          className="text-sm md:text-base text-cyan-400 font-mono mb-6 tracking-widest"
          style={{ textShadow: "0 0 8px #22d3ee" }}
        >
          {playerName ? `EXCELLENT WORK, ${playerName.toUpperCase()}!` : "EXCELLENT WORK!"}
        </p>

        {/* Score display */}
        <div className="border-2 border-gray-600 p-4 mb-6">
          <div className="flex justify-center gap-8 font-mono">
            <div>
              <span className="text-xs text-gray-500">SCORE</span>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                {score.toString().padStart(6, "0")}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">LEVEL</span>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {currentLevel}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={nextLevel}
          className="w-full min-h-[52px] py-3 text-xl md:text-2xl font-bold font-mono text-white border-2 border-green-500 bg-green-500/10 hover:bg-green-500/30 active:bg-green-500/50 transition-colors tracking-wide"
        >
          NEXT LEVEL &#9654;
        </button>
      </div>
    </div>
  );
}
