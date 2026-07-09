export enum RoomStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  FINISHED = "finished",
}

export enum QuizCategory {
  GEOGRAPHY = "geography",
  // MATH = "math" // v2
}

export enum QuizDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export type CreateRoomPayload = {
  hostId: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  isPublic: boolean;
  questionsAmount: number;
  questionTime: number;
};

export interface Room {
  code: string;
  hostId: string;

  category: QuizCategory;
  difficulty: QuizDifficulty;

  isPublic: boolean;

  questionsAmount: number;
  questionTime: number;

  status: RoomStatus;

  players: string[];
}