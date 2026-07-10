export interface Question {
  id: string;
  type: "flag" | "capital" | "continent" | "population" | "area" | "border" | "silhouette" | "map";
  question: string;
  image?: string;
  highlightedCountry?: string
  options: string[];
  answer: string;
}

export type PublicQuestion = Omit<Question, "answer">;