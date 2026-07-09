import countriesData from "./data/countries.json" with { type: "json" };
import type { Question } from "./question-types.js";

export interface Country {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  borders: string[];
  alpha3Code: string;
  flags: {
    png: string;
    svg: string;
  };
  translations: {
    pt: string;
  };
}

const countries = countriesData as Country[];

/**
 * Retorna o nome do país em português.
 */
function getCountryName(country: Country) {
  return country.translations.pt || country.name;
}

/**
 * Embaralha um array utilizando o algoritmo
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }

  return result;
}

/**
 * Escolhe um país aleatório.
 */
function chooseRandomCountry(): Country {
  const index = Math.floor(Math.random() * countries.length);

  return countries[index];
}

/**
 * Escolhe países errados (distratores).
 *
 * Por padrão tenta pegar países da mesma região,
 * Caso não existam países suficientes utiliza qualquer país do mundo.
 */
function chooseDistractors(
  correct: Country,
  amount: number,
  sameRegion = true,
): Country[] {
  const filtered = countries.filter(
    (country) =>
      country.alpha3Code !== correct.alpha3Code &&
      (!sameRegion || country.region === correct.region),
  );

  const pool =
    filtered.length >= amount
      ? filtered
      : countries.filter(
          (country) => country.alpha3Code !== correct.alpha3Code,
        );

  return shuffle(pool).slice(0, amount);
}

/**
 * ===========================================
 * BANDEIRAS
 * ===========================================
 */
export function generateFlagQuestion(): Question {
  const correct = chooseRandomCountry();

  const distractors = chooseDistractors(correct, 3);

  const options = shuffle([
    getCountryName(correct),

    ...distractors.map(getCountryName),
  ]);

  return {
    id: crypto.randomUUID(),

    type: "flag",

    question: "Qual país possui esta bandeira?",

    image: correct.flags.svg,

    options,

    answer: getCountryName(correct),
  };
}

/**
 * ===========================================
 * CAPITAIS
 * ===========================================
 *
 * Qual é a capital do Brasil?
 *
 * Brasília
 * Buenos Aires
 * Lima
 * Santiago
 */
export function generateCapitalQuestion(): Question {
  const validCountries = countries.filter(
    (country) =>
      typeof country.capital === "string" && country.capital.trim().length > 0,
  );

  const correct =
    validCountries[Math.floor(Math.random() * validCountries.length)];

  const distractors = shuffle(
    validCountries.filter(
      (country) => country.alpha3Code !== correct.alpha3Code,
    ),
  ).slice(0, 3);

  const options = shuffle([
    correct.capital,

    ...distractors.map((country) => country.capital),
  ]);

  return {
    id: crypto.randomUUID(),

    type: "capital",

    question: `Qual é a capital de ${getCountryName(correct)}?`,

    options,

    answer: correct.capital,
  };
}

/**
 * ===========================================
 * CONTINENTES
 * ===========================================
 *
 * Em qual continente fica o Japão?
 *
 * Ásia
 * Europa
 * África
 * Oceania
 */
export function generateContinentQuestion(): Question {
  const correct = chooseRandomCountry();

  const continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

  const options = shuffle([
    correct.region,

    ...shuffle(
      continents.filter((continent) => continent !== correct.region),
    ).slice(0, 3),
  ]);

  return {
    id: crypto.randomUUID(),

    type: "continent",

    question: `Em qual continente fica ${getCountryName(correct)}?`,

    options,

    answer: correct.region,
  };
}

/**
 * ===========================================
 * POPULAÇÃO
 * ===========================================
 *
 * Esta será utilizada na dificuldade difícil.
 *
 * Exemplo:
 *
 * Qual destes países possui aproximadamente
 * 214 milhões de habitantes?
 */
function formatPopulation(value: number): string {
  const millions = value / 1_000_000;
  return `aproximadamente ${millions.toFixed(0)} milhões de habitantes`;
}

export function generatePopulationQuestion(): Question {
  const correct = chooseRandomCountry();
  const distractors = chooseDistractors(correct, 3);

  const options = shuffle([
    formatPopulation(correct.population),
    ...distractors.map((country) => formatPopulation(country.population)),
  ]);

  return {
    id: crypto.randomUUID(),
    type: "population",
    question: `Qual é a população aproximada de ${getCountryName(correct)}?`,
    options,
    answer: formatPopulation(correct.population),
  };
}
/**
 * ===========================================
 * ÁREA
 * ===========================================
 *
 * Qual destes países possui cerca de
 * 8.500.000 km²?
 */
function formatArea(value: number): string {
  const formatted = value.toLocaleString("pt-BR");
  return `cerca de ${formatted} km²`;
}

export function generateAreaQuestion(): Question {
  const correct = chooseRandomCountry();
  const distractors = chooseDistractors(correct, 3);

  const options = shuffle([
    formatArea(correct.area),
    ...distractors.map((country) => formatArea(country.area)),
  ]);

  return {
    id: crypto.randomUUID(),
    type: "area",
    question: `Qual é a área aproximada de ${getCountryName(correct)}?`,
    options,
    answer: formatArea(correct.area),
  };
}
/**
 * ===========================================
 * FRONTEIRAS
 * ===========================================
 *
 * Com qual país o Brasil NÃO faz fronteira?
 */
function getCountryByAlpha3(code: string): Country | undefined {
  return countries.find((country) => country.alpha3Code === code);
}

export function generateBorderQuestion(): Question {
  const eligible = countries.filter((country) => {
    if (!country.borders?.length) return false;

    const neighbors = country.borders
      .map(getCountryByAlpha3)
      .filter((c): c is Country => c !== undefined);

    return neighbors.length >= 3;
  });

  if (eligible.length === 0) {
    throw new Error("Nenhum país elegível para perguntas de fronteira.");
  }

  const subject = eligible[Math.floor(Math.random() * eligible.length)];

  const borders = subject.borders ?? [];

  const realNeighbors = borders
    .map(getCountryByAlpha3)
    .filter((c): c is Country => c !== undefined);

  const correctOptions = shuffle(realNeighbors).slice(0, 3);

  const nonNeighbors = countries.filter(
    (country) =>
      country.alpha3Code !== subject.alpha3Code &&
      !borders.includes(country.alpha3Code),
  );

  const wrongAnswer =
    nonNeighbors[Math.floor(Math.random() * nonNeighbors.length)];

  const options = shuffle([
    ...correctOptions.map(getCountryName),
    getCountryName(wrongAnswer),
  ]);

  return {
    id: crypto.randomUUID(),
    type: "border",
    question: `Com qual destes países ${getCountryName(subject)} NÃO faz fronteira?`,
    options,
    answer: getCountryName(wrongAnswer),
  };
}
