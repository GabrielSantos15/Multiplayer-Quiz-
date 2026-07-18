"use client";

import { useState } from "react";
import { startSession, type PlayerSession } from "@/lib/storage/player-session";
import UserImage from "../ui/UserImage";
import { IoReload } from "react-icons/io5";

interface FormUserProps {
  mode: "create" | "join";
  loading?: boolean;
  onSubmit: (session: PlayerSession) => void;
  roomCode?: string;
  setRoomCode?: (code: string) => void;
}

export default function FormUser({
  mode,
  loading = false,
  onSubmit,
  roomCode = "",
  setRoomCode,
}: FormUserProps) {
  const [nick, setNick] = useState("");
  const [avatarSeed, setAvatarSeed] = useState(() => crypto.randomUUID());

  const isSubmitDisabled = 
    loading || 
    !nick.trim() || 
    (mode === "join" && !roomCode.trim());

  function handleSubmit() {
    if (isSubmitDisabled) return;

    const session = startSession(nick.trim(), avatarSeed);
    onSubmit(session);
  }

  return (
    <section className="mt-16 flex w-full md:max-w-sm flex-col items-center gap-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 pt-0 shadow-2xl h-fit">
      
      {/* Avatar Flutuante */}
      <div className="relative -mt-16 mb-2">
        <UserImage 
          seed={avatarSeed} 
          className="h-32 w-32 rounded-full border-4 border-[var(--bg-surface)] shadow-lg bg-white object-cover" 
        />

        <button
          type="button"
          onClick={() => setAvatarSeed(crypto.randomUUID())}
          className="absolute bottom-1 right-1 flex cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] p-2 text-white shadow-md transition-all hover:bg-[var(--color-primary-hover)] active:-rotate-180 md:p-3"
          title="Gerar novo avatar"
        >
          <IoReload size={20} />
        </button>
      </div>

      <div className="w-full space-y-4 text-center">
        {/* Input de Nickname */}
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Seu nickname..."
          maxLength={20}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4 text-center text-lg font-medium outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />

        {/* Input de Código da Sala ( modo Join) */}
        {mode === "join" && setRoomCode && (
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO DA SALA"
            maxLength={6}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4 text-center font-mono text-lg font-bold tracking-widest uppercase outline-none transition-all focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="w-full cursor-pointer rounded-xl bg-[var(--color-primary)] px-4 py-4 font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
      >
        {loading
          ? "Aguardando..."
          : mode === "create"
            ? "Criar Sala"
            : "Entrar na Sala"}
      </button>
    </section>
  );
}