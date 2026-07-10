import countriesData from "./data/countries.json" with { type: "json" };
import availableMapCodesData from "./data/available-map-codes.json" with { type: "json" };
import type { Question } from "./question-types.js";
import type { Country } from "./types.js";

// ============================================================================
// CONSTANTS
// ============================================================================

const countries = countriesData as Country[];
const CONTINENT_NAMES = {
  Africa: "África",
  Americas: "América",
  Asia: "Ásia",
  Europe: "Europa",
  Oceania: "Oceania",
} as const;

const CONTINENTS = Object.keys(CONTINENT_NAMES) as Array<
  keyof typeof CONTINENT_NAMES
>;
const MIN_AREA_FOR_MAP_QUESTION = 5000;
const availableShapeIds = new Set(availableMapCodesData as string[]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retorna o nome do país em português.
 */
function getCountryName(country: Country) {
  return country.translations.pt || country.name;
}

/**
 * Embaralha um array utilizando o algoritmo Fisher-Yates.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }

  return result;
}

//Retorna um item aleatório de um array.

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Escolhe um país aleatório.
function chooseRandomCountry(): Country {
  return randomItem(countries);
}

//Escolhe um país aleatório com mapa disponível.
function chooseRandomCountryWithShape(): Country {
  return randomItem(countriesWithMap);
}
/**
 * Escolhe países errados (distratores).
 *
 * Por padrão tenta pegar países da mesma região.
 * Caso não existam países suficientes, utiliza qualquer país do mundo.
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

// ============================================================================
// COUNTRY LOOKUPS
// ============================================================================

const countriesByAlpha3 = new Map(
  countries.map((country) => [country.alpha3Code, country]),
);

const countriesByAlpha2 = new Map(countries.map((c) => [c.alpha2Code, c]));

function getCountryByAlpha3(code: string) {
  return countriesByAlpha3.get(code);
}

function getCountryByAlpha2(code: string) {
  return countriesByAlpha2.get(code);
}

// ============================================================================
// FILTERED COUNTRIES
// ============================================================================

const countriesWithCapital = countries.filter(
  (country) =>
    typeof country.capital === "string" && country.capital.trim().length > 0,
);

const countriesWithBorders = countries.filter(
  (country) => (country.borders?.length ?? 0) >= 3,
);

const countriesWithMap = countries.filter(
  (country) =>
    availableShapeIds.has(country.alpha2Code) &&
    country.area >= MIN_AREA_FOR_MAP_QUESTION,
);

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

/**
 * Gera uma questão sobre bandeiras.
 * Pergunta: "Qual país possui esta bandeira?"
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
 * Gera uma questão sobre capitais.
 * Pergunta: "Qual é a capital de [País]?"
 */
export function generateCapitalQuestion(): Question {
  const correct = randomItem(countriesWithCapital);

  const distractors = shuffle(
    countriesWithCapital.filter(
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
 * Gera uma questão sobre continentes.
 * Pergunta: "Em qual continente fica [País]?"
 */
export function generateContinentQuestion(): Question {
  const correct = chooseRandomCountry();

  const options = shuffle([
    CONTINENT_NAMES[correct.region as keyof typeof CONTINENT_NAMES],
    ...shuffle(CONTINENTS.filter((continent) => continent !== correct.region))
      .slice(0, 3)
      .map((continent) => CONTINENT_NAMES[continent]),
  ]);

  return {
    id: crypto.randomUUID(),
    type: "continent",
    question: `Em qual continente fica ${getCountryName(correct)}?`,
    options,
    answer: CONTINENT_NAMES[correct.region as keyof typeof CONTINENT_NAMES],
  };
}

/**
 * Gera uma questão sobre população.
 * Pergunta: "Qual destes países possui a maior população?"
 */
export function generatePopulationQuestion(): Question {
  const correct = chooseRandomCountry();
  const distractors = chooseDistractors(correct, 3);

  const candidates = [correct, ...distractors];
  const mostPopulous = candidates.reduce((max, country) =>
    country.population > max.population ? country : max,
  );

  const options = shuffle(candidates.map(getCountryName));

  return {
    id: crypto.randomUUID(),
    type: "population",
    question: "Qual destes países possui a maior população?",
    options,
    answer: getCountryName(mostPopulous),
  };
}

/**
 * Gera uma questão sobre área territorial.
 * Pergunta: "Qual destes países possui a maior área territorial?"
 */
export function generateAreaQuestion(): Question {
  const correct = chooseRandomCountry();
  const distractors = chooseDistractors(correct, 3);

  const candidates = [correct, ...distractors];
  const largest = candidates.reduce((max, country) =>
    country.area > max.area ? country : max,
  );

  const options = shuffle(candidates.map(getCountryName));

  return {
    id: crypto.randomUUID(),
    type: "area",
    question: "Qual destes países possui a maior área territorial?",
    options,
    answer: getCountryName(largest),
  };
}

/**
 * Gera uma questão sobre fronteiras.
 * Pergunta: "Com qual destes países [País] NÃO faz fronteira?"
 */
export function generateBorderQuestion(): Question {
  const subject = randomItem(countriesWithBorders);
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

  const wrongAnswer = randomItem(nonNeighbors);

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

/**
 * Gera uma questão identificando um país destacado no mapa.
 * Pergunta: "Qual país está destacado no mapa?"
 */
export function generateMapQuestion(): Question {
  const correct = chooseRandomCountryWithShape();
  const distractors = chooseDistractors(correct, 3);

  const options = shuffle([
    getCountryName(correct),
    ...distractors.map(getCountryName),
  ]);

  return {
    id: crypto.randomUUID(),
    type: "map",
    question: "Qual país está destacado no mapa?",
    highlightedCountry: correct.alpha2Code,
    options,
    answer: getCountryName(correct),
  };
}
