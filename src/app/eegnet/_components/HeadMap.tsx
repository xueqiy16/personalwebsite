"use client";

import { useState, useMemo } from "react";
import { PALETTE, ELECTRODE_NAMES, P300_TEMPLATE, seededRandom, gaussianNoise } from "./constants";

const POSITIONS: Record<string, [number, number]> = {
  Fp1: [135, 75],
  Fp2: [215, 75],
  C3: [105, 165],
  C4: [245, 165],
  Pz: [175, 230],
  O1: [130, 295],
  O2: [220, 295],
  Oz: [175, 320],
};

function generateWaveform(electrode: string, hasP300: boolean, seed: number): number[] {
  const rng = seededRandom(seed + electrode.charCodeAt(0));
  const wave: number[] = [];
  for (let t = 0; t < 100; t++) wave.push(gaussianNoise(rng) * 0.2);
  if (hasP300 && (electrode === "Pz" || electrode === "Oz")) {
    const amp = electrode === "Pz" ? 1.5 : 1.2;
    for (let k = 0; k < P300_TEMPLATE.length; k++) {
      wave[40 + k] += P300_TEMPLATE[k] * amp;
    }
  }
  return wave;
}

function MiniWaveform({ data, label, hasP300Signal }: { data: number[]; label: string; hasP300Signal: boolean }) {
  const W = 240;
  const H = 80;
  const max = Math.max(...data.map(Math.abs), 0.5);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * W},${H / 2 - (v / max) * (H / 2 - 4)}`).join(" ");

  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-neutral-200">
      <div className="text-xs font-semibold text-neutral-500 mb-1">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={PALETTE.grey300} strokeWidth={0.5} />
        {hasP300Signal && (
          <rect x={(40 / 100) * W} y={0} width={(5 / 100) * W} height={H} fill={PALETTE.blue} opacity={0.1} rx={2} />
        )}
        <polyline points={points} fill="none" stroke={hasP300Signal ? PALETTE.blue : PALETTE.grey400} strokeWidth={1.5} />
        {hasP300Signal && (
          <text x={(42.5 / 100) * W} y={12} textAnchor="middle" fill={PALETTE.blue} style={{ fontSize: 8 }}>
            P300
          </text>
        )}
      </svg>
    </div>
  );
}

export default function HeadMap() {
  const [hasP300, setHasP300] = useState(true);
  const [selected, setSelected] = useState<string>("Pz");
  const [seed] = useState(42);

  const waveform = useMemo(
    () => generateWaveform(selected, hasP300, seed),
    [selected, hasP300, seed],
  );

  const isP300Electrode = selected === "Pz" || selected === "Oz";

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      {/* Head diagram */}
      <div className="flex-shrink-0">
        <svg viewBox="0 0 350 400" className="w-full max-w-[280px]">
          {/* Head outline */}
          <ellipse cx={175} cy={200} rx={130} ry={160} fill="none" stroke={PALETTE.grey300} strokeWidth={2} />
          {/* Nose hint */}
          <path d="M175,38 L168,55 L182,55 Z" fill="none" stroke={PALETTE.grey300} strokeWidth={1.5} />
          {/* Ears */}
          <ellipse cx={42} cy={190} rx={12} ry={28} fill="none" stroke={PALETTE.grey300} strokeWidth={1.5} />
          <ellipse cx={308} cy={190} rx={12} ry={28} fill="none" stroke={PALETTE.grey300} strokeWidth={1.5} />

          {ELECTRODE_NAMES.map((name) => {
            const [x, y] = POSITIONS[name];
            const isSelected = name === selected;
            const isP300Site = name === "Pz" || name === "Oz";
            return (
              <g
                key={name}
                onClick={() => setSelected(name)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 16 : 12}
                  fill={
                    isSelected
                      ? hasP300 && isP300Site
                        ? PALETTE.blue
                        : PALETTE.indigo
                      : hasP300 && isP300Site
                        ? PALETTE.blueLight
                        : PALETTE.grey300
                  }
                  stroke={isSelected ? PALETTE.grey900 : "none"}
                  strokeWidth={isSelected ? 2 : 0}
                  style={{ transition: "all 0.2s" }}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected || (hasP300 && isP300Site) ? PALETTE.white : PALETTE.grey700}
                  style={{ fontSize: 10, fontWeight: 600, pointerEvents: "none" }}
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setHasP300(true)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: hasP300 ? PALETTE.blue : PALETTE.grey200,
              color: hasP300 ? PALETTE.white : PALETTE.grey700,
            }}
          >
            Hit (P300)
          </button>
          <button
            onClick={() => setHasP300(false)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: !hasP300 ? PALETTE.rose : PALETTE.grey200,
              color: !hasP300 ? PALETTE.white : PALETTE.grey700,
            }}
          >
            No-Hit
          </button>
        </div>

        <MiniWaveform
          data={waveform}
          label={`${selected} — ${hasP300 && isP300Electrode ? "P300 present" : "Noise only"}`}
          hasP300Signal={hasP300 && isP300Electrode}
        />

        <p className="text-xs text-neutral-400 mt-2">
          Click any electrode to see its waveform. Pz and Oz are the primary P300 sites.
        </p>
      </div>
    </div>
  );
}
