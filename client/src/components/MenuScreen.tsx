import { useState } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useAchievements } from "@/lib/stores/useAchievements";
import { Button } from "@/components/ui/button";
import { AchievementsPanel } from "@/components/AchievementsPanel";

export function MenuScreen() {
  const { setPhase, score, correctAnswers, questionsAnswered, highScore } = useTankGame();
  const { achievements } = useAchievements();
  const [showAchievements, setShowAchievements] = useState(false);
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (showAchievements) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 p-8 overflow-y-auto">
        <div>
          <AchievementsPanel />
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAchievements(false)}
              className="text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white font-mono px-8 py-4"
            >
              BACK TO MENU
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900">
      <div className="text-center">
        <h1 
          className="text-8xl font-bold text-yellow-400 mb-4 font-mono animate-pulse"
          style={{
            textShadow: "8px 8px 0px #000, -2px -2px 0px #fff"
          }}
        >
          TANK READER
        </h1>
        
        <p className="text-3xl text-white mb-8 font-bold">
          🎯 Learn Letters • Blast Enemies • Have Fun! 🎯
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <Button
            onClick={() => setPhase("quiz")}
            className="w-full h-20 text-3xl font-bold bg-green-500 hover:bg-green-600 text-white font-mono"
          >
            START GAME
          </Button>

          <Button
            onClick={() => setShowAchievements(true)}
            className="w-full h-16 text-2xl font-bold bg-purple-500 hover:bg-purple-600 text-white font-mono"
          >
            🏆 ACHIEVEMENTS ({unlockedCount}/{achievements.length})
          </Button>

          {highScore > 0 && (
            <div className="bg-black/60 border-4 border-yellow-400 rounded p-6 text-white">
              <div className="text-2xl font-bold mb-2 text-yellow-400">HIGH SCORE</div>
              <div className="text-5xl font-bold font-mono">
                {highScore.toString().padStart(6, '0')}
              </div>
            </div>
          )}

          {questionsAnswered > 0 && (
            <div className="bg-black/60 border-4 border-blue-400 rounded p-6 text-white">
              <div className="text-2xl font-bold mb-2">LAST GAME STATS</div>
              <div className="space-y-2 text-xl font-mono">
                <div>Score: {score}</div>
                <div>Correct: {correctAnswers}/{questionsAnswered}</div>
                <div>Accuracy: {Math.round((correctAnswers / questionsAnswered) * 100)}%</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-white text-lg">
          <p className="mb-2">🎮 A fun way to learn reading! 🎮</p>
          <p className="text-sm text-gray-300">For ages 5-7</p>
        </div>
      </div>
    </div>
  );
}
