"use client";

import { useRouter } from "next/navigation";

import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { clearRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";

const categoryLabels = {
    geography: "Geografia",
} as const;

export default function RoomPage() {
    const router = useRouter();

    const { room, playerId, error, roomCode } = useRoom();
    const { session } = usePlayer();

    function handleStart() {
        if (!session || !roomCode) return;

        socket.emit("game:start", {
            roomCode,
            playerId: session.playerId,
        });
    }

    function handleLeave() {
        clearRoomSession();
        router.push("/");
    }

    return (
        <main className="min-h-screen  px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Sala {roomCode || "-"}
                        </h1>

                        <p className="text-(--text-secondary)">
                            Aguarde os jogadores entrarem.
                        </p>
                    </div>

                    <button
                        onClick={handleLeave}
                        className="rounded-lg border border-(--border-color) px-4 py-2"
                    >
                        Sair
                    </button>
                </header>

                {error && (
                    <p className="mb-6 rounded-lg bg-red-500/10 p-3 text-red-500">
                        {error}
                    </p>
                )}

                <section className="rounded-2xl border border-(--border-color) bg-(--bg-surface) p-6 shadow-lg">
                    <div className="mb-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <p>
                            Categoria:{" "}
                            <strong>
                                {categoryLabels[room?.category ?? "geography"]}
                            </strong>
                        </p>

                        <p>
                            Modo: <strong>{room?.difficulty ?? "-"}</strong>
                        </p>

                        <p>
                            Visibilidade:{" "}
                            <strong>{room?.isPublic ? "Pública" : "Privada"}</strong>
                        </p>

                        <p>
                            Questões: <strong>{room?.questionsAmount ?? "-"}</strong>
                        </p>

                        <p>
                            Tempo: <strong>{room?.questionTime ?? "-"}s</strong>
                        </p>
                    </div>

                    <h2 className="mb-4 text-xl font-semibold">
                        Jogadores ({room?.players.length ?? 0})
                    </h2>

                    <ul className="space-y-3">
                        {(room?.players ?? []).map((player) => (
                            <li
                                key={player.playerId}
                                className={`flex items-center gap-4 rounded-xl border border-(--border-color) p-3 ${player.playerId === playerId ? "bg-blue-50" : ""
                                    }`}
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${player.avatarSeed}`}
                                    alt={player.nickname}
                                    className="h-14 w-14 rounded-full"
                                />

                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {player.nickname}
                                    </p>

                                    {room?.hostId === player.playerId && (
                                        <span className="text-xs text-blue-500">
                                            Host
                                        </span>
                                    )}
                                </div>

                                <span
                                    className={
                                        player.online
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }
                                >
                                    ●
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-6 flex justify-center">
                    {room?.hostId === playerId ? (
                        <button
                            onClick={handleStart}
                            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Iniciar partida
                        </button>
                    ) : (
                        <p className="text-(--text-secondary)">
                            Aguardando o host iniciar a partida...
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}