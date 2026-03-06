// Shared speech utility — tries ElevenLabs TTS first, falls back to browser speechSynthesis.

import { playAudio, preloadAudio } from "./audioCache";

// Re-export preloadAudio for convenient access
export { preloadAudio };

// --- Circuit breaker for ElevenLabs ---
let elevenLabsFailures = 0;
const MAX_FAILURES = 3;

// --- Browser voice selection (fallback) ---
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

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  if (window.speechSynthesis.getVoices().length > 0) {
    selectBestVoice();
  }
  window.speechSynthesis.addEventListener('voiceschanged', selectBestVoice);
}

/** Fallback: speak using browser speechSynthesis. */
function browserSpeak(text: string, rate = 0.85): void {
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

/** Speak text aloud — ElevenLabs first, browser speech fallback. */
export async function speak(text: string, rate = 0.85): Promise<void> {
  if (elevenLabsFailures < MAX_FAILURES) {
    try {
      const success = await playAudio(text);
      if (success) {
        elevenLabsFailures = 0;
        return;
      }
      elevenLabsFailures++;
    } catch {
      elevenLabsFailures++;
    }
  }
  browserSpeak(text, rate);
}

/** Speak a word with the pattern: "the word is [word]" ... pause ... "[word]" */
export async function speakWord(word: string): Promise<void> {
  const w = word.toLowerCase();
  await speak(`The word is ${w}.`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  await speak(w);
}

/** Speak a letter with the pattern: "the letter is [letter]" ... pause ... "[letter]" */
export async function speakLetter(letter: string): Promise<void> {
  await speak(`The letter is ${letter}.`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await speak(letter);
}

/** Returns true if a voice has been loaded and is ready. */
export function isVoiceReady(): boolean {
  return voiceReady;
}

/** Get the selected voice (for components that manage their own utterance). */
export function getBestVoice(): SpeechSynthesisVoice | null {
  return bestVoice;
}
