export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const average = (values: number[], fallback = 50): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

export const normalizeAttribute = (value: number): number => clamp(value, 1, 100) / 100;

export const fatigueMultiplier = (fatigue: number): number =>
  clamp(0.62 + normalizeAttribute(fatigue) * 0.45, 0.62, 1.07);

export const moraleMultiplier = (morale: number): number =>
  clamp(0.88 + normalizeAttribute(morale) * 0.24, 0.88, 1.12);

export const weightedScore = <T extends string>(
  values: Record<T, number>,
  weights: Partial<Record<T, number>>,
  fallback = 50
): number => {
  let weighted = 0;
  let weightSum = 0;

  Object.entries(weights).forEach(([key, rawWeight]) => {
    const weight = typeof rawWeight === 'number' ? rawWeight : 0;
    const value = values[key as T];
    if (typeof value !== 'number' || weight <= 0) return;
    weighted += value * weight;
    weightSum += weight;
  });

  return weightSum > 0 ? weighted / weightSum : fallback;
};

export const sigmoidProbability = (scoreDiff: number, scale = 14): number =>
  1 / (1 + Math.exp(-scoreDiff / scale));

export const contestProbability = (
  attackScore: number,
  defenseScore: number,
  base = 0.5,
  scale = 18
): number => clamp(base + (sigmoidProbability(attackScore - defenseScore, scale) - 0.5), 0.03, 0.97);

export const stableHash = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const seededRandom = (seed: string, second: number, salt: number): number => {
  let value = stableHash(`${seed}:${second}:${salt}`) + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

export const pickWeighted = <T>(
  options: Array<{ item: T; weight: number }>,
  roll: number
): T => {
  const total = options.reduce((sum, option) => sum + Math.max(0, option.weight), 0);
  if (total <= 0) return options[0].item;

  let cursor = roll * total;
  for (const option of options) {
    cursor -= Math.max(0, option.weight);
    if (cursor <= 0) return option.item;
  }

  return options[options.length - 1].item;
};

