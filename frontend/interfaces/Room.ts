import { Player } from "./Player";

export type QuizCategory = "geography";
export type QuizDifficulty = "easy" | "medium" | "hard";

export enum RoomStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface Room {
  code: string;
  hostId: string;

  category: QuizCategory;
  difficulty: QuizDifficulty;

  isPublic: boolean;

  questionsAmount: number;
  questionTime: number;

  status: RoomStatus;

  players: Player[];
}
