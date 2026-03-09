"use client";

import { useState, useMemo } from "react";
import { PALETTE, generateTrial, zScoreNormalize } from "./constants";

function WaveformPlot({
  data,
  title,
  color,
  yRange,
}: {
  data: number[];
  title: string;
  color: string;
  yRange: [number, number];
}) {
  const W = 400;
  const H = 100;
  const pad = { top: 18, bottom: 4, left: 0, right: 0 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const [yMin, yMax] = yRange;

  const points = data
    .map((v, i) => {
      const x = pad.left + (i / (data.length - 1)) * plotW;
      const y = pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
        {title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line
          x1={pad.left}
          y1={pad.top + plotH / 2}
          x2={W - pad.right}
          y2={pad.top + plotH / 2}
          stroke={PALETTE.grey200}
          strokeWidth={0.5}
        />
        <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
      </svg>
    </div>
  );
}

export default function NormalizationDemo() {
  const [noiseStd, setNoiseStd] = useState(0.2);
  const [seed, setSeed] = useState(42);

  const { raw, norm, mean, std } = useMemo(() => {
    const trial = generateTrial(true, 8, 100, noiseStd);
    const pzRaw = trial[4];
    const { normalized, mean, std } = zScoreNormalize(trial);
    return { raw: pzRaw, norm: normalized[4], mean, std };
  }, [noiseStd, seed]);

  const rawMax = Math.max(...raw.map(Math.abs), 0.1);
  const normMax = Math.max(...norm.map(Math.abs), 0.1);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label className="text-sm font-medium" style={{ color: PALETTE.grey700 }}>
          Noise σ: {noiseStd.toFixed(2)}
        </label>
        <input
          type="range"
          min={0.05}
          max={1.0}
          step={0.05}
          value={noiseStd}
          onChange={(e) => setNoiseStd(parseFloat(e.target.value))}
          className="w-48 accent-blue-500"
        />
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: PALETTE.grey200, color: PALETTE.grey700 }}
        >
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-3 border border-neutral-200">
          <WaveformPlot data={raw} title="Before (Pz raw)" color={PALETTE.rose} yRange={[-rawMax, rawMax]} />
          <div className="text-xs mt-1" style={{ color: PALETTE.grey400 }}>
            μ = {mean.toFixed(3)}, σ = {std.toFixed(3)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 border border-neutral-200">
          <WaveformPlot data={norm} title="After z-score (Pz)" color={PALETTE.blue} yRange={[-normMax, normMax]} />
          <div className="text-xs mt-1" style={{ color: PALETTE.grey400 }}>
            μ ≈ 0, σ ≈ 1
          </div>
        </div>
      </div>
    </div>
  );
}
