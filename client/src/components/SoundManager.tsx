import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useTankGame } from "@/lib/stores/useTankGame";

export function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted, toggleMute } = useAudio();
  const { phase } = useTankGame();

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.4;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    setSuccessSound(success);

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  useEffect(() => {
    const bgMusic = useAudio.getState().backgroundMusic;
    if (!bgMusic) return;

    if (phase === "playing" && !isMuted) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  }, [phase, isMuted]);

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 bg-black/80 border-4 border-yellow-500 rounded p-3 hover:bg-black/90 transition-colors"
    >
      <span className="text-2xl">{isMuted ? "🔇" : "🔊"}</span>
    </button>
  );
}
