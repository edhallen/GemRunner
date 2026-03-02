import { useTankGame } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

export function GameModeSelection() {
  const { selectGameMode, currentLevel, playerName } = useTankGame();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-purple-900 to-purple-700">
      <div className="max-w-4xl w-full mx-4">
        <div className="text-center mb-6 md:mb-12">
          {playerName && (
            <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
              Great job, {playerName}!
            </h3>
          )}
          <h2 className="text-3xl md:text-6xl font-bold text-yellow-400 mb-4 font-mono" style={{textShadow: "4px 4px 0px #000"}}>
            CHOOSE YOUR GAME!
          </h2>
          <p className="text-2xl text-white font-bold">LEVEL {currentLevel}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Tank Battle Option */}
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-4 md:p-8 hover:border-yellow-400 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => selectGameMode("tank")}
            role="button"
            aria-label="Play Tank Battle"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">TANK BATTLE</h3>
              <p className="text-white text-lg mb-6">
                Choose your tank and battle enemies! Shoot bullets and missiles to win!
              </p>
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl py-4 md:py-6 min-h-[60px]"
                onClick={() => selectGameMode("tank")}
              >
                PLAY TANK BATTLE
              </Button>
            </div>
          </div>

          {/* Platformer Option */}
          <div
            className="bg-gray-800 border-4 border-gray-600 rounded-lg p-4 md:p-8 hover:border-green-400 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => selectGameMode("platformer")}
            role="button"
            aria-label="Play Gem Runner"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">GEM RUNNER</h3>
              <p className="text-white text-lg mb-6">
                Run, jump, and collect gems! Jump on bad guys to defeat them and reach the flag!
              </p>
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-xl py-4 md:py-6 min-h-[60px]"
                onClick={() => selectGameMode("platformer")}
              >
                PLAY GEM RUNNER
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
