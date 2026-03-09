"use client";

import { useState, useMemo } from "react";
import { PALETTE, ELECTRODE_NAMES, generateTrial, P300_TEMPLATE } from "./constants";

const KERNEL_SIZE = 5;
const N_TIME = 100;
const OUT_LEN = N_TIME - KERNEL_SIZE + 1;
const TEMP_KERNEL = [0.0, 0.3, 0.8, 0.3, 0.0];
const LEARNED_SPATIAL = [0.05, 0.04, 0.08, 0.06, 0.85, 0.03, 0.05, 0.62];

function temporalConv(channel: number[]): number[] {
  const out: number[] = [];
  for (let t = 0; t < OUT_LEN; t++) {
    let sum = 0;
    for (let k = 0; k < KERNEL_SIZE; k++) sum += channel[t + k] * TEMP_KERNEL[k];
    out.push(sum);
  }
  return out;
}

export default function SpatialConvDemo() {
  const trial = useMemo(() => generateTrial(true, 8, N_TIME, 0.2), []);
  const tempOuts = useMemo(() => trial.map((ch) => temporalConv(ch)), [trial]);

  const [weights, setWeights] = useState<number[]>(() =>
    Array(8).fill(0).map(() => 0.125),
  );

  const combined = useMemo(() => {
    const out: number[] = new Array(OUT_LEN).fill(0);
    for (let t = 0; t < OUT_LEN; t++) {
      for (let c = 0; c < 8; c++) out[t] += tempOuts[c][t] * weights[c];
    }
    return out;
  }, [tempOuts, weights]);

  const resetToLearned = () => setWeights([...LEARNED_SPATIAL]);
  const resetToEqual = () => setWeights(Array(8).fill(0.125));

  const W = 500;
  const H = 24;
  const combH = 60;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={resetToLearned}
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ background: PALETTE.blue }}
        >
          Learned weights (Pz/Oz peak)
        </button>
        <button
          onClick={resetToEqual}
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: PALETTE.grey200, color: PALETTE.grey700 }}
        >
          Equal weights
        </button>
      </div>

      {/* Channel waveforms with sliders */}
      <div className="space-y-1 mb-4">
        {ELECTRODE_NAMES.map((name, c) => {
          const max = Math.max(...tempOuts[c].map(Math.abs), 0.1);
          const pts = tempOuts[c]
            .map((v, i) => `${(i / (OUT_LEN - 1)) * W},${H / 2 - (v / max) * (H / 2 - 2)}`)
            .join(" ");

          return (
            <div key={name} className="flex items-center gap-2">
              <span
                className="w-8 text-right text-[10px] font-semibold flex-shrink-0"
                style={{ color: c === 4 || c === 7 ? PALETTE.blue : PALETTE.grey500 }}
              >
                {name}
              </span>
              <svg viewBox={`0 0 ${W} ${H}`} className="flex-1" style={{ height: 22 }}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={c === 4 || c === 7 ? PALETTE.blue : PALETTE.grey400}
                  strokeWidth={1}
                  opacity={0.3 + Math.abs(weights[c]) * 0.7}
                />
              </svg>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={weights[c]}
                onChange={(e) => {
                  const next = [...weights];
                  next[c] = parseFloat(e.target.value);
                  setWeights(next);
                }}
                className="w-20 accent-blue-500 flex-shrink-0"
              />
              <span className="w-10 text-[10px] font-mono" style={{ color: PALETTE.grey500 }}>
                {weights[c].toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Combined output */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-3">
        <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
          Spatially weighted output
        </div>
        <svg viewBox={`0 0 ${W} ${combH}`} className="w-full">
          <line x1={0} y1={combH / 2} x2={W} y2={combH / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
          {(() => {
            const max = Math.max(...combined.map(Math.abs), 0.01);
            const pts = combined
              .map((v, i) => `${(i / (OUT_LEN - 1)) * W},${combH / 2 - (v / max) * (combH / 2 - 4)}`)
              .join(" ");
            return <polyline points={pts} fill="none" stroke={PALETTE.indigo} strokeWidth={1.5} />;
          })()}
        </svg>
      </div>
    </div>
  );
}
