import { useState } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

export function QuizScreen() {
  const { currentQuestion, answerQuestion, setPhase } = useTankGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answerQuestion(answer);
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setPhase("tank_selection");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl border-8 border-yellow-400">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-blue-900 mb-4 font-mono">
            READING CHALLENGE!
          </h2>
          <p className="text-2xl text-gray-800 font-bold mb-2">
            {currentQuestion.question}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              className={`
                h-24 text-3xl font-bold font-mono transition-all
                ${showFeedback && selectedAnswer === option
                  ? isCorrect
                    ? "bg-green-500 hover:bg-green-500 text-white scale-110"
                    : "bg-red-500 hover:bg-red-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105"
                }
              `}
            >
              {option}
            </Button>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-6 text-center text-3xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "🎉 CORRECT! Great job!" : "❌ Try again next time!"}
          </div>
        )}
      </div>
    </div>
  );
}
