"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, RotateCcw, Home, Crown, Star, CheckCircle, XCircle, Users, LogOut } from "lucide-react";

import type { Player } from "@/interfaces/Player";
import { getOrCreatePlayerId } from "@/lib/player";
import UserImage from "../ui/userImage/UserImage";
import Podium from "./Podium";
import Ranking from "./Ranking";
import { useGame } from "@/providers/GameProvider";

interface GameEndedPageProps {
  ranking: Player[];
  onPlayAgain?: () => void;
  onBack?: () => void;
}

export default function GameEndedPage({
  ranking,
  onPlayAgain,
  onBack,
}: GameEndedPageProps) {

  const { room } = useGame()
  const playerId = getOrCreatePlayerId();

  const player = ranking.find((p) => p.playerId === playerId);

  return (
    <section className="flex justify-evenly items-center flex-col md:flex-row flex-wrap-reverse relative">
      {/* layer */}
      {/* <div className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm pointer-events-none" /> */}
      {
        player && room &&
        <article className="flex flex-col gap-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow p-8 h-fit ">
          <div className="flex flex-col items-center">
            <UserImage seed={player?.avatarSeed}></UserImage>
            <h2 className="text-2xl font-semibold center">{player.nickname}</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center bg-[var(--color-primary)] text-white rounded-2xl p-2">

            <div className="flex-col items-center justify-center  gap-2 border-r-1 border-white/30">
              <div className="flex items-center justify-center gap-2">
                <Star size={28} />
                <h3 className="text-3xl font-bold text-center">
                  {player?.score}
                </h3>
              </div>
              <p className="text-sm text-center">Pontos</p>
            </div>

            <div className="flex-col items-center justify-center gap-2 border-r-1 border-white/30">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={28} />
                <h3 className="text-3xl font-bold text-center">
                  {(player?.correctAnswers) ?? 0}
                </h3>
              </div>
              <p className="text-sm">Acertos</p>
            </div>

            <div className="flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <XCircle size={28} />
                <h3 className="text-3xl font-bold text-center">
                  {room ? room.questionsAmount - (player?.correctAnswers ?? 0) : 0}
                </h3>
              </div>
              <p className="text-sm">Erros</p>
            </div>

          </div>

          <div className="flex flex-row items-center gap-4">
            {
              room.hostId == playerId ?
              <button onClick={onPlayAgain} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white hover:brightness-110 transition cursor-pointer">
                <Users size={18} />
                Voltar ao Lobby
              </button>:
              <p>Espere o host reiniciar</p>
            }
            <button onClick={onBack} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] px-6 py-3 font-semibold hover:bg-[var(--bg-primary)] transition cursor-pointer">
              <LogOut size={18} />
              Sair da Sala
            </button>
          </div>
        </article>
      }
      <div className="relative flex flex-col items-center">
        <Podium ranking={ranking} className="w-[90%]" />

        <Ranking ranking={ranking} className="z-10 w-full max-w-2xl" />
      </div>

    </section>
  );
}
