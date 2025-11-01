import { useState } from "react";
import { useTankGame } from "../lib/stores/useTankGame";

export function NameEntry() {
  const [name, setName] = useState("");
  const { setPlayerName, setPhase } = useTankGame();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      setPlayerName(trimmedName);
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
