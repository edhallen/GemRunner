// Shared speech synthesis utility with best-available voice selection.
// Voice priority: Google US English > Samantha (macOS) > Microsoft Zira > any en-US > any en.

let bestVoice: SpeechSynthesisVoice | null = null;
let voiceReady = false;

function selectBestVoice() {
  if (!('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices();
  bestVoice =
    voices.find(v => v.name.includes('Google US English')) ||
    voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-US')) ||
    voices.find(v => v.name.includes('Samantha')) ||
    voices.find(v => v.name.includes('Microsoft Zira')) ||
    voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en-US')) ||
    voices.find(v => v.lang.startsWith('en-US')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;

  voiceReady = bestVoice !== null;
}

// Initialize voice selection immediately and on voiceschanged
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  if (window.speechSynthesis.getVoices().length > 0) {
    selectBestVoice();
  }
  window.speechSynthesis.addEventListener('voiceschanged', selectBestVoice);
}

/** Speak text aloud using the best available voice. */
export function speak(text: string, rate = 0.85) {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis unavailable
  }
}

/** Returns true if a voice has been loaded and is ready. */
export function isVoiceReady(): boolean {
  return voiceReady;
}

/** Get the selected voice (for components that manage their own utterance). */
export function getBestVoice(): SpeechSynthesisVoice | null {
  return bestVoice;
}
