"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import socket from "@/lib/socket";
import {
    getRoomSession,
    saveRoomSession,
} from "@/lib/storage/room-session";
import type { Room } from "@/interfaces/Room";

export function useRoom() {
    const router = useRouter();
    const params = useParams() as { code?: string };
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState("");
    const { session, playerId, ready } = usePlayer();

    const roomCode = useMemo(() => {
        const code = params?.code;

        if (typeof code === "string" && code.trim()) {
            return code.toUpperCase();
        }

        return "";
    }, [params]);

    useEffect(() => {
        if (!ready) return;

        if (!session) {
            router.replace("/join");
            return;
        }

        const persisted = getRoomSession();

        if (!roomCode && persisted?.code) {
            router.replace(`/room/${persisted.code}`);
            return;
        }

        if (!roomCode) {
            router.replace("/join");
            return;
        }

        saveRoomSession({
            code: roomCode,
        });

        function handleRoomUpdate(nextRoom: Room) {
            setRoom(nextRoom);

            if (nextRoom.status === "playing") {
                router.push(`/room/${nextRoom.code}/game`);
            }
        }

        function handleError(payload: { message?: string }) {
            setError(payload.message ?? "Erro ao carregar sala.");
        }

        socket.on("room:update", handleRoomUpdate);
        socket.on("room:error", handleError);

        socket.emit("room:join", {
            roomCode,
            playerId: session.playerId,
        });

        return () => {
            socket.off("room:update", handleRoomUpdate);
            socket.off("room:error", handleError);
        };
    }, [roomCode, router, ready, session]);

    useEffect(() => {
        function handleGameStarted() {
            router.push(`/room/${roomCode}/game`);
        }

        socket.on("game:started", handleGameStarted);

        return () => {
            socket.off("game:started", handleGameStarted);
        };
    }, [roomCode, router]);

    return { room, playerId, error, roomCode };
}