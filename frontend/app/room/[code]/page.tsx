"use client";

import { useRouter } from "next/navigation";

import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { clearRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";
import UserImage from "@/components/ui/UserImage";
import { LogOut, Play } from "lucide-react"; // Sugestão: Ícones para os botões!
import { useSounds } from "@/hooks/useSounds";

const categoryLabels = {
    geography: "Geografia",
} as const;

export default function RoomPage() {
    const router = useRouter();
    const { click } = useSounds();
    const { room, playerId, error, roomCode } = useRoom();
    const { session } = usePlayer();

    function handleStart() {
        if (!session || !roomCode) return;
        click()

        socket.emit("game:start", {
            roomCode,
            playerId: session.playerId,
        });
    }

    function handleLeave() {
        click()
        clearRoomSession();
        router.push("/");
    }

    return (
        <main className="min-h-screen p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-4xl mt-4 md:mt-12">

                <header className="mb-8 flex items-center justify-between rounded-3xl bg-[var(--bg-surface)] p-6 md:p-8 border border-[var(--border-color)] shadow-sm">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Sala {roomCode || "..."}
                        </h1>

                        <p className="mt-2 text-[var(--text-secondary)] font-medium">
                            Aguarde os jogadores entrarem.
                        </p>
                    </div>

                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 rounded-xl border-2 border-[var(--border-color)] bg-transparent px-5 py-3 font-semibold text-[var(--text-secondary)] transition-all hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 active:scale-95"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:block">Sair da Sala</span>
                    </button>
                </header>

                {error && (
                    <p className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm font-medium text-red-500 border border-red-500/20">
                        {error}
                    </p>
                )}

                <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 md:p-8 shadow-xl">

                    {/* Informações da Sala */}
                    <div className="mb-8 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4 bg-[var(--background)] p-4 rounded-2xl border border-[var(--border-color)]">
                        <div className="flex flex-col">
                            <span className="text-[var(--text-secondary)] mb-1">Categoria</span>
                            <strong className="text-lg">{categoryLabels[room?.category ?? "geography"]}</strong>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--text-secondary)] mb-1">Modo</span>
                            <strong className="text-lg capitalize">{room?.difficulty ?? "-"}</strong>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--text-secondary)] mb-1">Visibilidade</span>
                            <strong className="text-lg">{room?.isPublic ? "Pública" : "Privada"}</strong>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--text-secondary)] mb-1">Formato</span>
                            <strong className="text-lg">{room?.questionsAmount ?? "-"}Q • {room?.questionTime ?? "-"}s</strong>
                        </div>
                    </div>

                    {/* Lista de Jogadores */}
                    <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                        Jogadores
                        <span className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] py-1 px-3 rounded-full text-sm">
                            {room?.players.length ?? 0} / 10
                        </span>
                    </h2>

                    <ul className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                        {(room?.players ?? []).map((player) => {
                            const isMe = player.playerId === playerId;
                            const isHost = room?.hostId === player.playerId;

                            return (
                                <li
                                    key={player.playerId}
                                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300
                                        ${isMe
                                            ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 shadow-sm"
                                            : "border-[var(--border-color)] bg-[var(--background)]"
                                        } 
                                        ${!player.online ? "opacity-40 grayscale" : ""} 
                                    `}
                                >
                                    <UserImage
                                        seed={player.avatarSeed}
                                        nickname={player.nickname}
                                        className="h-14 w-14 rounded-full border-2 border-white shadow-sm bg-white"
                                    />

                                    <div className="flex-1">
                                        <p className="font-semibold text-lg flex items-center gap-2">
                                            {player.nickname}
                                            {isMe && <span className="text-xs font-normal text-[var(--text-secondary)]">(Você)</span>}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            {isHost && (
                                                <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider">
                                                    Host
                                                </span>
                                            )}
                                            {!player.online && (
                                                <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                                                    Offline
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Rodapé de Ação */}
                    <div className="flex justify-center pt-6 border-t border-[var(--border-color)]">
                        {room?.hostId === playerId ? (
                            <button
                                onClick={handleStart}
                                className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-10 py-4 font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-hover)] active:scale-95 text-lg cursor-pointer
                                "
                            >
                                <Play fill="currentColor" size={20} />
                                Iniciar Partida
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 w-full">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <p className="font-medium">
                                    Aguardando o host iniciar a partida...
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}