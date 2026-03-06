import { useState, useEffect } from "react";
import { useTankGame, DifficultyLevel } from "@/lib/stores/useTankGame";
import { useProfiles, AVATARS } from "@/lib/stores/useProfiles";
import { useAchievements } from "@/lib/stores/useAchievements";
import { Button } from "@/components/ui/button";
import { AchievementsPanel } from "@/components/AchievementsPanel";

function AddPlayerForm({ onDone }: { onDone: () => void }) {
  const { addProfile, selectProfile } = useProfiles();
  const { setPlayerName, setDifficultyLevel } = useTankGame();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("words");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const profile = addProfile(trimmed, avatar, difficulty);
    selectProfile(profile.id);
    setPlayerName(trimmed);
    setDifficultyLevel(difficulty);
    onDone();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 md:p-12 max-w-xl w-full mx-4 shadow-2xl border-4 md:border-8 border-yellow-400">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 text-purple-900">
          New Player
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full text-xl md:text-3xl p-4 border-4 border-purple-400 rounded-lg mb-6 text-center font-bold focus:outline-none focus:border-purple-600"
            autoFocus
            maxLength={20}
          />

          <div className="mb-6">
            <p className="text-lg text-center mb-3 text-gray-700 font-semibold">
              Pick your avatar:
            </p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-label={`Select avatar ${a}`}
                  className={`text-3xl md:text-4xl p-2 rounded-lg border-4 transition-all min-h-[60px] ${
                    avatar === a
                      ? "border-purple-500 bg-purple-100 scale-110"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg text-center mb-3 text-gray-700 font-semibold">
              Choose your level:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDifficulty("letters")}
                className={`p-4 min-h-[60px] rounded-lg border-4 font-bold text-lg transition-all ${
                  difficulty === "letters"
                    ? "border-green-500 bg-green-100 text-green-900 scale-105"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                🔤 Letters
                <div className="text-sm font-normal mt-1">For age 4</div>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty("words")}
                className={`p-4 min-h-[60px] rounded-lg border-4 font-bold text-lg transition-all ${
                  difficulty === "words"
                    ? "border-blue-500 bg-blue-100 text-blue-900 scale-105"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                📚 Words
                <div className="text-sm font-normal mt-1">Ages 5-7</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full min-h-[60px] bg-gradient-to-r from-green-500 to-green-600 text-white text-xl md:text-3xl font-bold py-4 px-8 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Let's Play!
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileSelector({ onAddNew }: { onAddNew: () => void }) {
  const { profiles, selectProfile, removeProfile } = useProfiles();
  const { setPlayerName, setDifficultyLevel } = useTankGame();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    selectProfile(id);
    setPlayerName(profile.name);
    setDifficultyLevel(profile.difficultyLevel);
  };

  const handleDelete = (id: string) => {
    removeProfile(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 overflow-y-auto">
      <div className="max-w-2xl w-full mx-4 py-8">
        <h1
          className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2 text-center font-mono"
          style={{ textShadow: "6px 6px 0px #000" }}
        >
          TANK READER
        </h1>
        <p className="text-lg md:text-2xl text-white text-center mb-8 font-bold">
          Who's playing?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8" style={{ gridAutoRows: "1fr" }}>
          {profiles.map((profile) => (
            <div key={profile.id} className="relative">
              <button
                onClick={() => handleSelect(profile.id)}
                className="w-full h-full bg-white/10 hover:bg-white/20 border-4 border-white/30 hover:border-yellow-400 rounded-xl p-4 md:p-6 transition-all transform hover:scale-105 min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="text-4xl md:text-5xl mb-2">{profile.avatar}</div>
                <div className="text-white font-bold text-lg md:text-xl">{profile.name}</div>
                <div className="text-xs md:text-sm text-gray-200 mt-1">
                  {profile.difficultyLevel === "letters" ? "🔤 Letters" : "📚 Words"}
                </div>
                <div className="text-xs text-yellow-400 mt-1">
                  {profile.highScore > 0 ? `Best: ${profile.highScore}` : "\u00A0"}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(profile.id);
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold flex items-center justify-center"
                aria-label={`Remove ${profile.name}`}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={onAddNew}
            aria-label="Add new player"
            className="bg-white/5 hover:bg-white/15 border-4 border-dashed border-white/30 hover:border-green-400 rounded-xl p-4 md:p-6 transition-all min-h-[140px] flex flex-col items-center justify-center"
          >
            <div className="text-4xl md:text-5xl mb-2">➕</div>
            <div className="text-white font-bold text-lg">Add Player</div>
          </button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center">
            <p className="text-xl font-bold mb-4">
              Remove {profiles.find((p) => p.id === confirmDeleteId)?.name}?
            </p>
            <p className="text-gray-600 mb-6">This will delete all their progress.</p>
            <div className="flex gap-4">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 min-h-[60px] bg-gray-400 hover:bg-gray-500 text-white font-bold text-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 min-h-[60px] bg-red-500 hover:bg-red-600 text-white font-bold text-lg"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StartScreen() {
  const {
    playerName,
    setPlayerName,
    setDifficultyLevel,
    setPhase,
    score,
    correctAnswers,
    questionsAnswered,
    highScore,
  } = useTankGame();
  const { profiles, activeProfileId, getActiveProfile, clearActiveProfile } = useProfiles();
  const { achievements } = useAchievements();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [blinkVisible, setBlinkVisible] = useState(true);

  // Classic NES blinking cursor effect - must be before early returns
  useEffect(() => {
    const interval = setInterval(() => setBlinkVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const activeProfile = getActiveProfile();

  // Show add player form
  if (showAddPlayer || profiles.length === 0) {
    return (
      <AddPlayerForm
        onDone={() => setShowAddPlayer(false)}
      />
    );
  }

  // Show profile picker when no profile is selected (or name not set)
  if (!activeProfileId || !playerName) {
    return (
      <ProfileSelector
        onAddNew={() => setShowAddPlayer(true)}
      />
    );
  }

  if (showAchievements) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 p-8 overflow-y-auto">
        <div>
          <AchievementsPanel />
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAchievements(false)}
              className="text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white font-mono px-8 py-4"
            >
              BACK TO MENU
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSwitchProfile = () => {
    clearActiveProfile();
    setPlayerName("");
  };

  const accuracy =
    activeProfile && activeProfile.totalAnswered > 0
      ? Math.round((activeProfile.totalCorrect / activeProfile.totalAnswered) * 100)
      : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              opacity: 0.3 + (i % 4) * 0.2,
              animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center w-full max-w-lg mx-auto px-4">
        {/* Title with retro pixel shadow */}
        <h1
          className="text-4xl md:text-6xl font-bold text-yellow-400 mb-1 font-mono tracking-wider"
          style={{
            textShadow: "4px 4px 0px #b45309, 2px 2px 0px #92400e",
            letterSpacing: "0.15em",
          }}
        >
          TANK READER
        </h1>

        {/* Subtitle with retro flicker */}
        <p
          className="text-xs md:text-sm text-cyan-400 font-mono mb-4 tracking-widest"
          style={{ textShadow: "0 0 8px #22d3ee" }}
        >
          {activeProfile?.difficultyLevel === "letters" ? "--- LETTER MODE ---" : "--- WORD MODE ---"}
        </p>

        {/* Player badge */}
        {activeProfile && (
          <button
            onClick={handleSwitchProfile}
            aria-label="Switch player"
            className="inline-flex items-center gap-2 border-2 border-cyan-500 px-4 py-1 mb-4 font-mono text-sm hover:bg-cyan-500/20 transition-colors"
            style={{ imageRendering: "pixelated" }}
          >
            <span className="text-xl">{activeProfile.avatar}</span>
            <span className="text-cyan-400 font-bold">{activeProfile.name.toUpperCase()}</span>
            <span className="text-cyan-600 text-xs">&#9660;</span>
          </button>
        )}

        {/* High score bar - compact NES style */}
        <div className="flex justify-center gap-6 mb-4 font-mono text-xs md:text-sm">
          {activeProfile && (
            <>
              <div>
                <span className="text-gray-500">HI-SCORE </span>
                <span className="text-yellow-400">{(activeProfile.highScore || 0).toString().padStart(6, "0")}</span>
              </div>
              <div>
                <span className="text-gray-500">GAMES </span>
                <span className="text-white">{activeProfile.gamesPlayed}</span>
              </div>
              {accuracy !== null && (
                <div>
                  <span className="text-gray-500">ACC </span>
                  <span className="text-green-400">{accuracy}%</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Menu items - NES style list */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => setPhase("quiz")}
            className="w-full min-h-[52px] py-3 text-xl md:text-2xl font-bold font-mono text-white border-2 border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/30 active:bg-yellow-500/50 transition-colors tracking-wide"
          >
            {blinkVisible ? "\u25B6" : "\u00A0"} START GAME
          </button>

          <button
            onClick={() => setPhase("leaderboard")}
            className="w-full min-h-[48px] py-2 text-base md:text-lg font-bold font-mono text-gray-300 border-2 border-gray-600 hover:border-gray-400 hover:text-white hover:bg-white/5 transition-colors tracking-wide"
          >
            LEADERBOARD
          </button>

          <button
            onClick={() => setShowAchievements(true)}
            className="w-full min-h-[48px] py-2 text-base md:text-lg font-bold font-mono text-gray-300 border-2 border-gray-600 hover:border-gray-400 hover:text-white hover:bg-white/5 transition-colors tracking-wide"
          >
            ACHIEVEMENTS {unlockedCount}/{achievements.length}
          </button>
        </div>

        {/* Last game stats - single compact line */}
        {questionsAnswered > 0 && (
          <div className="font-mono text-xs text-gray-500 mb-2">
            LAST: {score} PTS &middot; {correctAnswers}/{questionsAnswered} CORRECT
          </div>
        )}

        {/* Bottom credits line */}
        <div
          className="font-mono text-xs text-gray-600 tracking-widest"
          style={{ textShadow: "0 0 4px #333" }}
        >
          &copy; 2025 HALLEN FAMILY
        </div>
      </div>
    </div>
  );
}
