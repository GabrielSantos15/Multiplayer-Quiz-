"use client";

import { useGame } from "@/providers/GameProvider";
import Quiz from "@/components/game/Quiz";
import Timer from "@/components/game/Timer";
import Ranking from "@/components/game/Ranking";
import QuestionResultPage from "@/components/game/QuestionResultPage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GameEndedPage from "@/components/game/GameEndedPage";
import socket from "@/lib/socket";
import { getOrCreatePlayerId } from "@/lib/player";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePage() {
    const {
        room,
        result,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeLeft,
        ranking,
        gameEnded,
    } = useGame();
    const router = useRouter();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!room) { router.replace("/join"); }
        if (room?.status === "waiting") router.replace(`/room/${room.code}`);
    }, [room, router]);

    if (!room) {
        return null;
    }

    if (gameEnded) {
        return (
            <GameEndedPage
                ranking={ranking}
                onPlayAgain={() => socket.emit("room:restart", {
                    roomCode: room.code,
                    playerId: getOrCreatePlayerId(),
                })}
                onBack={() => router.push(`/`)}
            />
        );
    }

    return (
        <div className="w-full max-w-[1500px] p-4 md:p-8 m-auto relative">

            {/* Menu Retrátil Mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="relative w-4/5 max-w-sm bg-[var(--bg-primary)] h-full p-6 shadow-2xl overflow-y-auto border-r border-[var(--border-color)]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">Sala {room.code}</h2>
                                    {currentQuestion && (
                                        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                                            Pergunta {(questionIndex ?? 0) + 1} de {totalQuestions}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <Ranking ranking={ranking} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Progresso */}
            <div className="bg-[var(--bg-secondary)] h-2 mb-4 w-full m-auto rounded-full overflow-hidden">
                {questionIndex != null && totalQuestions != null && (
                    <div
                        className="bg-[var(--color-primary)] h-full transition-all duration-500 ease-in-out"
                        style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                    ></div>
                )}
            </div>

            <div className="grid w-full justify-start items-start grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr]">

                {/* Barra Lateral */}
                <aside className="hidden flex-col gap-6 self-start pt-4 lg:flex lg:order-first">
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
                        <h1 className="text-2xl font-bold drop-shadow-sm">
                            Sala {room.code}
                        </h1>
                        {currentQuestion && (
                            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                                Pergunta {(questionIndex ?? 0) + 1} de {totalQuestions}
                            </p>
                        )}
                    </div>
                    <Ranking ranking={ranking} />
                </aside>

                {/* Quiz / Resultado */}
                <main className="order-2 flex w-full max-w-3xl flex-col self-start justify-self-center">
                    {result ? (
                        <div>
                            <QuestionResultPage result={result} />
                            <div className="mt-6 block w-full lg:hidden">
                                <Ranking ranking={ranking} />
                            </div>
                        </div>
                    ) : (
                        <Quiz />
                    )}
                </main>

                {/*  Topo Mobile / Barra Lateral Direita Desktop */}
                <div className="order-first flex justify-between items-center w-full self-start lg:order-last lg:flex-col lg:items-end lg:pt-4">

                    {/* Botão menu ( Mobile) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] px-4 py-3 font-bold shadow-sm lg:hidden hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        Sala {room.code}
                    </button>

                    {currentQuestion && (
                        <Timer
                            timeLeft={timeLeft}
                            timeLimit={room?.questionTime}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}