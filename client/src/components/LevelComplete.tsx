import { useEffect } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useAchievements } from "@/lib/stores/useAchievements";
import { Button } from "@/components/ui/button";

export function LevelComplete() {
  const { currentLevel, score, nextLevel, correctAnswers, questionsAnswered, quizCorrectAnswers, quizQuestionsAnswered, enemiesDefeated, powerUpsCollected } = useTankGame();
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/90">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg p-12 max-w-2xl w-full mx-4 border-8 border-yellow-300 text-center">
        <h2 
          className="text-6xl font-bold text-black mb-6 font-mono animate-bounce"
          style={{ textShadow: "4px 4px 0px rgba(255,255,255,0.5)" }}
        >
          🎉 LEVEL {currentLevel} COMPLETE! 🎉
        </h2>
        
        <div className="bg-black/20 rounded-lg p-6 mb-8">
          <p className="text-4xl font-bold text-white mb-4">
            EXCELLENT WORK!
          </p>
          <p className="text-3xl font-bold text-black">
            Score: {score}
          </p>
        </div>

        <Button
          onClick={nextLevel}
          className="w-full h-20 text-3xl font-bold bg-green-500 hover:bg-green-600 text-white font-mono"
        >
          NEXT LEVEL →
        </Button>
      </div>
    </div>
  );
}
