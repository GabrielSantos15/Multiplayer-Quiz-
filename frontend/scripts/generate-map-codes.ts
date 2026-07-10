// Script para gerar os paises possiveis no mapa para o backend
import countryShapes from "world-map-country-shapes";
import { writeFileSync } from "fs";

const availableCodes = countryShapes.map((shape) => shape.id);

writeFileSync(
  "./scripts/available-map-codes.json",
  JSON.stringify(availableCodes, null, 2)
);

console.log(`Gerado com ${availableCodes.length} códigos.`);