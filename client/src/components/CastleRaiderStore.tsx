import { useTankGame } from "@/lib/stores/useTankGame";
import {
  CR_PRICE_HEALTH_POTION, CR_PRICE_EXTRA_LIFE, CR_PRICE_FLIGHT_POTION,
} from "@/lib/constants";

export function CastleRaiderStore() {
  const {
    crGemCount, crLives, crFlightPotions, crHealthPotions,
    currentLevel, playerName, score, buyCRItem,
  } = useTankGame();

  const handleContinue = () => {
    const state = useTankGame.getState();
    state.initializeCastleRaiderLevel();
    state.setPhase("playing_castle_raider");
  };

  const items = [
    {
      id: "health_potion" as const,
      name: "HEALTH POTION",
      description: "Restores 50 HP when used",
      price: CR_PRICE_HEALTH_POTION,
      count: crHealthPotions,
      color: "green",
    },
    {
      id: "extra_life" as const,
      name: "EXTRA LIFE",
      description: "Respawn when health reaches 0",
      price: CR_PRICE_EXTRA_LIFE,
      count: crLives,
      color: "red",
    },
    {
      id: "flight_potion" as const,
      name: "FLIGHT POTION",
      description: "Fly for 10 seconds",
      price: CR_PRICE_FLIGHT_POTION,
      count: crFlightPotions,
      color: "cyan",
    },
  ];

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
          className="text-2xl md:text-4xl font-bold text-purple-400 mb-1 font-mono tracking-wide"
          style={{ textShadow: "4px 4px 0px #581c87, 2px 2px 0px #3b0764" }}
        >
          DRAGON SHOP
        </h2>
        <p className="text-sm text-cyan-400 font-mono mb-1 tracking-widest"
          style={{ textShadow: "0 0 8px #22d3ee" }}
        >
          {playerName ? `${playerName.toUpperCase()}, PREPARE FOR LEVEL ${currentLevel}` : `PREPARE FOR LEVEL ${currentLevel}`}
        </p>

        <div className="flex justify-center gap-6 font-mono text-sm mb-4">
          <span className="text-green-400">💎 {crGemCount} GEMS</span>
          <span className="text-yellow-400">SCORE: {score.toString().padStart(6, "0")}</span>
        </div>

        <div className="space-y-3 mb-6">
          {items.map(item => {
            const canAfford = crGemCount >= item.price;
            return (
              <div key={item.id} className="border-2 border-gray-600 p-3 flex items-center justify-between">
                <div className="text-left">
                  <div className={`text-lg font-bold font-mono text-${item.color}-400`}>
                    {item.name}
                  </div>
                  <div className="text-xs font-mono text-gray-400">{item.description}</div>
                  <div className="text-xs font-mono text-gray-500">OWNED: {item.count}</div>
                </div>
                <button
                  onClick={() => buyCRItem(item.id)}
                  disabled={!canAfford}
                  className={`px-4 py-2 text-sm font-bold font-mono border-2 transition-colors ${
                    canAfford
                      ? "border-green-500 bg-green-500/10 hover:bg-green-500/30 text-green-400"
                      : "border-gray-700 bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  💎 {item.price}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full min-h-[52px] py-3 text-xl md:text-2xl font-bold font-mono text-white border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/30 active:bg-purple-500/50 transition-colors tracking-wide"
        >
          CONTINUE &#9654;
        </button>
      </div>
    </div>
  );
}
