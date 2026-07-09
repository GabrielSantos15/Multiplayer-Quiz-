"use client";

import { Player } from "@/interfaces/Player";
import { usePlayer } from "@/hooks/usePlayer";


interface PlayersListProps {
  players: Player[];
}
export default function PlayersList({ players }:PlayersListProps) {
  const { session } = usePlayer();

  return (
    <section className="max-w-3xl bg-(--bg-surface) p-5 rounded-2xl">
      <h2 className="font-semibold text-2xl mb-4">Players online</h2>
      <ul>
        {players.map((p) => {
          const isCurrentUser = session?.playerId === p.playerId;
          return (
            <li
              key={p.playerId}
                className={`flex items-center gap-2 p-2 border-b border-(--border-color) ${
                isCurrentUser ? "bg-blue-100 font-bold rounded-lg" : ""
              }`}
            >
              <img
                width={50}
                height={50}
                src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${p.avatarSeed}`}
                alt="avatar"
                className="rounded-full"
                />
              <p>{p.nickname}</p>
              {isCurrentUser && (
                <span className="ml-auto text-sm text-blue-600">Você</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
