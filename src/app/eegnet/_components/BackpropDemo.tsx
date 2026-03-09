"use client";

import { useState } from "react";
import { PALETTE } from "./constants";

interface Stage {
  id: string;
  label: string;
  equation: string;
  description: string;
  color: string;
}

const STAGES: Stage[] = [
  {
    id: "loss",
    label: "Loss → Logits",
    equation: "dL/dz = softmax(z) − one_hot(y)",
    description:
      "The starting point. We subtract the true label (as a one-hot vector: [1,0] for Hit, [0,1] for No-Hit) from the softmax probabilities. If the model said \"80% Hit\" and the answer was indeed Hit, the gradient for the Hit logit is just 0.8 − 1 = −0.2. That negative sign tells the network: push the Hit score higher next time.",
    color: "#a855f7",
  },
  {
    id: "fc",
    label: "FC Layer",
    equation: "dL/dW = outer(dL/dz, pooled)\ndL/db = dL/dz",
    description:
      "The logit gradient flows into the FC layer. For each weight, the gradient is just the logit error multiplied by the pooled value that weight was connected to — this is called an outer product. Intuitively: if a pooled value was large and the logit error was large, that weight gets a big update. The bias gradient is simply the logit error itself — no multiplication needed.",
    color: PALETTE.rose,
  },
  {
    id: "pool",
    label: "Avg Pooling",
    equation: "dL/d_input[t] = dL/d_output[t ÷ 4] / 4",
    description:
      "During the forward pass, pooling averaged every 4 values into 1. Going backwards, the gradient for that one averaged output gets split equally back to those 4 input positions — each receives exactly 1/4 of the blame. This is the reverse of averaging: distributing responsibility evenly.",
    color: PALETTE.amber,
  },
  {
    id: "elu",
    label: "ELU",
    equation: "dL/dx = dL/dy × ELU'(x)\nELU'(x) = 1 if x > 0,  α·eˣ if x ≤ 0",
    description:
      "For every value that was positive going forward, the gradient passes straight through unchanged (derivative = 1). For negative values, the gradient gets scaled by α·eˣ, which is always a small positive number — so the signal is dampened but never killed entirely. This is the key advantage over ReLU, where negative values produce zero gradient and the neuron \"dies\".",
    color: PALETTE.green,
  },
  {
    id: "spatial",
    label: "Spatial Conv",
    equation: "dL/dw[c] = Σₜ dL/dy[t] × temp_out[c, t]\ndL/d_temp[c, t] = dL/dy[t] × w[c]",
    description:
      "Two separate gradients come out of this step. First, the gradient for each spatial weight: how much should the network increase or decrease attention on each electrode? This is computed by summing over all time steps. Second, a gradient that flows further back into the temporal outputs — this one is needed so the temporal kernel can learn too. Both are just multiplications of the incoming gradient with values from the forward pass.",
    color: PALETTE.indigo,
  },
  {
    id: "temporal",
    label: "Temporal Kernel",
    equation: "dL/dk[j] = Σ over channels Σ over time  dL/d_out[c, t] × input[c, t + j]",
    description:
      "This is the deepest and most important gradient. For each of the 5 kernel values, we sum over every channel and every time position to figure out how that one kernel value contributed to the overall error. This triple sum is what gradually teaches the kernel to take on the shape of the P300 spike — it sculpts the kernel one gradient step at a time.",
    color: PALETTE.blue,
  },
];

const BLOCK_W = 80;
const BLOCK_H = 40;
const GAP = 24;
const PAD = 16;
const SVG_W = PAD * 2 + STAGES.length * BLOCK_W + (STAGES.length - 1) * GAP;
const SVG_H = 80;

export default function BackpropDemo() {
  const [step, setStep] = useState(0);

  return (
    <div>
      {/* Pipeline with gradient flow */}
      <div className="overflow-x-auto -mx-6 px-6 mb-4">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ minWidth: 500 }}>
          {STAGES.map((s, i) => {
            const x = PAD + i * (BLOCK_W + GAP);
            const y = (SVG_H - BLOCK_H) / 2;
            const isActive = i <= step;
            const isCurrent = i === step;

            return (
              <g key={s.id}>
                {/* Backward arrow */}
                {i > 0 && (
                  <line
                    x1={x - 2}
                    y1={SVG_H / 2}
                    x2={x - GAP + 2}
                    y2={SVG_H / 2}
                    stroke={i <= step ? PALETTE.rose : PALETTE.grey300}
                    strokeWidth={i <= step ? 2 : 1}
                    markerStart={i <= step ? "url(#bp-arrow-on)" : "url(#bp-arrow-off)"}
                    style={{ transition: "stroke 0.3s" }}
                  />
                )}
                <rect
                  x={x}
                  y={y}
                  width={BLOCK_W}
                  height={BLOCK_H}
                  rx={6}
                  fill={isCurrent ? s.color : isActive ? s.color : PALETTE.white}
                  stroke={s.color}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  opacity={isActive ? 1 : 0.4}
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={x + BLOCK_W / 2}
                  y={y + BLOCK_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? PALETTE.white : PALETTE.grey500}
                  style={{ fontSize: 9, fontWeight: 600, pointerEvents: "none", transition: "fill 0.3s" }}
                >
                  {s.label.split("\n").length > 1
                    ? s.label.split("\n").map((l, li) => (
                        <tspan key={li} x={x + BLOCK_W / 2} dy={li === 0 ? -5 : 12}>
                          {l}
                        </tspan>
                      ))
                    : s.label}
                </text>
              </g>
            );
          })}
          <defs>
            <marker id="bp-arrow-on" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto">
              <path d="M6,0 L0,2.5 L6,5" fill="none" stroke={PALETTE.rose} strokeWidth="1" />
            </marker>
            <marker id="bp-arrow-off" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto">
              <path d="M6,0 L0,2.5 L6,5" fill="none" stroke={PALETTE.grey300} strokeWidth="1" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: step === 0 ? PALETTE.grey200 : PALETTE.grey700,
            color: step === 0 ? PALETTE.grey400 : PALETTE.white,
          }}
        >
          ← Back
        </button>
        <span className="text-sm" style={{ color: PALETTE.grey500 }}>
          Step {step + 1} / {STAGES.length}
        </span>
        <button
          onClick={() => setStep(Math.min(STAGES.length - 1, step + 1))}
          disabled={step === STAGES.length - 1}
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{
            background: step === STAGES.length - 1 ? PALETTE.grey300 : PALETTE.rose,
          }}
        >
          Step →
        </button>
      </div>

      {/* Current stage detail */}
      <div
        className="rounded-lg p-4 border-l-4"
        style={{
          background: PALETTE.bg,
          borderColor: STAGES[step].color,
        }}
      >
        <div className="text-sm font-semibold mb-1" style={{ color: STAGES[step].color }}>
          {STAGES[step].label}
        </div>
        <pre
          className="text-xs font-mono mb-2 whitespace-pre-wrap"
          style={{ color: PALETTE.grey700 }}
        >
          {STAGES[step].equation}
        </pre>
        <p className="text-sm leading-relaxed" style={{ color: PALETTE.grey500 }}>
          {STAGES[step].description}
        </p>
      </div>
    </div>
  );
}
