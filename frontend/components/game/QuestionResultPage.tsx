"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import type { QuestionResult } from "@/interfaces/Game";
import { useGame } from "@/providers/GameProvider";

interface QuestionResultProps {
  result: QuestionResult;
}

export default function QuestionResultPage({
  result,
}: QuestionResultProps) {
  const { selectedAnswer, ranking } = useGame();
  const { width, height } = useWindowSize(); 

  const isCorrect = selectedAnswer === result.correctAnswer;

  return (
    <section>
      {isCorrect && (
        <Confetti
          width={width}
          height={height}
          recycle={false} 
          numberOfPieces={1000}
          gravity={0.2}
          className="!fixed !top-0 !left-0 z-50"
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        //  Se errar, faz a animação de "shake"
        animate={
          isCorrect
            ? { opacity: 1, scale: 1, y: 0, x: 0 }
            : { opacity: 1, scale: 1, y: 0, x: [-12, 12, -12, 12, -8, 8, 0] }
        }
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-(--border-color) bg-(--bg-surface) p-8"
      >
        <div className="flex flex-col items-center gap-4">
          {isCorrect ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                }}
              >
                <CheckCircle2
                  size={90}
                  className="text-green-500 drop-shadow-lg"
                />
              </motion.div>

              <h2 className="text-4xl font-bold text-green-500">
                Acertou!
              </h2>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                }}
              >
                <XCircle
                  size={90}
                  className="text-red-500 drop-shadow-lg"
                />
              </motion.div>

              <h2 className="text-4xl font-bold text-red-500">
                Errou!
              </h2>
            </>
          )}

          <div className="mt-2 space-y-2 text-center">
            <p className="text-(--text-secondary)">
              Sua resposta
            </p>

            <div
              className={`rounded-xl px-5 py-3 text-xl font-semibold ${
                isCorrect
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {selectedAnswer ?? "Não respondeu"}
            </div>
          </div>

          {!isCorrect && (
            <div className="mt-2 space-y-2 text-center">
              <p className="text-(--text-secondary)">
                Resposta correta
              </p>

              <div className="rounded-xl bg-green-600 px-5 py-3 text-xl font-bold text-white">
                {result.correctAnswer}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
        }}
        className="rounded-2xl border border-(--border-color) bg-(--bg-surface) p-6 mt-2"
      >
        <h3 className="mb-5 text-2xl font-bold">
          Ranking
        </h3>

        <div className="space-y-3">
          {ranking.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.05,
              }}
              className={`flex items-center justify-between rounded-xl p-4 ${
                index === 0
                  ? "bg-yellow-500/15 border border-yellow-500/40"
                  : "bg-(--bg-primary)"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-center text-lg font-bold">
                  {index + 1}º
                </span>

                <span>{player.nickname}</span>
              </div>

              <span className="font-bold">
                {player.score} pts
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}