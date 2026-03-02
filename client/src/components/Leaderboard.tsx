import { useQuery } from "@tanstack/react-query";
import { useTankGame } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface GameRun {
  id: number;
  playerName: string;
  score: number;
  createdAt: string;
}

export function Leaderboard() {
  const { setPhase } = useTankGame();

  const { data: leaderboard, isLoading, error } = useQuery<GameRun[]>({
    queryKey: ["/api/leaderboard"],
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 p-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <h1 
          className="text-3xl md:text-6xl font-bold text-yellow-400 mb-8 text-center font-mono"
          style={{
            textShadow: "6px 6px 0px #000, -2px -2px 0px #fff"
          }}
        >
          🏆 LEADERBOARD 🏆
        </h1>

        {isLoading && (
          <div className="text-center text-white text-2xl">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 text-xl mb-4">
            Error loading leaderboard. Please try again later.
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-black/80 border-4 border-yellow-400 rounded-lg p-4 md:p-8 mb-8">
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 text-yellow-400 font-bold text-sm md:text-xl mb-4 pb-2 border-b-2 border-yellow-400">
                  <div>Rank</div>
                  <div>Player Name</div>
                  <div>Score</div>
                  <div className="hidden md:block">Date</div>
                </div>
                {leaderboard.map((run, index) => (
                  <div
                    key={run.id}
                    className={`grid grid-cols-3 md:grid-cols-4 gap-4 text-white text-sm md:text-lg font-mono py-3 px-4 rounded ${
                      index === 0
                        ? "bg-yellow-500/20 border-2 border-yellow-400"
                        : index === 1
                        ? "bg-gray-400/20 border-2 border-gray-300"
                        : index === 2
                        ? "bg-orange-600/20 border-2 border-orange-400"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="font-bold">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </div>
                    <div className="font-bold">{run.playerName}</div>
                    <div className="font-bold text-yellow-400">
                      {run.score.toString().padStart(6, "0")}
                    </div>
                    <div className="hidden md:block text-sm text-gray-200">
                      {formatDate(run.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white text-2xl py-8">
                No scores yet! Be the first to play!
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Button
            onClick={() => setPhase("menu")}
            className="text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white font-mono px-8 py-4 min-h-[60px]"
          >
            BACK TO MENU
          </Button>
        </div>
      </div>
    </div>
  );
}



