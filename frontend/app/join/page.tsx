"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FormUser from "@/components/setup/FormUser";
import type { PlayerSession } from "@/lib/storage/player-session";
import { saveRoomSession } from "@/lib/storage/room-session";
import socket from "@/lib/socket";

type PublicRoom = {
	code: string;
	category: "geography";
	mode: "flags" | "capitals" | "continents";
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

const categoryLabels = {
	geography: "Geografia",
} as const;

const modeLabels = {
	flags: "Bandeiras",
	capitals: "Capitais",
	continents: "Continentes",
} as const;

export default function JoinRoom() {
	const router = useRouter();
	const [roomCode, setRoomCode] = useState("");
	const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
	const [loadingRooms, setLoadingRooms] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;

		async function loadPublicRooms() {
			try {
				const response = await fetch(
					`http://localhost:3001/rooms/public`
				);

				if (!response.ok) {
					throw new Error("Falha ao carregar salas publicas.");
				}

				const rooms = (await response.json()) as PublicRoom[];

				if (mounted) {
					setPublicRooms(rooms);
				}
			} catch {
				if (mounted) {
					setPublicRooms([]);
				}
			} finally {
				if (mounted) {
					setLoadingRooms(false);
				}
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
		setRoomCode(room.code);
	}

	function handleJoin(session: PlayerSession) {
		const normalizedCode = roomCode.trim().toUpperCase();

		if (!normalizedCode) {
			setError("Digite o codigo da sala para entrar.");
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
			setError(payload?.message ?? "Nao foi possivel entrar na sala.");
		});

		socket.emit("room:join", {
			roomCode: normalizedCode,
			playerId: session.playerId,
		});
	}

	return (
		<main className="min-h-screen flex items-center justify-center px-6">
			<section className="w-full max-w-xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 shadow-lg">
				<header className="mb-8">
					<h1 className="text-3xl font-bold">Entrar na Sala</h1>
					<p className="mt-2 text-[var(--text-secondary)]">
						Entre em uma sala publica ou informe o codigo de uma sala privada.
					</p>
				</header>

				<section className="mb-8">
					<div className="mb-3 flex items-center justify-between gap-3">
						<h2 className="text-lg font-semibold">Salas publicas</h2>
						<span className="text-sm text-[var(--text-secondary)]">
							{loadingRooms ? "Carregando..." : `${publicRooms.length} disponivel(is)`}
						</span>
					</div>

					{publicRooms.length > 0 ? (
						<div className="grid gap-3">
							{publicRooms.map((room) => (
								<button
									key={room.code}
									type="button"
									onClick={() => handleJoinPublicRoom(room)}
									className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4 text-left transition hover:border-blue-500 hover:bg-blue-500/5"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="font-semibold">Sala {room.code}</p>
											<p className="text-sm text-(--text-secondary)">
												{categoryLabels[room.category]} - {modeLabels[room.mode]}
											</p>
										</div>

										<span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600">
											{room.status}
										</span>
									</div>

									<div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
										<span>{room.playersCount} jogador(es)</span>
										<span>{room.questionsAmount} questoes</span>
										<span>{room.questionTime}s por questao</span>
									</div>
								</button>
							))}
						</div>
					) : (
						<p className="rounded-xl border border-dashed border-(--border-color) p-4 text-sm text-(--text-secondary)">
							Nenhuma sala publica disponivel no momento.
						</p>
					)}
				</section>

				<label className="mb-6 block">
					<span className="mb-2 block text-sm text-(--text-secondary)">
						Codigo da sala privada
					</span>
					<input
						value={roomCode}
						onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
						placeholder="Ex: ABC123"
						maxLength={6}
						className="w-full rounded-lg border border-(--border-color) bg-(--background) p-3 uppercase outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</label>

				{error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

				<FormUser mode="join" onSubmit={handleJoin} />
			</section>
		</main>
	);
}
