import { useSounds } from "@/hooks/useSounds";
import { useEffect } from "react";

type TimerProps = {
    timeLeft: number;
    timeLimit: number;
};

export default function Timer({
    timeLeft,
    timeLimit,
}: TimerProps) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;

    const progress = Math.max(0, timeLeft / timeLimit);
    const strokeDashoffset = circumference * (1 - progress);

    const { countdown,stopCountdown } = useSounds();

    useEffect(() => {
        if (timeLeft === 5) {
            countdown();
        }
    }, [timeLeft, countdown]);

    useEffect(() => {
        return () => {
            stopCountdown();
        };
    }, [stopCountdown]);

    const color =
        progress > 0.5
            ? "#22c55e"
            : progress > 0.25
                ? "#f59e0b"
                : "#ef4444";

    return (
        <div className="sticky h-18 w-18 bg-[var(--bg-primary)] p-1 rounded-full">
            <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 52 52"
            >
                {/* Fundo */}
                <circle
                    cx="26"
                    cy="26"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        transition: "stroke-dashoffset 250ms linear, stroke 250ms linear",
                    }}
                />

                {/* Progresso */}
                <circle
                    cx="26"
                    cy="26"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {timeLeft}
            </div>
        </div>
    );
}