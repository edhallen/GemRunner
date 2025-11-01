import { useTankGame } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

export function MenuScreen() {
  const { setPhase, score, correctAnswers, questionsAnswered, highScore } = useTankGame();

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
