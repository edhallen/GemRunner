import { useTankGame } from "@/lib/stores/useTankGame";
import { Progress } from "@/components/ui/progress";

export function GameHUD() {
  const { score, playerHealth, maxHealth, currentLevel } = useTankGame();
  const healthPercent = (playerHealth / maxHealth) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 bg-black/80 border-4 border-yellow-500 rounded p-4 pointer-events-none">
        <div className="text-yellow-400 font-bold font-mono text-xl mb-2">
          LEVEL: {currentLevel}
        </div>
        <div className="text-white font-bold font-mono mb-2">
          HP: {playerHealth}/{maxHealth}
        </div>
        <div className="w-48">
          <Progress 
            value={healthPercent} 
            className="h-4 bg-gray-700"
            style={{
              background: '#374151'
            }}
          />
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 border-4 border-yellow-500 rounded p-4 pointer-events-none">
        <div className="text-yellow-400 font-bold font-mono text-2xl">
          SCORE
        </div>
        <div className="text-white font-bold font-mono text-4xl">
          {score.toString().padStart(6, '0')}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/80 border-4 border-yellow-500 rounded p-3 pointer-events-none">
        <div className="text-white font-mono text-sm space-y-1">
          <div>▲▼◄► MOVE</div>
          <div>SPACE SHOOT</div>
        </div>
      </div>
    </div>
  );
}
