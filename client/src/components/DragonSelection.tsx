import { useTankGame, type DragonType, DRAGON_IMAGES } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

const DRAGONS: { type: DragonType; name: string }[] = [
  { type: "og", name: "ORIGINAL" },
  { type: "explorer", name: "EXPLORER" },
  { type: "wizard", name: "WIZARD" },
  { type: "warrior", name: "WARRIOR" },
  { type: "monk", name: "MONK" },
];

export function DragonSelection() {
  const { selectDragon, initializeCastleRaiderLevel, setPhase, currentLevel } = useTankGame();

  const handleSelect = (dragon: DragonType) => {
    selectDragon(dragon);
    initializeCastleRaiderLevel();
    setPhase("playing_castle_raider");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700">
      <div className="max-w-6xl w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2 font-mono" style={{textShadow: "4px 4px 0px #000"}}>
            CHOOSE YOUR DRAGON!
          </h2>
          <p className="text-2xl text-white font-bold">LEVEL {currentLevel}</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          {DRAGONS.map((dragon) => (
            <div
              key={dragon.type}
              className="bg-gray-800 border-4 border-gray-600 rounded-lg p-4 hover:border-yellow-400 transition-all cursor-pointer"
              onClick={() => handleSelect(dragon.type)}
              role="button"
              aria-label={`Select ${dragon.name} dragon`}
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-3 flex items-center justify-center bg-gray-900 rounded border-4 border-gray-700">
                  <img
                    src={DRAGON_IMAGES[dragon.type]}
                    alt={dragon.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="text-yellow-300 font-bold font-mono text-sm md:text-base">{dragon.name}</p>
              </div>

              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold min-h-[50px]"
                onClick={() => handleSelect(dragon.type)}
              >
                SELECT
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
