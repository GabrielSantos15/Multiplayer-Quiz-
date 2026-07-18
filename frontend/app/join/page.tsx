"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FormUser from "@/components/setup/FormUser";
import type { PlayerSession } from "@/lib/storage/player-session";
import { saveRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";
import { useSounds } from "@/hooks/useSounds";
import SoundButton from "@/components/ui/SoundButton";

type PublicRoom = {
    code: string;
    category: "geography";
    difficulty: "easy" | "medium" | "hard"; // <-- Atualizado para bater com o Back-end
    questionsAmount: number;
    questionTime: number;
    playersCount: number;
    maxPlayers: number;
    canJoin: boolean;
    status: "waiting";
};

interface RoomResponse {
    code: string;
}

const categoryLabels = { geography: "Geografia" } as const;
const difficultyLabels = { easy: "Fácil", medium: "Médio", hard: "Difícil" } as const;

export default function JoinRoom() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [error, setError] = useState("");

    const { click } = useSounds();

    useEffect(() => {
        let mounted = true;
        async function loadPublicRooms() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/public`);
                if (!response.ok) throw new Error("Falha ao carregar salas públicas.");
                const rooms = (await response.json()) as PublicRoom[];
                if (mounted) setPublicRooms(rooms);
            } catch {
                if (mounted) setPublicRooms([]);
            } finally {
                if (mounted) setLoadingRooms(false);
            }
        }
        loadPublicRooms();
        const intervalId = window.setInterval(loadPublicRooms, 8000);
        return () => {
            mounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    function handleJoinPublicRoom(room: PublicRoom) {
        click()
        setRoomCode(room.code);
        setError("");
    }

    function handleJoin(session: PlayerSession) {
        click()
        const normalizedCode = roomCode.trim().toUpperCase();

        if (!normalizedCode) {
            setError("Digite ou selecione o código da sala para entrar.");
            return;
        }

        setError("");
        socket.off("room:joined");
        socket.off("room:error");

        socket.once("room:joined", (room: RoomResponse) => {
            saveRoomSession({ code: room.code });
            router.push(`/room/${room.code}`);
        });

        socket.once("room:error", (payload: { message?: string }) => {
            setError(payload?.message ?? "Não foi possível entrar na sala.");
        });

        socket.emit("room:join", {
            roomCode: normalizedCode,
            playerId: session.playerId,
        });
    }

    return (
        <main className="flex min-h-[90vh] flex-col items-center justify-center gap-8 md:flex-row p-4 md:p-8">
            <SoundButton className="absolute top-4 right-4 md:top-8 md:right-8 z-50" />
            <FormUser
                mode="join"
                onSubmit={handleJoin}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
            />

            <section className="w-full max-w-xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 shadow-xl h-fit">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Salas Disponíveis</h1>
                    <p className="mt-2 text-[var(--text-secondary)]">
                        Selecione uma sala pública abaixo ou digite um código privado ao lado.
                    </p>
                </header>

                <section>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Salas públicas</h2>
                        <span className="text-sm text-[var(--text-secondary)]">
                            {loadingRooms ? "Carregando..." : `${publicRooms.length} disponível(is)`}
                        </span>
                    </div>

                    {publicRooms.length > 0 ? (
                        <div className="grid gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 custom-scrollbar">
                            {publicRooms.map((room) => {
                                const isSelected = roomCode === room.code;

                                return (
                                    <button
                                        key={room.code}
                                        type="button"
                                        onClick={() => handleJoinPublicRoom(room)}
                                        className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${isSelected
                                            ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-md"
                                            : "border-[var(--border-color)] bg-[var(--background)] hover:border-[var(--color-secondary)]/50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-lg">Sala {room.code}</p>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {categoryLabels[room.category]} - {difficultyLabels[room.difficulty as keyof typeof difficultyLabels]}
                                                </p>
                                            </div>

                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${isSelected ? 'bg-[var(--color-secondary)] text-white' : 'bg-green-500/10 text-green-600'}`}>
                                                {room.status === "waiting" ? "Aguardando" : room.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                                            <span>{room.playersCount}/{room.maxPlayers} jogadores</span>
                                            <span>•</span>
                                            <span>{room.questionsAmount} questões</span>
                                            <span>•</span>
                                            <span>{room.questionTime}s/questão</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed border-[var(--border-color)] p-6 text-center text-sm text-[var(--text-secondary)]">
                            Nenhuma sala pública disponível no momento.
                        </p>
                    )}
                </section>

                {error && <p className="mt-6 text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-xl">{error}</p>}
            </section>
        </main>
    );
}