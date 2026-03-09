"use client";

import { useState, useCallback } from "react";
import { PALETTE, ELECTRODE_NAMES, generateTrial, valueToColor } from "./constants";

function Heatmap({ data, hasP300 }: { data: number[][]; hasP300: boolean }) {
  const nC = data.length;
  const nT = data[0]?.length ?? 0;
  const cellW = 4;
  const cellH = 20;
  const labelW = 32;
  const W = labelW + nT * cellW;
  const H = nC * cellH;
  const absMax = Math.max(...data.flat().map(Math.abs), 0.3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {data.map((row, c) => (
        <g key={c}>
          <text
            x={labelW - 4}
            y={c * cellH + cellH / 2 + 1}
            textAnchor="end"
            dominantBaseline="central"
            fill={PALETTE.grey500}
            style={{ fontSize: 7 }}
          >
            {ELECTRODE_NAMES[c]}
          </text>
          {row.map((v, t) => (
            <rect
              key={t}
              x={labelW + t * cellW}
              y={c * cellH}
              width={cellW}
              height={cellH - 1}
              fill={valueToColor(v, absMax)}
            />
          ))}
        </g>
      ))}
      {hasP300 && (
        <rect
          x={labelW + 40 * cellW}
          y={0}
          width={5 * cellW}
          height={H}
          fill="none"
          stroke={PALETTE.blue}
          strokeWidth={1.5}
          rx={2}
          opacity={0.8}
        />
      )}
    </svg>
  );
}

function MiniBatch({ trials }: { trials: { data: number[][]; label: number }[] }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {trials.map((t, i) => {
        const absMax = Math.max(...t.data.flat().map(Math.abs), 0.3);
        const nC = t.data.length;
        const nT = t.data[0].length;
        const cW = 2;
        const cH = 6;
        return (
          <div
            key={i}
            className="rounded border p-0.5"
            style={{ borderColor: t.label === 1 ? PALETTE.blue : PALETTE.grey300 }}
          >
            <svg viewBox={`0 0 ${nT * cW} ${nC * cH}`} className="w-full" style={{ height: 40 }}>
              {t.data.map((row, c) =>
                row.map((v, ti) => (
                  <rect
                    key={`${c}-${ti}`}
                    x={ti * cW}
                    y={c * cH}
                    width={cW}
                    height={cH - 0.5}
                    fill={valueToColor(v, absMax)}
                  />
                )),
              )}
            </svg>
            <div
              className="text-center font-semibold"
              style={{ fontSize: 8, color: t.label === 1 ? PALETTE.blue : PALETTE.grey500 }}
            >
              {t.label === 1 ? "Hit" : "No-Hit"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrialGenerator() {
  const [hasP300, setHasP300] = useState(true);
  const [trial, setTrial] = useState<number[][] | null>(null);
  const [batch, setBatch] = useState<{ data: number[][]; label: number }[] | null>(null);
  const [seedCounter, setSeedCounter] = useState(1);

  const genTrial = useCallback(() => {
    const data = generateTrial(hasP300);
    setTrial(data);
    setBatch(null);
    setSeedCounter((c) => c + 1);
  }, [hasP300]);

  const genBatch = useCallback(() => {
    const trials: { data: number[][]; label: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const label = i < 8 ? 1 : 0;
      trials.push({ data: generateTrial(label === 1), label });
    }
    const perm = trials.sort(() => Math.random() - 0.5);
    setBatch(perm);
    setTrial(null);
    setSeedCounter((c) => c + 1);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setHasP300(true)}
          className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
          style={{
            background: hasP300 ? PALETTE.blue : PALETTE.grey200,
            color: hasP300 ? PALETTE.white : PALETTE.grey700,
          }}
        >
          Has P300
        </button>
        <button
          onClick={() => setHasP300(false)}
          className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
          style={{
            background: !hasP300 ? PALETTE.rose : PALETTE.grey200,
            color: !hasP300 ? PALETTE.white : PALETTE.grey700,
          }}
        >
          No P300
        </button>
        <button
          onClick={genTrial}
          className="px-4 py-1 rounded-full text-sm font-medium text-white"
          style={{ background: PALETTE.indigo }}
        >
          Generate Trial
        </button>
        <button
          onClick={genBatch}
          className="px-4 py-1 rounded-full text-sm font-medium text-white"
          style={{ background: PALETTE.grey700 }}
        >
          Generate Batch (16)
        </button>
      </div>

      {trial && <Heatmap data={trial} hasP300={hasP300} />}
      {batch && <MiniBatch trials={batch} />}

      {!trial && !batch && (
        <div
          className="flex items-center justify-center rounded-lg border-2 border-dashed"
          style={{ borderColor: PALETTE.grey300, height: 160, color: PALETTE.grey400 }}
        >
          <span className="text-sm">Press a button above to generate data</span>
        </div>
      )}
    </div>
  );
}
