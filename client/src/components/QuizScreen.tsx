import { useState, useRef, useEffect } from "react";
import { useTankGame, getRequiredLessonPoints } from "@/lib/stores/useTankGame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuizScreen() {
  const { currentQuestion, answerQuestion, setPhase, lessonPoints, typingQuizCorrect, currentLevel, playerName } = useTankGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis with natural voice
    if ('speechSynthesis' in window) {
      synthRef.current = new SpeechSynthesisUtterance();
      synthRef.current.rate = 0.85; // Slightly slow for clarity
      synthRef.current.pitch = 1.0; // Natural pitch
      
      // Wait for voices to load and select the best one
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Prioritize high-quality voices for children
        // 1. Google US English (most natural)
        // 2. Microsoft voices
        // 3. Any en-US voice
        const preferredVoice = 
          voices.find(v => v.name.includes('Google US English')) ||
          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-US')) ||
          voices.find(v => v.name.includes('Samantha')) || // macOS high-quality voice
          voices.find(v => v.name.includes('Microsoft Zira')) || // Windows female voice
          voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice && synthRef.current) {
          synthRef.current.voice = preferredVoice;
          console.log('Selected voice:', preferredVoice.name);
        }
      };
      
      // Voices might not be loaded immediately
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', setVoice);
      }
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
      let textToSpeak = "";
      
      if (currentQuestion.mode === "letter_sounds") {
        // For letter sounds, speak the phonetic sound
        textToSpeak = (currentQuestion as any).letterSound || currentQuestion.correctAnswer.toLowerCase();
      } else if (currentQuestion.mode === "typing") {
        textToSpeak = currentQuestion.correctAnswer.toLowerCase();
      } else {
        textToSpeak = extractWordFromQuestion(currentQuestion.question).toLowerCase();
      }
      
      window.speechSynthesis.cancel(); // Stop any current speech
      synthRef.current.text = textToSpeak;
      window.speechSynthesis.speak(synthRef.current);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const requiredPoints = getRequiredLessonPoints(currentLevel);

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answerQuestion(answer);
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setTypedAnswer("");
      // Always try to advance to game mode selection - setPhase will gate if not enough points
      setPhase("game_mode_selection");
    }, 2000);
  };
  
  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      handleAnswer(typedAnswer);
    }
  };

  // Determine grid columns based on number of options (for multiple choice and letter_sounds)
  const numOptions = (currentQuestion.mode === "multiple_choice" || currentQuestion.mode === "letter_sounds") 
    ? currentQuestion.options.length 
    : 0;
  const gridCols = currentQuestion.mode === "letter_sounds" 
    ? 'grid-cols-3' // 3x3 grid for 9 letters
    : numOptions <= 4 ? 'grid-cols-2' : numOptions <= 6 ? 'grid-cols-3' : 'grid-cols-3';

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

        {currentQuestion.mode === "multiple_choice" || currentQuestion.mode === "letter_sounds" ? (
          <div className={`grid ${gridCols} gap-4`}>
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
                className={`
                  ${currentQuestion.mode === "letter_sounds" ? "h-20 text-4xl" : "h-24 text-2xl"} 
                  font-bold font-mono transition-all
                  ${showFeedback && selectedAnswer === option
                    ? isCorrect
                      ? "bg-green-500 hover:bg-green-500 text-white scale-110"
                      : "bg-red-500 hover:bg-red-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105"
                  }
                `}
              >
                {currentQuestion.mode === "letter_sounds" ? option : option.toLowerCase()}
              </Button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleTypingSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type the word here..."
                disabled={showFeedback}
                className="!text-5xl font-bold font-mono h-24 text-center border-4 border-blue-500 focus:border-purple-500 placeholder:text-5xl"
                style={{ fontSize: '3rem' }}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={showFeedback || !typedAnswer.trim()}
              className="w-full h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            >
              Submit Answer
            </Button>
          </form>
        )}

        {showFeedback && (
          <div className={`mt-6 text-center text-3xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "🎉 CORRECT! Great job!" : "❌ Try again next time!"}
          </div>
        )}

        <div className="mt-8 pt-6 border-t-4 border-yellow-400">
          <div className="text-center mb-3">
            {currentQuestion.mode === "typing" || currentQuestion.mode === "letter_sounds" ? (
              <>
                <p className="text-xl font-bold text-blue-900">
                  {currentQuestion.mode === "letter_sounds" ? "Letter Learning" : "Typing"} Progress: {typingQuizCorrect} / 3 correct
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {3 - typingQuizCorrect > 0 
                    ? `${3 - typingQuizCorrect} more to unlock the game!` 
                    : "Ready to play! 🎮"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-blue-900">
                  Lesson Progress: {lessonPoints} / {requiredPoints} points
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {requiredPoints - lessonPoints > 0 
                    ? `${requiredPoints - lessonPoints} more to unlock the game!` 
                    : "Ready to play! 🎮"}
                </p>
              </>
            )}
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-400">
            <div 
              className="h-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-600"
              style={{ 
                width: (currentQuestion.mode === "typing" || currentQuestion.mode === "letter_sounds")
                  ? `${Math.min((typingQuizCorrect / 3) * 100, 100)}%`
                  : `${Math.min((lessonPoints / requiredPoints) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
