export interface CalorimetryInputs {
  massGrams: number;
  specificHeatJPerGramCelsius: number;
  temperatureChangeCelsius: number;
}

export interface CalorimetryResult {
  energyJoules: number;
  energyKilojoules: number;
  released: boolean;
}

export function calculateCalorimetry(inputs: CalorimetryInputs): CalorimetryResult | null {
  const { massGrams, specificHeatJPerGramCelsius, temperatureChangeCelsius } = inputs;
  if (
    !Number.isFinite(massGrams) ||
    massGrams <= 0 ||
    !Number.isFinite(specificHeatJPerGramCelsius) ||
    specificHeatJPerGramCelsius <= 0 ||
    !Number.isFinite(temperatureChangeCelsius)
  ) {
    return null;
  }
  const energyJoules = massGrams * specificHeatJPerGramCelsius * temperatureChangeCelsius;
  return {
    energyJoules,
    energyKilojoules: energyJoules / 1000,
    released: energyJoules < 0,
  };
}
