import type { Question } from "./question-types.js";

export interface PlayerAnswer {
  answer: string | number;
  answeredAt: number;
}

export interface Game {
  roomCode: string;
  currentQuestion: number;
  questions: Question[];
  currentTimeout: NodeJS.Timeout | null;
  currentAnswers: Map<string, PlayerAnswer>;
  questionStartedAt: number ;
    resultTimeout: NodeJS.Timeout | null;
}
