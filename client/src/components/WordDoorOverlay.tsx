import { useState } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { speakWord } from "@/lib/speech";

export function WordDoorOverlay() {
  const wordDoorActive = useTankGame(s => s.wordDoorActive);
  const wordDoorWord = useTankGame(s => s.wordDoorWord);
  const wordDoorOptions = useTankGame(s => s.wordDoorOptions);
  const answerWordDoor = useTankGame(s => s.answerWordDoor);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (!wordDoorActive || !wordDoorWord) return null;

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    setSelectedAnswer(answer);
    const correct = answerWordDoor(answer);
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
    }, correct ? 1000 : 2000);
  };

  const handleRepeat = () => {
    speakWord(wordDoorWord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-2 border-cyan-500 p-6 max-w-sm w-full mx-4">
        <h3
          className="text-xl font-bold text-yellow-400 font-mono text-center mb-4"
          style={{ textShadow: "2px 2px 0px #92400e" }}
        >
          WORD DOOR
        </h3>

        <button
          onClick={handleRepeat}
          className="w-14 h-14 border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/30 text-2xl font-mono mx-auto flex items-center justify-center mb-4"
        >
          &#9834;
        </button>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {wordDoorOptions.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option.toUpperCase() === wordDoorWord.toUpperCase();

            let btnStyle = "border-gray-500 text-white hover:border-cyan-400";
            if (feedback) {
              if (isSelected && feedback === "correct") {
                btnStyle = "border-green-400 bg-green-500/30 text-green-300";
              } else if (isSelected && feedback === "wrong") {
                btnStyle = "border-red-400 bg-red-500/30 text-red-300";
              } else if (feedback === "wrong" && isCorrectAnswer) {
                btnStyle = "border-green-400 bg-green-500/20 text-green-400";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback}
                className={`h-12 text-lg font-bold font-mono border-2 transition-all ${btnStyle} disabled:cursor-not-allowed`}
              >
                {option.toLowerCase()}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`text-center font-mono font-bold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
            {feedback === "correct" ? "CORRECT!" : `It was: ${wordDoorWord.toLowerCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}
