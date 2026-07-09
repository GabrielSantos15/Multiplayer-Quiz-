"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import FormUser from "@/components/setup/FormUser";
import type { PlayerSession } from "@/lib/storage/player-session";
import { saveRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";

type QuizDifficulty = "easy" | "medium" | "hard";

interface RoomResponse {
  code: string;
}

const difficulties = [
  {
    value: "easy",
    label: "Fácil",
    icon: "🟢",
    description: "Bandeiras, capitais e continentes.",
  },
  {
    value: "medium",
    label: "Médio",
    icon: "🟡",
    description: "Inclui idiomas e moedas.",
  },
  {
    value: "hard",
    label: "Difícil",
    icon: "🔴",
    description: "Inclui população, área, fronteiras e muito mais.",
  },
] as const;

export default function CreateRoom() {
  const router = useRouter();

  const [difficulty, setDifficulty] =
    useState<QuizDifficulty>("easy");

  const [isPublic, setIsPublic] =
    useState(true);

  const [questionsAmount, setQuestionsAmount] =
    useState(10);

  const [questionTime, setQuestionTime] =
    useState(15);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePlayerCreated(session: PlayerSession) {
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

  return (
    <main>
      <section
        className="
          mx-auto
          w-full
          max-w-2xl
          rounded-3xl
          border
          border-[var(--border-color)]
          bg-[var(--bg-surface)]
          p-8
          shadow-xl
        "
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Criar Sala 🎮
          </h1>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Configure sua partida e personalize seu
            jogador.
          </p>
        </header>

        <div className="space-y-8">
          {/* Categoria */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Categoria
            </label>

            <div className="rounded-2xl border border-(--border-color) bg-(--background) p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌍</span>

                <div>
                  <p className="font-semibold">
                    Geografia
                  </p>

                  <p className="text-sm text-(--text-secondary)">
                    Responda perguntas sobre países,
                    bandeiras, capitais e muito mais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Dificuldade
            </label>

            <div className="grid gap-3">
              {difficulties.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setDifficulty(item.value)
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    difficulty === item.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-(--border-color) hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">
                      {item.icon}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {item.label}
                      </p>

                      <p className="text-sm text-(--text-secondary)">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configurações */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Visibilidade
              </label>

              <select
                value={
                  isPublic ? "public" : "private"
                }
                onChange={(event) =>
                  setIsPublic(
                    event.target.value === "public"
                  )
                }
                className="w-full rounded-xl border border-(--border-color) bg-(--background) p-3"
              >
                <option value="public">
                  🌐 Pública
                </option>

                <option value="private">
                  🔒 Privada
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Questões
              </label>

              <select
                value={questionsAmount}
                onChange={(event) =>
                  setQuestionsAmount(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-xl border border-(--border-color) bg-(--background) p-3"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tempo
              </label>

              <select
                value={questionTime}
                onChange={(event) =>
                  setQuestionTime(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-xl border border-(--border-color) bg-(--background) p-3"
              >
                <option value={10}>
                  10 segundos
                </option>

                <option value={15}>
                  15 segundos
                </option>

                <option value={30}>
                  30 segundos
                </option>

                <option value={60}>
                  60 segundos
                </option>
              </select>
            </div>
          </div>

          {/* Resumo */}
          <section className="rounded-2xl border border-(--border-color) bg-(--background) p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Resumo da partida
            </h2>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p>
                🌍 <strong>Categoria:</strong>{" "}
                Geografia
              </p>

              <p>
                🎯 <strong>Dificuldade:</strong>{" "}
                {
                  difficulties.find(
                    (d) =>
                      d.value === difficulty
                  )?.label
                }
              </p>

              <p>
                📚 <strong>Questões:</strong>{" "}
                {questionsAmount}
              </p>

              <p>
                ⏱️ <strong>Tempo:</strong>{" "}
                {questionTime}s
              </p>

              <p>
                {isPublic ? "🌐" : "🔒"}{" "}
                <strong>Visibilidade:</strong>{" "}
                {isPublic
                  ? "Pública"
                  : "Privada"}
              </p>
            </div>
          </section>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="border-t border-(--border-color) pt-6">
            <h2 className="mb-5 text-lg font-semibold">
              Seu jogador
            </h2>

            <FormUser
              mode="create"
              loading={loading}
              onSubmit={handlePlayerCreated}
            />
          </div>
        </div>
      </section>
    </main>
  );
}