import { useTankGame, type TankType } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

const TANKS = [
  {
    type: "light" as TankType,
    name: "SCOUT",
    speed: "★★★★☆",
    power: "★★☆☆☆",
    armor: "★★☆☆☆",
    color: "#4ade80",
    description: "Fast and nimble!"
  },
  {
    type: "medium" as TankType,
    name: "FIGHTER",
    speed: "★★★☆☆",
    power: "★★★☆☆",
    armor: "★★★☆☆",
    color: "#60a5fa",
    description: "Balanced tank"
  },
  {
    type: "heavy" as TankType,
    name: "CRUSHER",
    speed: "★★☆☆☆",
    power: "★★★★☆",
    armor: "★★★★★",
    color: "#f87171",
    description: "Tough and strong!"
  },
  {
    type: "speed" as TankType,
    name: "RACER",
    speed: "★★★★★",
    power: "★★★☆☆",
    armor: "★☆☆☆☆",
    color: "#fbbf24",
    description: "Lightning fast!"
  }
];

export function TankSelection() {
  const { selectTank, setPhase, currentLevel } = useTankGame();

  const handleSelectTank = (tank: TankType) => {
    selectTank(tank);
    setPhase("playing");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700">
      <div className="max-w-6xl w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-yellow-400 mb-2 font-mono" style={{textShadow: "4px 4px 0px #000"}}>
            CHOOSE YOUR TANK!
          </h2>
          <p className="text-2xl text-white font-bold">LEVEL {currentLevel}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TANKS.map((tank) => (
            <div
              key={tank.type}
              className="bg-gray-800 border-4 border-gray-600 rounded-lg p-4 hover:border-yellow-400 transition-all cursor-pointer"
              onClick={() => handleSelectTank(tank.type)}
            >
              <div className="text-center mb-4">
                <div
                  className="w-24 h-24 mx-auto mb-3 rounded border-4 border-black flex items-center justify-center"
                  style={{ backgroundColor: tank.color }}
                >
                  <div className="text-6xl">🛡️</div>
                </div>
                <h3 className="text-2xl font-bold text-white font-mono mb-2">
                  {tank.name}
                </h3>
                <p className="text-sm text-gray-300 mb-3">{tank.description}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white">
                  <span className="font-bold">SPEED:</span>
                  <span className="text-yellow-400">{tank.speed}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-bold">POWER:</span>
                  <span className="text-yellow-400">{tank.power}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="font-bold">ARMOR:</span>
                  <span className="text-yellow-400">{tank.armor}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
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
