"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import socket from "@/lib/socket";
import { usePlayer } from "@/hooks/usePlayer";
import { getRoomSession } from "@/lib/storage/room-session";

import type { Room } from "@/interfaces/Room";
import type { QuestionResult } from "@/interfaces/Game";

export type PublicQuestion = {
  id: string;
  type: string;
  question: string;
  image?: string;
  options: string[];
};

type GameContextData = {
  room: Room | null;

  currentQuestion: PublicQuestion | null;
  questionIndex: number | null;
  totalQuestions: number | null;

  result: QuestionResult | null;

  answered: boolean;
  selectedAnswer: string | null;

  timeLeft: number;

  answer(option: string): void;
};

const GameContext = createContext({} as GameContextData);

export function GameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, ready } = usePlayer();

  const roomSession = useMemo(
    () => getRoomSession(),
    []
  );

  const intervalRef = useRef<number | null>(null);

  // Room
  const [room, setRoom] = useState<Room | null>(null);

  // Question
  const [currentQuestion, setCurrentQuestion] =
    useState<PublicQuestion | null>(null);

  const [questionIndex, setQuestionIndex] =
    useState<number | null>(null);

  const [totalQuestions, setTotalQuestions] =
    useState<number | null>(null);

  // Answer
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [answered, setAnswered] =
    useState(false);

  // Result
  const [result, setResult] =
    useState<QuestionResult | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] =
    useState(0);

  const resetGameState = useCallback(() => {
    setCurrentQuestion(null);
    setQuestionIndex(null);
    setTotalQuestions(null);

    setSelectedAnswer(null);
    setAnswered(false);

    setResult(null);

    setTimeLeft(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!ready || !session || !roomSession) {
      return;
    }

    socket.emit("room:join", {
      roomCode: roomSession.code,
      playerId: session.playerId,
    });

    function onRoomUpdate(room: Room) {
      setRoom(room);
    }

    function onQuestion(payload: {
      question: PublicQuestion;
      questionIndex: number;
      totalQuestions: number;
      timeLimit: number;
    }) {
      setResult(null);

      setCurrentQuestion(payload.question);
      setQuestionIndex(payload.questionIndex);
      setTotalQuestions(payload.totalQuestions);

      setAnswered(false);
      setSelectedAnswer(null);

      const deadline =
        Date.now() + payload.timeLimit * 1000;

      setTimeLeft(payload.timeLimit);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        const left = Math.max(
          0,
          Math.ceil(
            (deadline - Date.now()) / 1000
          )
        );

        setTimeLeft(left);

        if (left <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 250);
    }

    function onResult(result: QuestionResult) {
      setCurrentQuestion(null);
      setResult(result);
    }

    function onRestart() {
      resetGameState();
    }

    function onGameEnded() {
      setCurrentQuestion(null);
    }

    socket.on("room:update", onRoomUpdate);
    socket.on("room:joined", onRoomUpdate);
    socket.on("room:restart", onRestart);

    socket.on("game:question", onQuestion);
    socket.on("game:question-result", onResult);
    socket.on("game:ended", onGameEnded);

    return () => {
      socket.off("room:update", onRoomUpdate);
      socket.off("room:joined", onRoomUpdate);
      socket.off("room:restart", onRestart);

      socket.off("game:question", onQuestion);
      socket.off("game:question-result", onResult);
      socket.off("game:ended", onGameEnded);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ready, session, roomSession, resetGameState]);

  const answer = useCallback(
    (option: string) => {
      if (
        !session ||
        !roomSession ||
        answered ||
        questionIndex === null
      ) {
        return;
      }

      setAnswered(true);
      setSelectedAnswer(option);

      socket.emit("game:answer", {
        roomCode: roomSession.code,
        playerId: session.playerId,
        answer: option,
        questionIndex,
      });
    },
    [
      session,
      roomSession,
      answered,
      questionIndex,
    ]
  );

  return (
    <GameContext.Provider
      value={{
        room,

        currentQuestion,
        questionIndex,
        totalQuestions,

        result,

        answered,
        selectedAnswer,

        timeLeft,

        answer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}