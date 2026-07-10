import { Player } from "./Player";

export type PublicQuestion = {
    id: string;
    type: string;
    question: string;
    image?: string;
    highlightedCountry?: string
    options: string[];
};


export type QuestionResult = {
    correctAnswer: string;
    ranking: Player[];
};

