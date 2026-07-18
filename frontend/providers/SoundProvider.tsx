"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface SoundContextData {
    isMuted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextData | undefined>(undefined);

const STORAGE_KEY = "quiz:audio-muted";

export function SoundProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            setIsMuted(saved === "true");
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;

            localStorage.setItem(STORAGE_KEY, String(next));

            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            isMuted,
            toggleMute,
        }),
        [isMuted, toggleMute]
    );

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);

    if (!context) {
        throw new Error(
            "useSound deve ser usado dentro de um SoundProvider."
        );
    }

    return context;
}