"use client";

import { Crown } from "lucide-react";
import { motion } from "framer-motion";
import type { Player } from "@/interfaces/Player";
import UserImage from "../ui/UserImage";

interface PodiumProps {
  ranking: Player[];
  className: string
}

export default function Podium({ ranking, className }: PodiumProps) {
  const podiumPlayers = [];

  // Mapeamos as posições corretamente
  if (ranking[1]) podiumPlayers.push({ player: ranking[1], position: 2 });
  if (ranking[0]) podiumPlayers.push({ player: ranking[0], position: 1 });
  if (ranking[2]) podiumPlayers.push({ player: ranking[2], position: 3 });

  const getPodiumStyles = (position: number) => {
    switch (position) {
      case 1:
        return {
          height: "h-40 md:h-52",
          avatarSize: "h-20 w-20 md:h-24 md:w-24",
          delay: 0.1,
          bgGradient: "bg-gradient-to-b from-yellow-300  to-yellow-500", // Ouro
          textColor: "text-yellow-100",
          borderColor: "border-yellow-400",
        };
      case 2:
        return {
          height: "h-32 md:h-40",
          avatarSize: "h-16 w-16 md:h-20 md:w-20",
          delay: 0.3,
          bgGradient: "bg-gradient-to-b from-indigo-300 to-indigo-500", // Prata/Roxo
          textColor: "text-indigo-100",
          borderColor: "border-indigo-400",
        };
      case 3:
        return {
          height: "h-24 md:h-32",
          avatarSize: "h-16 w-16 md:h-20 md:w-20",
          delay: 0.5,
          bgGradient: "bg-gradient-to-b from-orange-300 to-orange-500", // Bronze
          textColor: "text-orange-100",
          borderColor: "border-orange-400",
        };
      default:
        return { height: "h-24", avatarSize: "h-16 w-16", delay: 0, bgGradient: "bg-gray-300", textColor: "text-gray-100", borderColor: "border-gray-400" };
    }
  };

  return (
    <div className={`mt-16 flex items-end justify-center gap-2 md:gap-4 ${className}`}>
      {podiumPlayers.map(({ player, position }) => {
        const styles = getPodiumStyles(position);
        const isFirst = position === 1;

        return (
          <motion.div
            key={player.playerId}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: styles.delay, duration: 0.5, type: "spring" }}
            className="flex flex-col items-center justify-end"
          >
            <div className="z-10 flex flex-col items-center space-y-2 pb-4">
              <div className="relative">
                {isFirst && (
                  <Crown
                    className="absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-md"
                    size={32}
                    fill="currentColor"
                  />
                )}
                <UserImage seed={player.avatarSeed} nickname={player.nickname}  className={`${styles.avatarSize} rounded-full border-4 ${styles.borderColor} bg-white object-cover shadow-md`}></UserImage>
              </div>

              <div className="flex flex-col items-center text-center">
                <span className={`w-24 md:w-32 truncate font-bold text-[var(--text-primary)] ${isFirst ? "text-lg" : "text-sm md:text-base"}`}>
                  {player.nickname}
                </span>

                <span className="mt-1 rounded-full bg-[var(--color-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-sm">
                  {player.score} pts
                </span>
              </div>
            </div>

            <div
              className={`relative overflow-hidden flex w-24 flex-col items-center justify-between rounded-t-xl shadow-2xl md:w-32 ${styles.height} ${styles.bgGradient} border-t border-white/40 p-4`}
            >

              <div className="metallic-overlay absolute inset-0 z-0" />

              <span className={`relative z-10 text-5xl font-extrabold md:text-7xl ${styles.textColor} drop-shadow-sm`}>
                {position}
              </span>

              <span className={`relative z-10 text-lg font-bold md:text-xl ${styles.textColor} opacity-80 drop-shadow-sm pb-2`}>
                {position}º
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}