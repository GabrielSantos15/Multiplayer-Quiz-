"use client";

import { useEffect, useState } from "react";

import { getOrCreatePlayerId } from "@/lib/player";
import {
	getSession,
	type PlayerSession,
} from "@/lib/storage/player-session";

export function usePlayer() {
	const [session, setSession] = useState<PlayerSession | null>(null);
	const [playerId, setPlayerId] = useState("");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setSession(getSession());
		setPlayerId(getOrCreatePlayerId());
		setReady(true);
	}, []);

	return {
		session,
		playerId,
		ready,
	};
}
