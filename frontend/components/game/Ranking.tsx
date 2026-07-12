"use client";

import { motion } from "framer-motion";
import { Player } from "@/interfaces/Player";
import { getOrCreatePlayerId } from "@/lib/player";

interface RankingProps {
    ranking: Player[];
    className?: string;
}

export default function Ranking({ ranking, className }: RankingProps) {
    const playerId = getOrCreatePlayerId();

    return (
        <div className={`bg-[var(--bg-surface)] w-full p-4 rounded-2xl ${className}`}>
            <h3 className="text-xl font-semibold mb-4">
                Ranking
            </h3>
            
            <div className="flex flex-col gap-2">
                {ranking.map((player, index) => {
                    const isMe = playerId === player.playerId;

                    return (
                        <motion.div
                            key={player.playerId}
                            // A prop 'layout' é o que faz a mágica da ultrapassagem acontecer!
                            layout
                            // Configuração da mola (spring) para dar um efeito de física realista
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            // Animação inicial para quando o jogador entra no ranking pela primeira vez
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            
                            className={`flex items-center justify-between rounded-lg border border-[var(--border-color)] p-4 shadow-sm transition-colors ${
                                isMe ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]" : "bg-[var(--bg-primary)]"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-bold ${index === 0 ? "text-yellow-500" : ""}`}>
                                    #{index + 1}
                                </span>
                                <img
                                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${player.avatarSeed}`}
                                    alt={`Avatar de ${player.nickname}`}
                                    className="size-10 rounded-full bg-white/50"
                                />
                                <span className={isMe ? "font-bold" : ""}>
                                    {player.nickname} {isMe && "(Você)"}
                                </span>
                            </div>
                            
                            <strong className="text-lg">
                                {player.score} pts
                            </strong>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}