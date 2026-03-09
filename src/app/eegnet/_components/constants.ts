/* Shared palette, layout tokens, and helpers for the EEGNet article */

export const PALETTE = {
  blue: "#3B82F6",
  blueLight: "#60A5FA",
  blueDark: "#1D4ED8",
  indigo: "#6366F1",
  rose: "#F43F5E",
  green: "#22C55E",
  amber: "#F59E0B",
  grey200: "#E5E7EB",
  grey300: "#D1D5DB",
  grey400: "#9CA3AF",
  grey500: "#6B7280",
  grey700: "#374151",
  grey900: "#111827",
  white: "#FFFFFF",
  bg: "#FAFAFA",
  p300Hit: "#3B82F6",
  p300NoHit: "#9CA3AF",
};

export const FONT = "'Calibri', 'Carlito', 'Segoe UI', sans-serif";

export const ELECTRODE_NAMES = ["Fp1", "Fp2", "C3", "C4", "Pz", "O1", "O2", "Oz"] as const;

export const P300_TEMPLATE = [0.0, 0.5, 1.0, 0.5, 0.0];

/** Seeded pseudo-random (mulberry32) for deterministic demos. */
export function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate gaussian noise using Box-Muller. */
export function gaussianNoise(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

/** Generate a single EEG trial matching the Python code. */
export function generateTrial(
  hasP300: boolean,
  nChannels = 8,
  nTime = 100,
  noiseStd = 0.2,
  rng?: () => number,
): number[][] {
  const r = rng ?? Math.random;
  const data: number[][] = [];
  for (let c = 0; c < nChannels; c++) {
    const row: number[] = [];
    for (let t = 0; t < nTime; t++) row.push(gaussianNoise(r) * noiseStd);
    data.push(row);
  }
  if (hasP300) {
    const onset = 40;
    const amp = 1.5;
    for (let k = 0; k < P300_TEMPLATE.length; k++) {
      data[4][onset + k] += P300_TEMPLATE[k] * amp;
      data[7][onset + k] += P300_TEMPLATE[k] * amp * 0.8;
    }
  }
  return data;
}

/** Z-score normalise a 2D array (global mean/std). */
export function zScoreNormalize(data: number[][]): {
  normalized: number[][];
  mean: number;
  std: number;
} {
  let sum = 0;
  let count = 0;
  for (const row of data) for (const v of row) { sum += v; count++; }
  const mean = sum / count;
  let sqSum = 0;
  for (const row of data) for (const v of row) sqSum += (v - mean) ** 2;
  const std = Math.sqrt(sqSum / count);
  const eps = 1e-6;
  const normalized = data.map((row) => row.map((v) => (v - mean) / (std + eps)));
  return { normalized, mean, std };
}

/** Map a value to a blue-white-red colour. */
export function valueToColor(v: number, absMax: number): string {
  const t = Math.max(-1, Math.min(1, v / (absMax || 1)));
  if (t >= 0) {
    const r = Math.round(59 + (255 - 59) * (1 - t));
    const g = Math.round(130 + (255 - 130) * (1 - t));
    const b = Math.round(246 + (255 - 246) * (1 - t));
    return `rgb(${r},${g},${b})`;
  }
  const at = -t;
  const r = Math.round(244 + (255 - 244) * (1 - at));
  const g = Math.round(63 + (255 - 63) * (1 - at));
  const b = Math.round(94 + (255 - 94) * (1 - at));
  return `rgb(${r},${g},${b})`;
}
