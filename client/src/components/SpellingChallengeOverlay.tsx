import { useState, useEffect, useRef } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { speakWord, speakLetter } from "@/lib/speech";

export function SpellingChallengeOverlay() {
  const crSpellingChallengeActive = useTankGame(s => s.crSpellingChallengeActive);
  const crSpellingWord = useTankGame(s => s.crSpellingWord);
  const crSpellingCorrectCount = useTankGame(s => s.crSpellingCorrectCount);
  const answerSpellingChallenge = useTankGame(s => s.answerSpellingChallenge);
  const dismissSpellingChallenge = useTankGame(s => s.dismissSpellingChallenge);
  const difficultyLevel = useTankGame(s => s.difficultyLevel);
  const isLetters = difficultyLevel === "letters";

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCorrectCount = useRef(crSpellingCorrectCount);

  useEffect(() => {
    if (crSpellingChallengeActive && inputRef.current) {
      inputRef.current.focus();
    }
    setInput("");
    setFeedback(null);
    setReward(null);
  }, [crSpellingChallengeActive]);

  if (!crSpellingChallengeActive || !crSpellingWord) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const correct = answerSpellingChallenge(input);
    setFeedback(correct ? "correct" : "wrong");

    // Check if treasure chest was earned (crSpellingCorrectCount changed by 1 and is divisible by 3)
    if (correct) {
      const newCount = useTankGame.getState().crSpellingCorrectCount;
      if (newCount % 3 === 0 && newCount !== prevCorrectCount.current) {
        // Determine what was given
        const state = useTankGame.getState();
        setReward("TREASURE CHEST REWARD!");
      }
      prevCorrectCount.current = newCount;
    }

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      setReward(null);
      dismissSpellingChallenge();
    }, correct ? 1500 : 2500);
  };

  const handleRepeat = () => {
    if (isLetters) {
      speakLetter(crSpellingWord);
    } else {
      speakWord(crSpellingWord);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-2 border-purple-500 p-6 max-w-sm w-full mx-4">
        <h3
          className="text-xl font-bold text-yellow-400 font-mono text-center mb-4"
          style={{ textShadow: "2px 2px 0px #92400e" }}
        >
          {isLetters ? "TYPE THE LETTER" : "SPELL THE WORD"}
        </h3>

        <button
          onClick={handleRepeat}
          className="w-14 h-14 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/30 text-2xl font-mono mx-auto flex items-center justify-center mb-4"
        >
          &#9834;
        </button>

        <p className="text-gray-400 font-mono text-xs text-center mb-3">
          {isLetters ? "Listen and type the letter you hear" : "Listen and type the word you hear"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!!feedback}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full h-12 text-xl font-bold font-mono text-center border-2 border-gray-500 bg-gray-800 text-white focus:border-purple-400 outline-none mb-3"
          />
          <button
            type="submit"
            disabled={!input.trim() || !!feedback}
            className="w-full h-12 text-lg font-bold font-mono border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CHECK
          </button>
        </form>

        {feedback && (
          <div className={`text-center font-mono font-bold mt-3 ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
            {feedback === "correct" ? "CORRECT! +50" : isLetters ? `The letter was: ${crSpellingWord.toUpperCase()}` : `The word was: ${crSpellingWord.toLowerCase()}`}
          </div>
        )}

        {reward && (
          <div className="text-center font-mono font-bold mt-2 text-yellow-400 animate-bounce">
            {reward}
          </div>
        )}

        <div className="text-center font-mono text-xs text-gray-500 mt-3">
          Correct: {crSpellingCorrectCount} / next chest: {3 - (crSpellingCorrectCount % 3)}
        </div>
      </div>
    </div>
  );
}
