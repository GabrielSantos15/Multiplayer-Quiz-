export interface Question {
  id: string;
  type: "flag" | "capital" | "continent" | "population" | "area" | "border";
  question: string;
  image?: string;
  options: string[];
  answer: string;
}

export type PublicQuestion = Omit<Question, "answer">;