"use client";

import { useGame } from "@/providers/GameProvider";

import Quiz from "@/components/game/Quiz";
import Timer from "@/components/game/Timer";
import Ranking from "@/components/game/Ranking";
import QuestionResultPage from "@/components/game/QuestionResultPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GamePage() {
    const {
        room,
        result,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeLeft,
        ranking,
    } = useGame();
    const router = useRouter()

    useEffect(() => {
        if (!room) {
            router.replace("/join");
        }
    }, [room, router]);

    if (!room) {
        return null;
    }
return (
        <div className="grid min-h-screen w-full grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_2fr_1fr]">
            
            <div className="bg-[var(--bg-primary)] h-2 w-full fixed top-0 left-0 z-50">
                {questionIndex != null && totalQuestions != null && (
                    <div
                        className="bg-[var(--color-primary)] h-full transition-all duration-500 ease-in-out"
                        style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                    ></div>
                )}
            </div>

            <aside className="order-last hidden flex-col gap-6 self-start pt-4 md:order-first md:flex">
                <div>
                    <h1 className="text-2xl font-bold drop-shadow-sm">
                        Sala {room.code}
                    </h1>
                    {currentQuestion && (
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                            Pergunta {(questionIndex ?? 0) + 1} de {totalQuestions}
                        </p>
                    )}
                </div>
                <Ranking ranking={ranking} />
            </aside>

            <main className="order-2 flex w-full max-w-3xl flex-col self-start justify-self-center">
                {result ? (
                    <QuestionResultPage result={result} />
                ) : (
                    <Quiz />
                )}
            </main>

            <div className="order-first flex flex-col items-end gap-4 self-start pt-4 md:order-last">
                {currentQuestion && (
                    <Timer
                        timeLeft={timeLeft}
                        timeLimit={room.questionTime}
                    />
                )}
            </div>
        </div>
    );
}