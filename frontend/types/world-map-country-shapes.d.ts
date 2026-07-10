declare module "world-map-country-shapes" {
  interface CountryShape {
    id: string;
    shape: string;
  }

  const countryShapes: CountryShape[];
  export default countryShapes;
}