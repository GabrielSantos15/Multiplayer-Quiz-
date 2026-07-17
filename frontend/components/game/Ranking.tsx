"use client";

import { motion } from "framer-motion";
import { Player } from "@/interfaces/Player";
import { getOrCreatePlayerId } from "@/lib/player";
import UserImage from "../ui/userImage/UserImage";

interface RankingProps {
    ranking: Player[];
    className?: string;
}

export default function Ranking({ ranking, className }: RankingProps) {
    const playerId = getOrCreatePlayerId();

    return (
        <div className={`bg-[var(--bg-surface)] w-full p-4 rounded-2xl shadow ${className}`}>
            <h3 className="text-xl font-semibold mb-4">
                Ranking
            </h3>

            <div className="flex flex-col gap-2">
                {ranking.map((player, index) => {
                    const isMe = playerId === player.playerId;

                    return (
                        <motion.div
                            key={player.playerId}
                            layout
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}

                            className={`flex items-center justify-between rounded-lg p-4 shadow transition-colors border ${isMe ? "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]" : "bg-[var(--bg-surface)] border-[var(--border-color)]"
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-3xs ">
                                <span className={`font-bold rounded-full border-[var(--border-color)] p-2 ${index === 0 ? "bg-yellow-500/20" : ""}`}>
                                    #{index + 1}
                                </span>
                                <UserImage seed={player.avatarSeed} nickname={player.nickname} className="size-15 rounded-full"></UserImage>
                                <div className=" flex flex-col">
                                    <span className={isMe ? "font-bold" : "font-semibold"}>
                                        {player.nickname} {isMe && "(Você)"}
                                    </span>
                                    <span className="text-sm">
                                        {player.score} pts
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}