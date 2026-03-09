"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PALETTE, P300_TEMPLATE, seededRandom, gaussianNoise } from "./constants";

const N_TIME = 100;
const KERNEL_SIZE = 5;
const OUT_LEN = N_TIME - KERNEL_SIZE + 1;

function generateChannel(hasP300: boolean, seed: number): number[] {
  const rng = seededRandom(seed);
  const ch: number[] = [];
  for (let t = 0; t < N_TIME; t++) ch.push(gaussianNoise(rng) * 0.2);
  if (hasP300) {
    for (let k = 0; k < P300_TEMPLATE.length; k++) ch[40 + k] += P300_TEMPLATE[k] * 1.5;
  }
  return ch;
}

const INIT_KERNEL = [0.0, 0.3, 0.8, 0.3, 0.0];

export default function TemporalConvDemo() {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(0);
  const posRef = useRef(0);

  const signal = useMemo(() => generateChannel(true, 77), []);

  const output = useMemo(() => {
    const out: number[] = [];
    for (let t = 0; t < OUT_LEN; t++) {
      let sum = 0;
      for (let k = 0; k < KERNEL_SIZE; k++) sum += signal[t + k] * INIT_KERNEL[k];
      out.push(sum);
    }
    return out;
  }, [signal]);

  const dotProduct = useMemo(() => {
    let sum = 0;
    for (let k = 0; k < KERNEL_SIZE; k++) sum += signal[pos + k] * INIT_KERNEL[k];
    return sum;
  }, [signal, pos]);

  useEffect(() => {
    if (!playing) return;
    let last = 0;
    const step = (ts: number) => {
      if (ts - last > 60) {
        last = ts;
        posRef.current += 1;
        if (posRef.current >= OUT_LEN) {
          posRef.current = 0;
          setPlaying(false);
        }
        setPos(posRef.current);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const handlePlay = useCallback(() => {
    posRef.current = 0;
    setPos(0);
    setPlaying(true);
  }, []);

  const W = 600;
  const H = 100;
  const pad = 8;
  const sigMax = Math.max(...signal.map(Math.abs), 0.3);
  const outMax = Math.max(...output.map(Math.abs), 0.3);

  const toX = (i: number, total: number) => pad + (i / (total - 1)) * (W - 2 * pad);
  const toY = (v: number, max: number) => H / 2 - (v / max) * (H / 2 - 6);

  const sigPts = signal.map((v, i) => `${toX(i, N_TIME)},${toY(v, sigMax)}`).join(" ");
  const outPts = output
    .slice(0, pos + 1)
    .map((v, i) => `${toX(i, OUT_LEN)},${toY(v, outMax)}`)
    .join(" ");

  const winX1 = toX(pos, N_TIME);
  const winX2 = toX(pos + KERNEL_SIZE - 1, N_TIME);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handlePlay}
          className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
          style={{ background: playing ? PALETTE.grey400 : PALETTE.blue }}
          disabled={playing}
        >
          {playing ? "Playing..." : "▶ Play"}
        </button>
        <label className="text-sm" style={{ color: PALETTE.grey500 }}>
          Position: {pos} / {OUT_LEN - 1}
        </label>
        <input
          type="range"
          min={0}
          max={OUT_LEN - 1}
          value={pos}
          onChange={(e) => {
            setPlaying(false);
            setPos(parseInt(e.target.value));
            posRef.current = parseInt(e.target.value);
          }}
          className="flex-1 accent-blue-500"
        />
      </div>

      {/* Input signal */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-3 mb-3">
        <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
          Input signal (Pz channel) — {N_TIME} samples
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
          <rect
            x={winX1}
            y={2}
            width={winX2 - winX1}
            height={H - 4}
            fill={PALETTE.amber}
            opacity={0.25}
            rx={3}
          />
          <polyline points={sigPts} fill="none" stroke={PALETTE.grey500} strokeWidth={1.2} />
          {/* Kernel values inside window */}
          {INIT_KERNEL.map((kv, k) => {
            const x = toX(pos + k, N_TIME);
            return (
              <text
                key={k}
                x={x}
                y={H - 4}
                textAnchor="middle"
                fill={PALETTE.amber}
                style={{ fontSize: 7, fontWeight: 600 }}
              >
                {kv.toFixed(1)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Dot product value */}
      <div
        className="text-center text-sm font-mono font-semibold mb-3 py-1 rounded"
        style={{ background: PALETTE.grey200, color: PALETTE.grey900 }}
      >
        dot product = {dotProduct.toFixed(4)}
      </div>

      {/* Output being drawn */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-3">
        <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
          Convolution output: Feature Maps — {OUT_LEN} samples
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke={PALETTE.grey200} strokeWidth={0.5} />
          <polyline points={outPts} fill="none" stroke={PALETTE.blue} strokeWidth={1.5} />
          {pos < OUT_LEN && (
            <circle cx={toX(pos, OUT_LEN)} cy={toY(output[pos], outMax)} r={3.5} fill={PALETTE.blue} />
          )}
        </svg>
      </div>

      {/* Kernel bar chart */}
      <div className="mt-3 bg-white rounded-lg shadow border border-neutral-200 p-3">
        <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.grey500 }}>
          Kernel weights (size {KERNEL_SIZE})
        </div>
        <div className="flex items-end justify-center gap-3" style={{ height: 50 }}>
          {INIT_KERNEL.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="rounded-sm"
                style={{
                  width: 24,
                  height: Math.max(2, v * 40),
                  background: PALETTE.amber,
                }}
              />
              <span className="text-[9px] mt-0.5" style={{ color: PALETTE.grey500 }}>
                {v.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
