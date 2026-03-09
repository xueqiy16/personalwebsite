"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { PALETTE, generateTrial, zScoreNormalize, P300_TEMPLATE } from "./constants";

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function crossEntropy(prob: number): number {
  return -Math.log(Math.max(prob, 1e-15));
}

/* Simulate a realistic pooled vector from a trial through the pipeline */
function simulatePooled(hasP300: boolean): number[] {
  const trial = generateTrial(hasP300, 8, 100, 0.2);
  const { normalized } = zScoreNormalize(trial);
  const kernel = [0.0, 0.4, 1.0, 0.4, 0.0];
  const spatW = [0.05, 0.04, 0.08, 0.06, 0.85, 0.03, 0.05, 0.62];
  const tempOutLen = 96;

  // Temporal conv → spatial conv → ELU → avg pool
  const spatOut: number[] = new Array(tempOutLen).fill(0);
  for (let t = 0; t < tempOutLen; t++) {
    for (let c = 0; c < 8; c++) {
      let s = 0;
      for (let k = 0; k < 5; k++) s += normalized[c][t + k] * kernel[k];
      spatOut[t] += s * spatW[c];
    }
  }
  const eluOut = spatOut.map((v) => (v > 0 ? v : Math.exp(v) - 1));
  const pooled: number[] = [];
  for (let i = 0; i < 24; i++) {
    let s = 0;
    for (let j = 0; j < 4; j++) s += eluOut[i * 4 + j];
    pooled.push(s / 4);
  }
  return pooled;
}

/* Learned-ish FC weights: row 0 = No-Hit, row 1 = Hit */
const FC_W: number[][] = (() => {
  const w: number[][] = [[], []];
  for (let j = 0; j < 24; j++) {
    w[0].push((Math.sin(j * 0.5) * 0.3 - 0.1));
    w[1].push((Math.cos(j * 0.4) * 0.3 + 0.15));
  }
  return w;
})();
const FC_B = [-0.2, 0.3];

function BarChart({
  data,
  color,
  height,
  label,
}: {
  data: number[];
  color: string;
  height: number;
  label: string;
}) {
  const max = Math.max(...data.map(Math.abs), 0.01);
  const barW = Math.max(1, 400 / data.length - 1);
  const W = data.length * (barW + 1);

  return (
    <div>
      <div className="text-[10px] font-semibold mb-0.5" style={{ color: PALETTE.grey500 }}>
        {label}
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }}>
        <line x1={0} y1={height / 2} x2={W} y2={height / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
        {data.map((v, i) => {
          const barH = (Math.abs(v) / max) * (height / 2 - 2);
          const y = v >= 0 ? height / 2 - barH : height / 2;
          return (
            <rect
              key={i}
              x={i * (barW + 1)}
              y={y}
              width={barW}
              height={Math.max(0.5, barH)}
              fill={color}
              opacity={0.8}
              rx={0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function ClassificationDemo() {
  const [isHit, setIsHit] = useState(true);
  const [animStep, setAnimStep] = useState(0);
  const [seed, setSeed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const pooled = useMemo(() => simulatePooled(isHit), [isHit, seed]);

  const logits = useMemo(() => {
    return FC_W.map((row, r) => {
      let s = FC_B[r];
      for (let j = 0; j < 24; j++) s += row[j] * pooled[j];
      return s;
    });
  }, [pooled]);

  const probs = useMemo(() => softmax(logits), [logits]);
  const prediction = probs[1] > 0.5 ? "Hit (P300)" : "No-Hit";
  const correct = (probs[1] > 0.5) === isHit;
  const loss = crossEntropy(probs[isHit ? 1 : 0]);

  // Auto-advance animation steps
  useEffect(() => {
    setAnimStep(0);
    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      if (step > 4) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      setAnimStep(step);
    }, 800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHit, seed]);

  const stepVisible = (n: number) => animStep >= n;

  // Loss curve data
  const lossW = 400;
  const lossH = 90;
  const lossPts: string[] = [];
  for (let px = 2; px < lossW; px++) {
    const p = px / lossW;
    const l = crossEntropy(p);
    const y = lossH - 6 - Math.min(l, 4) * ((lossH - 12) / 4);
    lossPts.push(`${px},${y}`);
  }
  const curLossX = probs[isHit ? 1 : 0] * lossW;
  const curLossY = lossH - 6 - Math.min(loss, 4) * ((lossH - 12) / 4);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm font-medium" style={{ color: PALETTE.grey700 }}>
          Input trial:
        </span>
        <button
          onClick={() => { setIsHit(true); setSeed((s) => s + 1); }}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            background: isHit ? PALETTE.blue : PALETTE.grey200,
            color: isHit ? PALETTE.white : PALETTE.grey700,
          }}
        >
          Hit (P300)
        </button>
        <button
          onClick={() => { setIsHit(false); setSeed((s) => s + 1); }}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            background: !isHit ? PALETTE.rose : PALETTE.grey200,
            color: !isHit ? PALETTE.white : PALETTE.grey700,
          }}
        >
          No-Hit
        </button>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: PALETTE.grey200, color: PALETTE.grey700 }}
        >
          Regenerate
        </button>
      </div>

      {/* Step-by-step pipeline */}
      <div className="space-y-4">
        {/* Step 1: Pooled vector */}
        <div
          className="bg-white rounded-lg shadow border border-neutral-200 p-3 transition-opacity duration-500"
          style={{ opacity: stepVisible(0) ? 1 : 0.15 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ background: PALETTE.amber }}>1</span>
            <span className="text-xs font-semibold" style={{ color: PALETTE.grey700 }}>Pooled vector (24 values)</span>
          </div>
          <BarChart data={pooled} color={PALETTE.amber} height={50} label="" />
          <p className="text-[10px] mt-1" style={{ color: PALETTE.grey400 }}>
            The output of avg-pooling — 24 numbers summarizing the entire trial.
          </p>
        </div>

        {/* Step 2: Weight matrix multiplication */}
        <div
          className="bg-white rounded-lg shadow border border-neutral-200 p-3 transition-opacity duration-500"
          style={{ opacity: stepVisible(1) ? 1 : 0.15 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ background: PALETTE.indigo }}>2</span>
            <span className="text-xs font-semibold" style={{ color: PALETTE.grey700 }}>Multiply by weight matrix W (2 &times; 24)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <BarChart data={FC_W[0]} color={PALETTE.rose} height={36} label="Row 0 — No-Hit weights" />
            </div>
            <div>
              <BarChart data={FC_W[1]} color={PALETTE.blue} height={36} label="Row 1 — Hit weights" />
            </div>
          </div>
          <p className="text-[10px] mt-1" style={{ color: PALETTE.grey400 }}>
            Each row is dot-multiplied with the pooled vector. These weights are randomly initialized and learned during training.
          </p>
        </div>

        {/* Step 3: Logits */}
        <div
          className="bg-white rounded-lg shadow border border-neutral-200 p-3 transition-opacity duration-500"
          style={{ opacity: stepVisible(2) ? 1 : 0.15 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ background: PALETTE.grey700 }}>3</span>
            <span className="text-xs font-semibold" style={{ color: PALETTE.grey700 }}>Logits (raw scores) + bias</span>
          </div>
          <div className="flex gap-6 justify-center">
            {["No-Hit", "Hit"].map((label, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] mb-1" style={{ color: PALETTE.grey500 }}>{label}</div>
                <div
                  className="font-mono text-lg font-bold px-4 py-1 rounded"
                  style={{
                    background: i === 0 ? "#FEE2E2" : "#DBEAFE",
                    color: i === 0 ? PALETTE.rose : PALETTE.blue,
                  }}
                >
                  {logits[i].toFixed(3)}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: PALETTE.grey400 }}>
                  W[{i}] · pool + b[{i}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Softmax → Probabilities */}
        <div
          className="bg-white rounded-lg shadow border border-neutral-200 p-3 transition-opacity duration-500"
          style={{ opacity: stepVisible(3) ? 1 : 0.15 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ background: "#a855f7" }}>4</span>
            <span className="text-xs font-semibold" style={{ color: PALETTE.grey700 }}>Softmax → probabilities (sum to 1)</span>
          </div>
          {["No-Hit", "Hit"].map((label, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span style={{ color: PALETTE.grey700 }}>{label}</span>
                <span className="font-mono font-semibold" style={{ color: i === 1 ? PALETTE.blue : PALETTE.rose }}>
                  {(probs[i] * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-5 rounded-full overflow-hidden" style={{ background: PALETTE.grey200 }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${probs[i] * 100}%`,
                    background: i === 1 ? PALETTE.blue : PALETTE.rose,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Step 5: Verdict */}
        <div
          className="rounded-lg p-4 text-center transition-opacity duration-500"
          style={{
            opacity: stepVisible(4) ? 1 : 0.15,
            background: correct ? "#F0FDF4" : "#FEF2F2",
            border: `2px solid ${correct ? PALETTE.green : PALETTE.rose}`,
          }}
        >
          <div className="text-sm font-semibold mb-0.5" style={{ color: correct ? PALETTE.green : PALETTE.rose }}>
            Prediction: {prediction}
          </div>
          <div className="text-xs" style={{ color: PALETTE.grey500 }}>
            {correct ? "Correct!" : "Incorrect"} — True label: {isHit ? "Hit" : "No-Hit"} — Loss: {loss.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Loss curve */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-3 mt-4">
        <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
          Cross-entropy loss: &minus;log(p<sub>correct</sub>) = {loss.toFixed(3)}
        </div>
        <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-full">
          <polyline points={lossPts.join(" ")} fill="none" stroke={PALETTE.grey300} strokeWidth={1} />
          <circle cx={curLossX} cy={curLossY} r={4.5} fill={PALETTE.rose} />
          <text x={curLossX + 8} y={curLossY - 4} fill={PALETTE.rose} style={{ fontSize: 9, fontWeight: 600 }}>
            {loss.toFixed(2)}
          </text>
          <text x={lossW / 2} y={lossH - 1} textAnchor="middle" fill={PALETTE.grey400} style={{ fontSize: 8 }}>
            P(correct class) →
          </text>
        </svg>
      </div>
    </div>
  );
}
