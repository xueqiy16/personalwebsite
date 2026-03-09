"use client";

import { useState } from "react";
import { PALETTE } from "./constants";

interface Block {
  id: string;
  label: string;
  shape: string;
  dims: string;
  section: string;
  color: string;
}

const BLOCKS: Block[] = [
  { id: "input", label: "Input", shape: "(8, 100)", dims: "8 ch × 100 t", section: "section-2", color: PALETTE.grey500 },
  { id: "temp", label: "Temporal\nConv", shape: "kernel (5,)", dims: "8 × 96", section: "section-5", color: PALETTE.blue },
  { id: "spat", label: "Spatial\nConv", shape: "weights (8,)", dims: "96", section: "section-6", color: PALETTE.indigo },
  { id: "elu", label: "ELU", shape: "α = 1.0", dims: "96", section: "section-7", color: PALETTE.green },
  { id: "pool", label: "Avg\nPool", shape: "pool = 4", dims: "24", section: "section-7", color: PALETTE.amber },
  { id: "fc", label: "FC", shape: "W (2, 24)", dims: "2", section: "section-8", color: PALETTE.rose },
  { id: "soft", label: "Softmax", shape: "—", dims: "[p₀, p₁]", section: "section-8", color: "#a855f7" },
];

const BW = 80;
const BH = 56;
const GAP = 16;
const PAD = 20;
const SVG_W = PAD * 2 + BLOCKS.length * BW + (BLOCKS.length - 1) * GAP;
const SVG_H = 140;

export default function ArchitectureDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ minWidth: 600 }}>
        {BLOCKS.map((b, i) => {
          const x = PAD + i * (BW + GAP);
          const y = (SVG_H - BH) / 2;
          const isHov = hovered === b.id;

          return (
            <g
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => scrollTo(b.section)}
              style={{ cursor: "pointer" }}
            >
              {/* Arrow from previous block */}
              {i > 0 && (
                <line
                  x1={x - GAP}
                  y1={SVG_H / 2}
                  x2={x - 2}
                  y2={SVG_H / 2}
                  stroke={PALETTE.grey300}
                  strokeWidth={1.5}
                  markerEnd="url(#arch-arrow)"
                />
              )}
              {/* Block */}
              <rect
                x={x}
                y={y}
                width={BW}
                height={BH}
                rx={8}
                fill={isHov ? b.color : PALETTE.white}
                stroke={b.color}
                strokeWidth={isHov ? 2 : 1.5}
                style={{ transition: "fill 0.15s, stroke-width 0.15s" }}
              />
              {/* Label */}
              {b.label.split("\n").map((line, li) => (
                <text
                  key={li}
                  x={x + BW / 2}
                  y={y + (b.label.includes("\n") ? 20 + li * 14 : BH / 2 + 1)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHov ? PALETTE.white : PALETTE.grey700}
                  style={{ fontSize: 10, fontWeight: 600, pointerEvents: "none", transition: "fill 0.15s" }}
                >
                  {line}
                </text>
              ))}
              {/* Tooltip on hover */}
              {isHov && (
                <g>
                  <rect
                    x={x - 10}
                    y={y + BH + 6}
                    width={BW + 20}
                    height={30}
                    rx={4}
                    fill={PALETTE.grey900}
                    opacity={0.9}
                  />
                  <text
                    x={x + BW / 2}
                    y={y + BH + 17}
                    textAnchor="middle"
                    fill={PALETTE.white}
                    style={{ fontSize: 8 }}
                  >
                    {b.shape}
                  </text>
                  <text
                    x={x + BW / 2}
                    y={y + BH + 28}
                    textAnchor="middle"
                    fill={PALETTE.grey300}
                    style={{ fontSize: 7 }}
                  >
                    out: {b.dims}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="arch-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L6,2.5 L0,5" fill="none" stroke={PALETTE.grey300} strokeWidth="1" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
