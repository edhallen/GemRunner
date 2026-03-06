// Client-side audio fetching, caching (Blob URLs), and playback for ElevenLabs TTS.

const cache = new Map<string, string>();

/** Fetch audio from the TTS proxy and cache as a Blob URL. Returns the Blob URL or null on failure. */
async function fetchAudio(text: string): Promise<string | null> {
  const cached = cache.get(text);
  if (cached) return cached;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) return null;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  cache.set(text, url);
  return url;
}

/** Play audio for the given text. Returns true on success, false on failure. */
export async function playAudio(text: string): Promise<boolean> {
  try {
    const url = await fetchAudio(text);
    if (!url) return false;

    const audio = new Audio(url);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

/** Preload audio for multiple words in parallel (fire-and-forget). */
export function preloadAudio(words: string[]): void {
  for (const word of words) {
    if (!cache.has(word)) {
      fetchAudio(word).catch(() => {});
    }
  }
}
