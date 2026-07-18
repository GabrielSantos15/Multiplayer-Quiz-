import useSoundLib from "use-sound"; 
import { useSound } from "@/providers/SoundProvider";

export function useSounds() {
  const { isMuted } = useSound(); 
  const [click] = useSoundLib("/sounds/click.mp3", { 
    volume: isMuted ? 0 : 0.2 
  });

  const [correct] = useSoundLib("/sounds/correct.mp3", { 
    volume: isMuted ? 0 : 0.5 
  });

  const [wrong] = useSoundLib("/sounds/wrong.mp3", { 
    volume: isMuted ? 0 : 0.45 
  });

  const [finish] = useSoundLib("/sounds/finish.mp3", { 
    volume: isMuted ? 0 : 0.8 
  });

  const [countdown, { stop: stopCountdown, sound: countdownSound }] = useSoundLib(
    "/sounds/countdown.mp3", 
    { volume: isMuted ? 0 : 0.35 }
  );

  const fadeOutCountdown = () => {
    if (countdownSound) {
      if (isMuted) {
        countdownSound.stop();
        return;
      }

      countdownSound.fade(0.35, 0, 1000);
      
      countdownSound.once("fade", () => {
        countdownSound.stop();
        countdownSound.volume(0.35); 
      });
    }
  };

  return {
    click,
    correct,
    wrong,
    countdown,
    stopCountdown, 
    fadeOutCountdown, 
    finish,
  };
}