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

export interface Country {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  borders: string[];
  alpha3Code: string;
  alpha2Code: string;
  flags: {
    png: string;
    svg: string;
  };
  translations: {
    pt: string;
  };
}
