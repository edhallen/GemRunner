import { useState, useEffect } from "react";
import { useTankGame, getRequiredLessonPoints } from "@/lib/stores/useTankGame";
import { speak, speakWord, speakLetter, isVoiceReady } from "@/lib/speech";

export function QuizScreen() {
  const { currentQuestion, answerQuestion, setPhase, lessonPoints, typingQuizCorrect, currentLevel, playerName, difficultyLevel } = useTankGame();
  const isLetters = difficultyLevel === "letters";
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showWordHint, setShowWordHint] = useState(false);

  const extractWordFromQuestion = (question: string): string => {
    const match = question.match(/Which word is (.+)\?/i);
    return match ? match[1].trim() : question;
  };

  const speakAnswer = (text: string) => {
    if (isLetters) {
      speakLetter(text);
    } else {
      speakWord(text);
    }
  };

  const handleSpeakWord = () => {
    if (!currentQuestion) return;

    const textToSpeak = currentQuestion.correctAnswer.toLowerCase();

    if (isVoiceReady()) {
      speakAnswer(textToSpeak);
    } else {
      setShowWordHint(true);
      setTimeout(() => setShowWordHint(false), 2000);
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

    // Corrective feedback: speak correct answer
    if (correct) {
      // Enthusiastic confirmation
      speak(`Yes! ${currentQuestion.correctAnswer.toLowerCase()}!`, 1.0);
    } else {
      // Corrective: speak the right answer
      speakAnswer(currentQuestion.correctAnswer.toLowerCase());
    }

    // 3 seconds for wrong (study time), 2 for correct
    const delay = correct ? 2000 : 3000;

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setTypedAnswer("");
      setPhase("game_mode_selection");
    }, delay);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      handleAnswer(typedAnswer);
    }
  };

  // Determine if this mode has options
  const hasOptions = currentQuestion.mode === "multiple_choice" ||
    currentQuestion.mode === "letter_sounds" ||
    currentQuestion.mode === "word_family";

  const numOptions = hasOptions ? (currentQuestion as { options: string[] }).options.length : 0;
  const gridCols = currentQuestion.mode === "letter_sounds"
    ? 'grid-cols-3'
    : numOptions <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  // Progress calculation
  const isTypingMode = currentQuestion.mode === "typing" || currentQuestion.mode === "letter_sounds" || currentQuestion.mode === "word_family";
  const progressPercent = isTypingMode
    ? Math.min((typingQuizCorrect / 3) * 100, 100)
    : Math.min((lessonPoints / requiredPoints) * 100, 100);
  const progressText = isTypingMode
    ? `${typingQuizCorrect}/3`
    : `${lessonPoints}/${requiredPoints}`;
  const remaining = isTypingMode
    ? 3 - typingQuizCorrect
    : requiredPoints - lessonPoints;

  // Mode-specific header
  const getHeader = () => {
    switch (currentQuestion.mode) {
      case "letter_sounds": return "LETTER CHALLENGE";
      case "word_family": return `THE ${(currentQuestion as { familyPattern: string }).familyPattern.toUpperCase()} FAMILY`;
      default: return "READING CHALLENGE";
    }
  };

  // Get options list for option-based modes
  const options = hasOptions ? (currentQuestion as { options: string[] }).options : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              opacity: 0.2 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-3">
          {playerName && (
            <p className="text-sm font-mono text-cyan-400 mb-1">
              {playerName.toUpperCase()}, LISTEN CAREFULLY!
            </p>
          )}
          <h2
            className="text-2xl md:text-3xl font-bold text-yellow-400 font-mono tracking-wide mb-3"
            style={{ textShadow: "3px 3px 0px #92400e" }}
          >
            {getHeader()}
          </h2>

          {/* Speaker button */}
          <button
            onClick={handleSpeakWord}
            aria-label="Read word aloud"
            className="w-16 h-16 md:w-20 md:h-20 border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/30 active:bg-cyan-500/50 text-3xl md:text-4xl font-mono transition-colors mx-auto flex items-center justify-center"
          >
            &#9834;
          </button>
          {showWordHint && currentQuestion && (
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-2 animate-pulse">
              {currentQuestion.correctAnswer}
            </div>
          )}
        </div>

        {/* Answer options */}
        {hasOptions ? (
          <div className={`grid ${gridCols} gap-2 mb-4`}>
            {options.map((option, index) => {
              const normalizedOption = option.trim().toUpperCase();
              const normalizedCorrect = currentQuestion.correctAnswer.trim().toUpperCase();
              const isThisCorrect = normalizedOption === normalizedCorrect;

              let btnStyle = "border-gray-500 text-white hover:border-cyan-400 hover:bg-cyan-500/10";
              if (showFeedback) {
                if (selectedAnswer === option && isCorrect) {
                  // Selected and correct
                  btnStyle = "border-green-400 bg-green-500/30 text-green-300 scale-105";
                } else if (selectedAnswer === option && !isCorrect) {
                  // Selected but wrong
                  btnStyle = "border-red-400 bg-red-500/30 text-red-300";
                } else if (!isCorrect && isThisCorrect) {
                  // Highlight the correct answer when wrong (corrective feedback)
                  btnStyle = "border-green-400 bg-green-500/20 text-green-400 ring-2 ring-green-400";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`
                    ${currentQuestion.mode === "letter_sounds" ? "h-14 md:h-16 text-2xl md:text-3xl" : "h-14 md:h-16 text-base md:text-xl"}
                    min-h-[52px] font-bold font-mono border-2 transition-all
                    ${btnStyle}
                    disabled:cursor-not-allowed
                  `}
                >
                  {currentQuestion.mode === "letter_sounds" ? option : option.toLowerCase()}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleTypingSubmit} className="mb-4 space-y-3">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="type here..."
              disabled={showFeedback}
              className="w-full h-14 md:h-16 text-3xl md:text-4xl font-bold font-mono text-center bg-black border-2 border-cyan-500 text-cyan-400 placeholder:text-gray-600 focus:outline-none focus:border-yellow-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={showFeedback || !typedAnswer.trim()}
              className="w-full h-12 min-h-[48px] text-lg font-bold font-mono border-2 border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              SUBMIT
            </button>
          </form>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="text-center mb-3">
            <div className={`text-xl md:text-2xl font-bold font-mono ${isCorrect ? "text-green-400" : "text-red-400"}`}>
              {isCorrect ? "CORRECT!" : "TRY AGAIN NEXT TIME!"}
            </div>
            {/* Corrective feedback: show correct answer for wrong answers */}
            {!isCorrect && (
              <div className="text-lg font-mono text-green-300 mt-1">
                The answer is: <span className="text-green-400 font-bold">{currentQuestion.correctAnswer.toLowerCase()}</span>
              </div>
            )}
            {/* For typing mode: show correctly spelled word */}
            {isCorrect && currentQuestion.mode === "typing" && (
              <div className="text-lg font-mono text-green-300 mt-1">
                {currentQuestion.correctAnswer.toLowerCase()}
              </div>
            )}
          </div>
        )}

        {/* Progress bar - NES style */}
        <div className="border-2 border-gray-600 p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono text-gray-500">
              {isTypingMode ? "PROGRESS" : "LESSON"}
            </span>
            <span className="text-xs font-mono text-yellow-400">
              {progressText}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-900 border border-gray-700">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent >= 100 ? "#22c55e" : "#eab308",
              }}
            />
          </div>
          <div className="text-center mt-1">
            <span className="text-xs font-mono text-gray-500">
              {remaining > 0 ? `${remaining} MORE TO UNLOCK` : "READY TO PLAY!"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
