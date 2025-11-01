import { useAchievements, type Achievement } from "@/lib/stores/useAchievements";

export function AchievementsPanel() {
  const { achievements } = useAchievements();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-black/80 border-4 border-purple-500 rounded p-6 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-yellow-400 font-mono mb-2">
          🏆 ACHIEVEMENTS 🏆
        </h2>
        <p className="text-2xl text-white font-mono">
          {unlockedCount} / {totalCount} Unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`p-4 rounded border-2 ${
        achievement.unlocked
          ? "bg-green-900/50 border-green-400"
          : "bg-gray-800/50 border-gray-600 opacity-60"
      }`}
    >
      <div className="text-4xl mb-2 text-center">
        {achievement.unlocked ? achievement.icon : "🔒"}
      </div>
      <h3 className="text-xl font-bold text-white text-center mb-1 font-mono">
        {achievement.title}
      </h3>
      <p className="text-sm text-gray-300 text-center">
        {achievement.description}
      </p>
    </div>
  );
}
