"use client";

import { useRef, useEffect } from "react";
import { PALETTE, P300_TEMPLATE } from "./constants";

const W = 500;
const H = 70;
const N = 200;
const SPEED = 0.8;

function seededGauss(seed: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < N * 2; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const u1 = (s / 0x7fffffff) || 0.0001;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const u2 = s / 0x7fffffff;
    out.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.2);
  }
  return out;
}

const NOISE_A = seededGauss(42);
const NOISE_B = seededGauss(99);

function embedP300(noise: number[]): number[] {
  const out = [...noise];
  const period = N;
  for (let start = 0; start < out.length; start += period) {
    const onset = start + 40;
    for (let k = 0; k < P300_TEMPLATE.length; k++) {
      if (onset + k < out.length) out[onset + k] += P300_TEMPLATE[k] * 1.5;
    }
  }
  return out;
}

const TEMPLATE_SIGNAL = (() => {
  const out: number[] = [];
  const period = N;
  for (let i = 0; i < N * 2; i++) {
    const pos = i % period;
    if (pos >= 40 && pos < 40 + P300_TEMPLATE.length) {
      out.push(P300_TEMPLATE[pos - 40] * 1.5);
    } else {
      out.push(0);
    }
  }
  return out;
})();

const HIT_SIGNAL = embedP300(NOISE_A);
const NOHIT_SIGNAL = [...NOISE_B];

interface WaveConfig {
  label: string;
  data: number[];
  color: string;
  max: number;
}

const WAVES: WaveConfig[] = [
  { label: "P300 Template", data: TEMPLATE_SIGNAL, color: PALETTE.rose, max: 1.8 },
  { label: "Hit Trial (Pz)", data: HIT_SIGNAL, color: PALETTE.blue, max: 1.8 },
  { label: "No-Hit Trial (Pz)", data: NOHIT_SIGNAL, color: PALETTE.grey400, max: 1.8 },
];

function ScrollingWave({ label, data, color, max }: WaveConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;

    const dpr = window.devicePixelRatio || 1;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Zero line
      ctx.strokeStyle = PALETTE.grey200;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let px = 0; px < W; px++) {
        const dataIdx = (px + Math.floor(offsetRef.current)) % data.length;
        const idx = ((dataIdx % data.length) + data.length) % data.length;
        const v = data[idx];
        const y = H / 2 - (v / max) * (H / 2 - 6);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      offsetRef.current += SPEED;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [data, color, max]);

  return (
    <div>
      <div className="text-[11px] font-semibold mb-1" style={{ color }}>
        {label}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: W, height: H }}
        className="w-full rounded border border-neutral-100"
      />
    </div>
  );
}

export default function AnimatedWaveforms() {
  return (
    <div className="space-y-3 my-4 max-w-xl mx-auto">
      {WAVES.map((w) => (
        <ScrollingWave key={w.label} {...w} />
      ))}
    </div>
  );
}
