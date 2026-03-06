import { useTankGame } from "@/lib/stores/useTankGame";

export function GameModeSelection() {
  const { selectGameMode, currentLevel, playerName } = useTankGame();

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
        {playerName && (
          <p className="text-sm font-mono text-cyan-400 mb-1">
            GREAT JOB, {playerName.toUpperCase()}!
          </p>
        )}
        <h2
          className="text-2xl md:text-4xl font-bold text-yellow-400 mb-1 font-mono tracking-wide"
          style={{ textShadow: "4px 4px 0px #b45309, 2px 2px 0px #92400e" }}
        >
          CHOOSE YOUR GAME
        </h2>
        <p
          className="text-xs md:text-sm text-cyan-400 font-mono mb-6 tracking-widest"
          style={{ textShadow: "0 0 8px #22d3ee" }}
        >
          --- LEVEL {currentLevel} ---
        </p>

        <div className="space-y-3">
          {/* Tank Battle */}
          <button
            onClick={() => selectGameMode("tank")}
            aria-label="Play Tank Battle"
            className="w-full border-2 border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/20 active:bg-yellow-500/40 transition-colors p-4"
          >
            <div className="text-xl md:text-2xl font-bold font-mono text-yellow-400 mb-1">
              TANK BATTLE
            </div>
            <div className="text-xs md:text-sm font-mono text-gray-400">
              CHOOSE YOUR TANK AND BATTLE ENEMIES
            </div>
          </button>

          {/* Gem Runner */}
          <button
            onClick={() => selectGameMode("platformer")}
            aria-label="Play Gem Runner"
            className="w-full border-2 border-green-500 bg-green-500/5 hover:bg-green-500/20 active:bg-green-500/40 transition-colors p-4"
          >
            <div className="text-xl md:text-2xl font-bold font-mono text-green-400 mb-1">
              GEM RUNNER
            </div>
            <div className="text-xs md:text-sm font-mono text-gray-400">
              RUN, JUMP, AND COLLECT GEMS
            </div>
          </button>

          {/* Castle Raider */}
          <button
            onClick={() => selectGameMode("castle_raider")}
            aria-label="Play Castle Raider"
            className="w-full border-2 border-purple-500 bg-purple-500/5 hover:bg-purple-500/20 active:bg-purple-500/40 transition-colors p-4"
          >
            <div className="text-xl md:text-2xl font-bold font-mono text-purple-400 mb-1">
              CASTLE RAIDER
            </div>
            <div className="text-xs md:text-sm font-mono text-gray-400">
              DRAGON VS KNIGHTS — SPELL TO WIN
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
