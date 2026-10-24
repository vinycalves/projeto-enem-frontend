export interface StatisticsResult {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  range: number;
  variance: number;
  standardDeviation: number;
}

export function parseNumberList(input: string): number[] {
  return input
    .split(/[;,\s]+/)
    .map((part) => part.trim().replace(',', '.'))
    .filter((part) => part.length > 0)
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

export function calculateStatistics(values: number[]): StatisticsResult | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const mean = sorted.reduce((total, value) => total + value, 0) / count;
  const middle = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  const frequencies = new Map<number, number>();
  for (const value of sorted) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }
  const maxFrequency = Math.max(...frequencies.values());
  const mode = maxFrequency <= 1 ? [] : [...frequencies.entries()].filter(([, count]) => count === maxFrequency).map(([value]) => value);
  const variance =
    sorted.reduce((total, value) => total + (value - mean) ** 2, 0) / count;
  return {
    count,
    mean,
    median,
    mode,
    range: sorted[count - 1] - sorted[0],
    variance,
    standardDeviation: Math.sqrt(variance),
  };
}
