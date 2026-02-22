"use client";

/**
 * Exterior block-step staircases attached to the monument.
 *
 * Four staircase groups:
 *   1. Upper +Z  — terrace edge → ring bridge level
 *   2. Upper +X  — terrace edge → ring bridge level
 *   3. Lower +Z  — below ring → base level (path to Arts door)
 *   4. Lower +X  — below ring → base level (path to Projects door)
 *   5. Tower     — terrace → up between pagoda towers (path to About Me)
 */

const C = {
  step: "#E0D8F0",
  accent: "#00D1D1",
};
const G = { emissive: "#ffffff" as const, emissiveIntensity: 0.18 };

interface StepDef {
  pos: [number, number, number];
  size: [number, number, number];
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function makeSteps(
  from: [number, number, number],
  to: [number, number, number],
  count: number,
  width: number,
  depth: number,
  axis: "x" | "z",
): StepDef[] {
  const steps: StepDef[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const pos = lerp3(from, to, t);
    const size: [number, number, number] =
      axis === "z" ? [width, 0.1, depth] : [depth, 0.1, width];
    steps.push({ pos, size });
  }
  return steps;
}

function StepGroup({
  steps,
  color = C.step,
}: {
  steps: StepDef[];
  color?: string;
}) {
  return (
    <group>
      {steps.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <boxGeometry args={s.size} />
          <meshStandardMaterial color={color} {...G} />
        </mesh>
      ))}
    </group>
  );
}

export default function Stairs() {
  // Upper stairs +Z (terrace → ring bridge level)
  const upperZ = makeSteps(
    [0.2, 6.95, 2.3],
    [0, 5.35, 3.05],
    6,
    0.9,
    0.35,
    "z",
  );

  // Upper stairs +X (terrace → ring bridge level)
  const upperX = makeSteps(
    [2.3, 6.95, 0.2],
    [3.05, 5.85, 0],
    6,
    0.9,
    0.35,
    "x",
  );

  // Lower stairs +Z (below ring → Arts door)
  const lowerZ = makeSteps(
    [0, 4.15, 3.05],
    [-1.0, 0.5, 3.3],
    8,
    0.9,
    0.35,
    "z",
  );

  // Lower stairs +X (below ring → Projects door)
  const lowerX = makeSteps(
    [3.05, 4.15, 0],
    [3.3, 0.5, -1.0],
    8,
    0.9,
    0.35,
    "x",
  );

  // Tower stairs (terrace → About Me)
  const towerSteps = makeSteps(
    [0, 7.1, -1.2],
    [0, 9.45, -0.05],
    7,
    0.8,
    0.35,
    "z",
  );

  return (
    <group>
      {/* Side rails for upper +Z stairs */}
      <mesh position={[0.5, 6.1, 2.7]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[-0.5, 6.1, 2.7]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* Side rails for upper +X stairs */}
      <mesh position={[2.7, 6.35, 0.5]}>
        <boxGeometry args={[0.04, 1.4, 0.04]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[2.7, 6.35, -0.5]}>
        <boxGeometry args={[0.04, 1.4, 0.04]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      <StepGroup steps={upperZ} />
      <StepGroup steps={upperX} />
      <StepGroup steps={lowerZ} />
      <StepGroup steps={lowerX} />
      <StepGroup steps={towerSteps} color={C.accent} />
    </group>
  );
}
