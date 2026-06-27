/** Sky gradient palettes for the slow background color cycle. */
export const SKY_A = { top: "#C8EDE8", bottom: "#FFF8D6" };
export const SKY_B = { top: "#B4D4F0", bottom: "#FFE8D4" };

export const CYCLE_SECONDS = 120;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t,
  );
}

/** Smooth A → B → A ping-pong over CYCLE_SECONDS. */
export function getSkyGradient(elapsedSeconds: number): string {
  const t = (1 - Math.cos((elapsedSeconds * 2 * Math.PI) / CYCLE_SECONDS)) / 2;
  const top = lerpColor(SKY_A.top, SKY_B.top, t);
  const bottom = lerpColor(SKY_A.bottom, SKY_B.bottom, t);
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
}
