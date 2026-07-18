"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import FormUser from "@/components/setup/FormUser";
import type { PlayerSession } from "@/lib/storage/player-session";
import { saveRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";

import {
  Circle,
  Globe,
  Lock,
  Clock,
  BookOpen,
  Gamepad2,
} from "lucide-react";
import { useSounds } from "@/hooks/useSounds";
import SoundButton from "@/components/ui/SoundButton";

type QuizDifficulty = "easy" | "medium" | "hard";

interface RoomResponse {
  code: string;
}

const difficulties = [
  {
    value: "easy",
    label: "Fácil",
    description: "Bandeiras, continentes e mapas",
  },
  {
    value: "medium",
    label: "Médio",
    description: "Inclui capitais e fronteiras além das fáceis",
  },
  {
    value: "hard",
    label: "Difícil",
    description: "Inclui população e área, além das médias",
  },
] as const;

export default function CreateRoom() {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<QuizDifficulty>("easy");
  const [isPublic, setIsPublic] = useState(true);
  const [questionsAmount, setQuestionsAmount] = useState(5);
  const [questionTime, setQuestionTime] = useState(15);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { click } = useSounds();

  function handlePlayerCreated(session: PlayerSession) {
    click()
    setError("");
    setLoading(true);

    socket.off("room:created");
    socket.off("room:error");

    socket.once("room:created", (room: RoomResponse) => {
      saveRoomSession({
        code: room.code,
      });

      router.push(`/room/${room.code}`);
    });

    socket.once(
      "room:error",
      (payload: { message?: string }) => {
        setLoading(false);

        setError(
          payload.message ??
          "Não foi possível criar a sala."
        );
      }
    );

    socket.emit("room:create", {
      hostId: session.playerId,
      category: "geography",
      difficulty,
      isPublic,
      questionsAmount,
      questionTime,
    });
  }

  // Paleta de cores de dificuldades
  const getDifficultyIcon = (val: QuizDifficulty, isSelected: boolean) => {
    switch (val) {
      case "easy":
        return <Circle className={`w-5 h-5 transition-colors ${isSelected ? "fill-green-500 text-green-500" : "fill-green-500/20 text-green-500/50"}`} />;
      case "medium":
        return <Circle className={`w-5 h-5 transition-colors ${isSelected ? "fill-yellow-500 text-yellow-500" : "fill-yellow-500/20 text-yellow-500/50"}`} />;
      case "hard":
        return <Circle className={`w-5 h-5 transition-colors ${isSelected ? "fill-red-500 text-red-500" : "fill-red-500/20 text-red-500/50"}`} />;
    }
  };

  return (
    <main className="flex min-h-[90vh] flex-col items-center justify-center gap-8  md:flex-row p-4 md:p-8">
      <SoundButton className="absolute top-4 right-4 md:top-8 md:right-8 z-50" />
      {/*Formulário do Usuário */}
      <FormUser
        mode="create"
        loading={loading}
        onSubmit={handlePlayerCreated}
      />

      {/* Configurações da Sala */}
      <section
        className="
          w-full
          max-w-2xl
          rounded-3xl
          border
          border-[var(--border-color)]
          bg-[var(--bg-surface)]
          p-8
          shadow-xl
          h-fit
        "
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Criar Sala <Gamepad2 className="text-[var(--color-primary)]" size={32} />
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Configure sua partida e personalize seu jogador.
          </p>
        </header>

        <div className="space-y-8">

          {/* Dificuldade */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Dificuldade
            </label>

            <div className="grid gap-3">
              {difficulties.map((item) => {
                const isSelected = difficulty === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => { click(); setDifficulty(item.value) }}
                    className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${isSelected
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-md scale-[1.01]"
                      : "border-[var(--border-color)] hover:bg-black/5"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {getDifficultyIcon(item.value, isSelected)}

                      <div>
                        <p className="font-semibold">
                          {item.label}
                        </p>

                        <p className="text-sm text-[var(--text-secondary)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configurações */}
          <div className="grid gap-4 md:grid-cols-3 items-end">

            {/* Visibilidade  */}
            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-medium">
                Visibilidade
              </label>

              <button
                type="button"
                onClick={() => { click(); setIsPublic(!isPublic) }}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-3 transition-all hover:border-[var(--color-secondary)] cursor-pointer h-[50px] shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe size={18} className="text-blue-500" />
                  ) : (
                    <Lock size={18} className="text-red-500" />
                  )}
                  <span className="text-sm font-semibold">
                    {isPublic ? "Pública" : "Privada"}
                  </span>
                </div>

                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isPublic ? "bg-[var(--color-secondary)]" : "bg-zinc-400 dark:bg-zinc-600"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isPublic ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </div>
              </button>
            </div>

            {/* Questões */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Questões
              </label>

              <div className="relative">
                <select
                  value={questionsAmount}
                  onChange={(event) => { click(); setQuestionsAmount(Number(event.target.value)) }}
                  className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-3 pr-10 h-[50px] outline-none focus:border-[var(--color-secondary)] cursor-pointer text-sm font-medium"
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <BookOpen
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
                />
              </div>
            </div>

            {/* Tempo */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tempo
              </label>

              <div className="relative">
                <select
                  value={questionTime}
                  onChange={(event) => {
                    click();
                    setQuestionTime(Number(event.target.value))
                  }
                  }
                  className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-3 pr-10 h-[50px] outline-none focus:border-[var(--color-secondary)] cursor-pointer text-sm font-medium"
                >
                  <option value={10}>10 segundos</option>
                  <option value={15}>15 segundos</option>
                  <option value={30}>30 segundos</option>
                  <option value={60}>60 segundos</option>
                </select>
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}