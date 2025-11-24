import { useState } from "react";
import { useTankGame, DifficultyLevel } from "../lib/stores/useTankGame";

export function NameEntry() {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("words");
  const { setPlayerName, setDifficultyLevel, setPhase } = useTankGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      setPlayerName(trimmedName);
      setDifficultyLevel(difficulty);
      setPhase("menu");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-purple-900 to-purple-700">
      <div className="bg-white rounded-lg p-12 max-w-xl w-full mx-4 shadow-2xl border-8 border-yellow-400">
        <h1 className="text-5xl font-bold text-center mb-4 text-purple-900">
          Tank Reader
        </h1>
        <p className="text-2xl text-center mb-8 text-gray-700">
          What's your name?
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full text-3xl p-4 border-4 border-purple-400 rounded-lg mb-6 text-center font-bold focus:outline-none focus:border-purple-600"
            autoFocus
            maxLength={20}
          />
          
          <div className="mb-6">
            <p className="text-xl text-center mb-3 text-gray-700 font-semibold">
              Choose your level:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDifficulty("letters")}
                className={`p-4 rounded-lg border-4 font-bold text-lg transition-all ${
                  difficulty === "letters"
                    ? "border-green-500 bg-green-100 text-green-900 scale-105"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                🔤 Learning Letters
                <div className="text-sm font-normal mt-1">For age 4</div>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty("words")}
                className={`p-4 rounded-lg border-4 font-bold text-lg transition-all ${
                  difficulty === "words"
                    ? "border-blue-500 bg-blue-100 text-blue-900 scale-105"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                📚 Word Recognition
                <div className="text-sm font-normal mt-1">For ages 5-7</div>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-3xl font-bold py-4 px-8 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Let's Play!
          </button>
        </form>
      </div>
    </div>
  );
}
