import { useState, useRef, useEffect } from "react";
import { useTankGame } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";

const REQUIRED_LESSON_POINTS = 10;

export function QuizScreen() {
  const { currentQuestion, answerQuestion, setPhase, lessonPoints, currentLevel, playerName } = useTankGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = new SpeechSynthesisUtterance();
      synthRef.current.rate = 0.8; // Slow down for kids
      synthRef.current.pitch = 1.1;
    }
    
    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const extractWordFromQuestion = (question: string): string => {
    // Extract the word from "Which word is WORD?" format
    const match = question.match(/Which word is (.+)\?/i);
    return match ? match[1].trim() : question;
  };

  const speakWord = () => {
    if ('speechSynthesis' in window && synthRef.current && currentQuestion) {
      const word = extractWordFromQuestion(currentQuestion.question);
      window.speechSynthesis.cancel(); // Stop any current speech
      synthRef.current.text = word.toLowerCase(); // Convert to lowercase so it's read as a word, not acronym
      window.speechSynthesis.speak(synthRef.current);
    }
  };

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
      // Always try to advance to tank selection - setPhase will gate if not enough points
      setPhase("tank_selection");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl border-8 border-yellow-400 relative">
        <div className="text-center mb-8">
          {playerName && (
            <p className="text-2xl font-bold text-purple-700 mb-3">
              {playerName}, listen carefully!
            </p>
          )}
          <h2 className="text-4xl font-bold text-blue-900 mb-6 font-mono">
            READING CHALLENGE!
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={speakWord}
              className="bg-purple-500 hover:bg-purple-600 text-white h-20 w-20 rounded-full text-4xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
              title="Read word aloud"
            >
              🔊
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              className={`
                h-24 text-2xl font-bold font-mono transition-all
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

        <div className="mt-8 pt-6 border-t-4 border-yellow-400">
          <div className="text-center mb-3">
            <p className="text-xl font-bold text-blue-900">
              Lesson Progress: {lessonPoints} / {REQUIRED_LESSON_POINTS} points
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {REQUIRED_LESSON_POINTS - lessonPoints > 0 
                ? `${REQUIRED_LESSON_POINTS - lessonPoints} more to unlock the game!` 
                : "Ready to play! 🎮"}
            </p>
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-400">
            <div 
              className="h-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-600"
              style={{ width: `${Math.min((lessonPoints / REQUIRED_LESSON_POINTS) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
