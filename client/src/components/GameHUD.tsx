import { useTankGame } from "@/lib/stores/useTankGame";
import { Progress } from "@/components/ui/progress";

export function GameHUD() {
  const {
    score,
    playerHealth,
    maxHealth,
    platformerPlayerHealth,
    platformerMaxHealth,
    currentLevel,
    playerName,
    missileCount,
    selectedGameMode,
    spellingTargetWord,
    spellingCollected,
    tankTargetWord,
  } = useTankGame();
  
  // Use platformer health if in platformer mode, otherwise use tank health
  const currentHealth = selectedGameMode === "platformer" ? platformerPlayerHealth : playerHealth;
  const currentMaxHealth = selectedGameMode === "platformer" ? platformerMaxHealth : maxHealth;
  const healthPercent = (currentHealth / currentMaxHealth) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 bg-black/80 border-2 md:border-4 border-yellow-500 rounded p-2 md:p-4 pointer-events-none">
        {playerName && (
          <div className="text-white font-bold font-mono text-sm md:text-lg mb-2">
            {playerName}
          </div>
        )}
        <div className="text-yellow-400 font-bold font-mono text-base md:text-xl mb-2">
          LEVEL: {currentLevel}
        </div>
        <div className="text-white font-bold font-mono text-sm md:text-base mb-2">
          HP: {currentHealth}/{currentMaxHealth}
        </div>
        <div className="w-32 md:w-48 h-4 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-500 mb-3">
          <div 
            className="h-full transition-all duration-300"
            style={{
              width: `${healthPercent}%`,
              background: healthPercent > 50 ? '#22c55e' : healthPercent > 25 ? '#eab308' : '#ef4444'
            }}
          />
        </div>
        <div className="text-purple-400 font-bold font-mono text-sm md:text-lg">
          MISSILES: ∞
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 border-2 md:border-4 border-yellow-500 rounded p-2 md:p-4 pointer-events-none">
        <div className="text-yellow-400 font-bold font-mono text-base md:text-2xl">
          SCORE
        </div>
        <div className="text-white font-bold font-mono text-2xl md:text-4xl">
          {score.toString().padStart(6, '0')}
        </div>
      </div>

      {/* Spelling challenge display (platformer word mode) */}
      {selectedGameMode === "platformer" && spellingTargetWord && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border-2 md:border-4 border-green-400 rounded px-3 py-2 md:px-6 md:py-3 pointer-events-none">
          <div className="text-green-400 font-bold font-mono text-xs md:text-sm mb-1 text-center">SPELL IT!</div>
          <div className="flex gap-1 md:gap-2 justify-center">
            {spellingTargetWord.split("").map((letter, i) => {
              const isCollected = i < spellingCollected.length;
              return (
                <div
                  key={i}
                  className={`w-7 h-9 md:w-10 md:h-12 flex items-center justify-center font-bold font-mono text-lg md:text-2xl border-2 rounded ${
                    isCollected
                      ? "bg-green-500/50 border-green-400 text-green-200"
                      : "bg-gray-800/50 border-gray-500 text-gray-500"
                  }`}
                >
                  {isCollected ? letter : "?"}
                </div>
              );
            })}
          </div>
          {spellingCollected.length === spellingTargetWord.length && (
            <div className="text-yellow-400 font-bold text-center text-sm md:text-lg mt-1 animate-bounce">
              COMPLETE! +200
            </div>
          )}
        </div>
      )}

      {/* Tank target word display */}
      {selectedGameMode === "tank" && tankTargetWord && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border-2 md:border-4 border-orange-400 rounded px-3 py-2 md:px-6 md:py-3 pointer-events-none">
          <div className="text-orange-400 font-bold font-mono text-xs md:text-sm mb-1 text-center">SHOOT THE WORD:</div>
          <div className="text-white font-bold font-mono text-2xl md:text-4xl text-center">
            {tankTargetWord}
          </div>
        </div>
      )}

      <div className="hidden md:block absolute bottom-4 left-4 bg-black/80 border-4 border-yellow-500 rounded p-3 pointer-events-none">
        <div className="text-white font-mono text-sm space-y-1">
          <div>▲▼◄► MOVE</div>
          <div>SPACE SHOOT</div>
          <div className="text-purple-400">M MISSILE</div>
        </div>
      </div>
    </div>
  );
}
