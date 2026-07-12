"use client";

import { useEffect, useState } from "react";

import { useGame } from "@/providers/GameProvider";

import WorldMapQuestion from "./WorldMapQuestion";

export default function Quiz() {
    const {
        currentQuestion,
        questionIndex,
        answered,
        answer,
    } = useGame();

    const [selectedOption, setSelectedOption] = useState("");

    useEffect(() => {
        setSelectedOption("");
    }, [currentQuestion]);

    if (!currentQuestion) {
        return (
            <div className="flex justify-center py-10">
                <p className="text-[var(--text-secondary)]">
                    Carregando pergunta...
                </p>
            </div>
        );
    }
  console.log("Quiz renderizou");
    return (
        <article className="mx-auto w-full m-auto max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-lg">
            <h3 className="mb-6 flex gap-3 text-xl font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                    {(questionIndex ?? 0) + 1}
                </span>

                <span>{currentQuestion.question}</span>
            </h3>

            {currentQuestion.image && (
                <img
                    src={currentQuestion.image}
                    alt={currentQuestion.question}
                    className="mb-6 w-full rounded-xl border border-[var(--border-color)]"
                />
            )}

            {currentQuestion.highlightedCountry && (
                <div className="mb-6">
                    <WorldMapQuestion
                        highlightedCountry={
                            currentQuestion.highlightedCountry
                        }
                    />
                </div>
            )}

            <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                    const selected = selectedOption === option;

                    return (
                        <label
                            key={option}
                            className={`
                                cursor-pointer rounded-xl border p-4 text-center
                                transition-all duration-200
                                active:scale-[0.98]
                                ${
                                    selected
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-md"
                                        : "border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-secondary)]"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                className="hidden"
                                checked={selected}
                                disabled={answered}
                                onChange={() => setSelectedOption(option)}
                            />

                            {option}
                        </label>
                    );
                })}
            </div>

            <button
                type="button"
                disabled={!selectedOption || answered}
                onClick={() => answer(selectedOption)}
                className={`
                    mt-6 w-full rounded-xl py-3 font-semibold text-white
                    transition-all duration-200 bg-[var(--color-primary)] 
                    ${
                        !selectedOption || answered
                            ? "opacity-40"
                            : "hover:scale-[1.01] hover:bg-[var(--hover-primary)]"
                    }
                `}
            >
                {answered
                    ? "✓ Resposta enviada"
                    : "Confirmar resposta"}
            </button>
        </article>
    );
}