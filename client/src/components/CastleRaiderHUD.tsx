import { useTankGame } from "@/lib/stores/useTankGame";

export function CastleRaiderHUD() {
  const {
    score, currentLevel, playerName,
    crPlayerHealth, crMaxHealth, crLives,
    crGemCount, crCoinCount, crFireballs,
    crFlightPotions, crHealthPotions, crFlightUntil,
  } = useTankGame();

  const healthPercent = (crPlayerHealth / crMaxHealth) * 100;
  const isFlying = Date.now() < crFlightUntil;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Left panel - health and stats */}
      <div className="absolute top-4 left-4 bg-black/80 border-2 md:border-4 border-purple-500 rounded p-2 md:p-4">
        {playerName && (
          <div className="text-white font-bold font-mono text-sm md:text-lg mb-1">{playerName}</div>
        )}
        <div className="text-purple-400 font-bold font-mono text-base md:text-xl mb-1">
          LEVEL: {currentLevel}
        </div>
        <div className="text-white font-bold font-mono text-sm md:text-base mb-1">
          HP: {crPlayerHealth}/{crMaxHealth}
        </div>
        <div className="w-32 md:w-48 h-4 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-500 mb-2">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${healthPercent}%`,
              background: healthPercent > 50 ? "#22c55e" : healthPercent > 25 ? "#eab308" : "#ef4444",
            }}
          />
        </div>
        <div className="text-red-400 font-bold font-mono text-xs md:text-sm">
          LIVES: {"❤️".repeat(crLives + 1)}
        </div>
        <div className="text-orange-400 font-bold font-mono text-xs md:text-sm">
          FIREBALLS: {CR_MAX_DISPLAY - crFireballs.length}/{CR_MAX_DISPLAY}
        </div>
        {crFlightPotions > 0 && (
          <div className="text-cyan-400 font-bold font-mono text-xs md:text-sm">
            FLIGHT: {crFlightPotions}
          </div>
        )}
        {crHealthPotions > 0 && (
          <div className="text-green-400 font-bold font-mono text-xs md:text-sm">
            POTIONS: {crHealthPotions}
          </div>
        )}
        {isFlying && (
          <div className="text-cyan-300 font-bold font-mono text-xs animate-pulse">
            FLYING!
          </div>
        )}
      </div>

      {/* Right panel - score and currency */}
      <div className="absolute top-4 right-4 bg-black/80 border-2 md:border-4 border-purple-500 rounded p-2 md:p-4">
        <div className="text-yellow-400 font-bold font-mono text-base md:text-2xl">SCORE</div>
        <div className="text-white font-bold font-mono text-2xl md:text-4xl">
          {score.toString().padStart(6, "0")}
        </div>
        <div className="text-green-400 font-bold font-mono text-sm md:text-lg mt-1">
          💎 {crGemCount}
        </div>
        <div className="text-yellow-400 font-bold font-mono text-sm md:text-lg">
          🪙 {crCoinCount}
        </div>
      </div>

      {/* Controls hint (desktop only) */}
      <div className="hidden md:block absolute bottom-4 left-4 bg-black/80 border-4 border-purple-500 rounded p-3">
        <div className="text-white font-mono text-sm space-y-1">
          <div>◄► MOVE</div>
          <div>▲ JUMP</div>
          <div>SPACE FIREBALL</div>
          <div>F FLIGHT POTION</div>
        </div>
      </div>
    </div>
  );
}

const CR_MAX_DISPLAY = 3;
