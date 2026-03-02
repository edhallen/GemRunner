import { useTankGame, type TankType } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

const TANKS = [
  {
    type: "light" as TankType,
    name: "SCOUT",
    speed: "★★★★☆",
    power: "★★☆☆☆",
    armor: "★★☆☆☆",
    image: "/tanks/tank1.png",
    description: "Fast and nimble!"
  },
  {
    type: "medium" as TankType,
    name: "FIGHTER",
    speed: "★★★☆☆",
    power: "★★★☆☆",
    armor: "★★★☆☆",
    image: "/tanks/tank2.png",
    description: "Balanced tank"
  },
  {
    type: "heavy" as TankType,
    name: "CRUSHER",
    speed: "★★☆☆☆",
    power: "★★★★☆",
    armor: "★★★★★",
    image: "/tanks/tank3.png",
    description: "Tough and strong!"
  },
  {
    type: "speed" as TankType,
    name: "RACER",
    speed: "★★★★★",
    power: "★★★☆☆",
    armor: "★☆☆☆☆",
    image: "/tanks/tank4.png",
    description: "Lightning fast!"
  }
];

export function TankSelection() {
  const { selectTank, setPhase, currentLevel } = useTankGame();

  const handleSelectTank = (tank: TankType) => {
    selectTank(tank);
    setPhase("playing_tank");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700">
      <div className="max-w-6xl w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2 font-mono" style={{textShadow: "4px 4px 0px #000"}}>
            CHOOSE YOUR TANK!
          </h2>
          <p className="text-2xl text-white font-bold">LEVEL {currentLevel}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {TANKS.map((tank) => (
            <div
              key={tank.type}
              className="bg-gray-800 border-4 border-gray-600 rounded-lg p-4 hover:border-yellow-400 transition-all cursor-pointer"
              onClick={() => handleSelectTank(tank.type)}
              role="button"
              aria-label={`Select ${tank.name} tank`}
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-3 flex items-center justify-center bg-gray-900 rounded border-4 border-gray-700">
                  <img 
                    src={tank.image} 
                    alt={tank.type}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold min-h-[60px]"
                onClick={() => handleSelectTank(tank.type)}
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
