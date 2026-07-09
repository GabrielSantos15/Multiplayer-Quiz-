"use client";

import { useEffect, useState } from "react";

import QuestionResultPage from "@/components/game/QuestionResultPage";
import { useGame } from "@/providers/GameProvider";

export default function GamePage() {
    const {
        room,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeLeft,
        answered,
        result,
        answer,
    } = useGame();

    const [selectedOption, setSelectedOption] = useState("");

    useEffect(() => {
        setSelectedOption("");
    }, [currentQuestion]);

    if (!room) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Carregando sala...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-2xl p-6">
            {result ? (
                <QuestionResultPage result={result} />
            ) : (
                <section className="space-y-4">
                    <header>
                        <h2 className="text-xl font-bold">Sala {room.code}</h2>
                        <p>Jogadores: {room.players.length}</p>
                        <p>Status: {room.status}</p>
                    </header>

                    {!currentQuestion ? (
                        <p className="text-center text-gray-500">
                            Aguardando próxima pergunta...
                        </p>
                    ) : (
                        <article className="space-y-4 rounded-lg bg-[var(--bg-surface)] p-6 shadow">
                            <div className="flex items-center justify-between">
                                <strong>
                                    Pergunta {questionIndex! + 1} / {totalQuestions}
                                </strong>

                                <span className="font-semibold text-red-500">
                                    ⏳ {timeLeft}s
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold">
                                {currentQuestion.question}
                            </h3>

                            {currentQuestion.image && (
                                <img
                                    src={currentQuestion.image}
                                    alt={currentQuestion.question}
                                    className="w-full rounded-lg"
                                />
                            )}

                            <div className="grid gap-3">
                                {currentQuestion.options.map((option) => (
                                    <label
                                        key={option}
                                        className={`cursor-pointer rounded-lg border p-3 text-center transition
                      ${selectedOption === option
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 bg-gray-700 hover:bg-gray-600"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            className="hidden"
                                            checked={selectedOption === option}
                                            disabled={answered}
                                            onChange={() => setSelectedOption(option)}
                                        />

                                        {option}
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                disabled={!selectedOption || answered}
                                onClick={() => answer(selectedOption)}
                                className={`w-full rounded-lg py-2 font-semibold transition ${!selectedOption || answered
                                        ? "cursor-not-allowed bg-gray-400"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                    }`}
                            >
                                {answered ? "Resposta enviada" : "Confirmar resposta"}
                            </button>
                        </article>
                    )}
                </section>
            )}
        </main>
    );
}