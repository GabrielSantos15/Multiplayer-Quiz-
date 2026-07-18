"use client";

import { Volume2, VolumeX } from "lucide-react";
// 1. Corrigido para importar useSound
import { useSound } from "@/providers/SoundProvider"; 

interface SoundButtonProps {
  className?: string;
}

export default function SoundButton({
  className = "",
}: SoundButtonProps) {
  // 2. Corrigido para chamar useSound()
  const { isMuted, toggleMute } = useSound(); 

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? "Ativar sons" : "Desativar sons"}
      title={isMuted ? "Ativar sons" : "Desativar sons"}
      className={`
        flex h-11 w-11 cursor-pointer items-center justify-center
        rounded-xl border border-[var(--border-color)]
        bg-[var(--bg-surface)]
        text-[var(--text-primary)]
        shadow-sm
        transition-all duration-200
        hover:scale-105
        hover:border-[var(--color-secondary)]
        hover:text-[var(--color-secondary)]
        active:scale-95
        ${className}
      `}
    >
      {isMuted ? (
        <VolumeX size={22} />
      ) : (
        <Volume2 size={22} />
      )}
    </button>
  );
}