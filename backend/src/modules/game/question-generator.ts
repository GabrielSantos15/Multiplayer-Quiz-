import type { PublicQuestion, Question } from "./question-types.js";
import {
  generateAreaQuestion,
  generateBorderQuestion,
  generateCapitalQuestion,
  generateContinentQuestion,
  generateFlagQuestion,
  generateMapQuestion,
  generatePopulationQuestion,
} from "./questions.js";

type Difficulty = "easy" | "medium" | "hard";

export function generateQuestion(difficulty: Difficulty): Question {
  let generators = [];

  switch (difficulty) {
    case "easy":
      generators = [
        generateFlagQuestion,
        generateContinentQuestion,
        generateMapQuestion,
      ];
      break;

    case "medium":
      generators = [
        generateFlagQuestion,
        generateCapitalQuestion,
        generateContinentQuestion,
        generateMapQuestion,
        generateBorderQuestion,
      ];
      break;

    case "hard":
      generators = [
        generateFlagQuestion,
        generateCapitalQuestion,
        generateMapQuestion,
        generateBorderQuestion,
        generatePopulationQuestion,
        generateAreaQuestion,
      ];
      break;
  }

  const generator = generators[Math.floor(Math.random() * generators.length)];

  return generator();
}

export function generateQuiz(
  amount: number,
  difficulty: Difficulty,
): Question[] {
  const questions: Question[] = [];
  let attempts = 0;
  const maxAttempts = amount * 20;

  while (questions.length < amount && attempts < maxAttempts) {
    attempts++;
    try {
      questions.push(generateQuestion(difficulty));
    } catch {
      // tenta novamente
    }
  }

  if (questions.length < amount)
    throw new Error("Não foi possível gerar perguntas suficientes.");

  return questions;
}

export function sanitizeQuestion(question: Question): PublicQuestion {
  const { answer, ...publicQuestion } = question;
  return publicQuestion;
}
