"use client";

import { useState, useMemo } from "react";
import { PALETTE } from "./constants";

function elu(x: number, alpha: number): number {
  return x > 0 ? x : alpha * (Math.exp(x) - 1);
}

const SAMPLE_INPUT = (() => {
  const pts: number[] = [];
  for (let i = 0; i < 96; i++) {
    pts.push(Math.sin(i * 0.15) * 0.8 + (Math.random() - 0.5) * 0.3 - 0.1);
  }
  return pts;
})();

const POOL_SIZE = 4;

export default function EluPoolDemo() {
  const [alpha, setAlpha] = useState(1.0);

  const eluOut = useMemo(() => SAMPLE_INPUT.map((v) => elu(v, alpha)), [alpha]);

  const pooled = useMemo(() => {
    const out: number[] = [];
    const len = Math.floor(eluOut.length / POOL_SIZE);
    for (let i = 0; i < len; i++) {
      let sum = 0;
      for (let j = 0; j < POOL_SIZE; j++) sum += eluOut[i * POOL_SIZE + j];
      out.push(sum / POOL_SIZE);
    }
    return out;
  }, [eluOut]);

  const W = 500;
  const H = 100;

  function plotLine(data: number[], color: string, max: number) {
    return data
      .map((v, i) => `${(i / (data.length - 1)) * W},${H / 2 - (v / max) * (H / 2 - 6)}`)
      .join(" ");
  }

  const inputMax = Math.max(...SAMPLE_INPUT.map(Math.abs), 0.1);
  const eluMax = Math.max(...eluOut.map(Math.abs), 0.1);
  const poolMax = Math.max(...pooled.map(Math.abs), 0.1);

  // ELU function curve for the mini-plot
  const funcW = 200;
  const funcH = 100;
  const funcRange = 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: ELU */}
      <div>
        <div className="text-sm font-semibold mb-2" style={{ color: PALETTE.grey700 }}>
          ELU Activation
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-xs" style={{ color: PALETTE.grey500 }}>
            α = {alpha.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={2.0}
            step={0.05}
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="flex-1 accent-green-500"
          />
        </div>

        {/* ELU function curve */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-2 mb-3">
          <svg viewBox={`0 0 ${funcW} ${funcH}`} className="w-full" style={{ height: 90 }}>
            <line x1={0} y1={funcH / 2} x2={funcW} y2={funcH / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
            <line x1={funcW / 2} y1={0} x2={funcW / 2} y2={funcH} stroke={PALETTE.grey200} strokeWidth={0.5} />
            {(() => {
              const pts: string[] = [];
              for (let px = 0; px <= funcW; px++) {
                const x = ((px / funcW) * 2 - 1) * funcRange;
                const y = elu(x, alpha);
                const sy = funcH / 2 - (y / funcRange) * (funcH / 2 - 4);
                pts.push(`${px},${sy}`);
              }
              return <polyline points={pts.join(" ")} fill="none" stroke={PALETTE.green} strokeWidth={1.5} />;
            })()}
            <text x={funcW - 4} y={funcH / 2 - 4} textAnchor="end" fill={PALETTE.grey400} style={{ fontSize: 7 }}>
              x
            </text>
            <text x={funcW / 2 + 4} y={10} fill={PALETTE.grey400} style={{ fontSize: 7 }}>
              ELU(x)
            </text>
          </svg>
        </div>

        {/* Input vs ELU output */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-2">
          <div className="text-[10px] mb-0.5" style={{ color: PALETTE.grey400 }}>
            <span style={{ color: PALETTE.grey500 }}>■ Input</span>{" "}
            <span style={{ color: PALETTE.green }}>■ After ELU</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
            <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
            <polyline points={plotLine(SAMPLE_INPUT, PALETTE.grey400, inputMax)} fill="none" stroke={PALETTE.grey400} strokeWidth={0.8} opacity={0.5} />
            <polyline points={plotLine(eluOut, PALETTE.green, eluMax)} fill="none" stroke={PALETTE.green} strokeWidth={1.2} />
          </svg>
        </div>
      </div>

      {/* Right: Pooling */}
      <div>
        <div className="text-sm font-semibold mb-2" style={{ color: PALETTE.grey700 }}>
          Average Pooling (size {POOL_SIZE})
        </div>
        <p className="text-xs mb-3" style={{ color: PALETTE.grey400 }}>
          Groups of {POOL_SIZE} values are averaged, reducing {eluOut.length} samples to {pooled.length}.
        </p>

        {/* ELU out with brackets */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-2 mb-3">
          <div className="text-[10px] mb-0.5" style={{ color: PALETTE.grey400 }}>
            ELU output with pool windows
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
            <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
            {/* Pool region bands */}
            {pooled.map((_, i) => {
              const x1 = (i * POOL_SIZE / eluOut.length) * W;
              const x2 = ((i * POOL_SIZE + POOL_SIZE) / eluOut.length) * W;
              return (
                <rect
                  key={i}
                  x={x1}
                  y={0}
                  width={x2 - x1}
                  height={H}
                  fill={i % 2 === 0 ? PALETTE.amber : PALETTE.blue}
                  opacity={0.06}
                />
              );
            })}
            <polyline points={plotLine(eluOut, PALETTE.green, eluMax)} fill="none" stroke={PALETTE.green} strokeWidth={1} />
          </svg>
        </div>

        {/* Pooled output */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-2">
          <div className="text-[10px] mb-0.5" style={{ color: PALETTE.grey400 }}>
            Pooled output ({pooled.length} values)
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
            <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
            {(() => {
              const pts = pooled
                .map((v, i) => `${(i / (pooled.length - 1)) * W},${H / 2 - (v / poolMax) * (H / 2 - 6)}`)
                .join(" ");
              return <polyline points={pts} fill="none" stroke={PALETTE.amber} strokeWidth={1.5} />;
            })()}
            {pooled.map((v, i) => (
              <circle
                key={i}
                cx={(i / (pooled.length - 1)) * W}
                cy={H / 2 - (v / poolMax) * (H / 2 - 6)}
                r={2.5}
                fill={PALETTE.amber}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
