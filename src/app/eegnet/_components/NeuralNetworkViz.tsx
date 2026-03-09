"use client";

import { useState, useMemo, useCallback } from "react";

const LAYERS = [
  { count: 8, clickable: false },
  { count: 9, clickable: true },
  { count: 9, clickable: true },
  { count: 9, clickable: true },
  { count: 4, clickable: true },
];

const SENTENCES = [
  "EEGNet, created by Lawhern et al. in 2018, is a single CNN architecture designed to accurately classify EEG signals from different BCI paradigms while remaining computationally efficient and easy to implement [1].",
  "Since publication, EEGNet has been imported into various machine learning frameworks, such as TensorFlow, PyTorch, and scikit-learn, becoming the standard for BCI signal classification and feature extraction due to its robustness and minimal parameter requirements.",
  "The goal of this project is to build a foundational understanding of how EEGNet works from scratch, using only NumPy.",
  "Specifically, this investigation will observe how EEGNet can be used to detect the P300 Event-Related Potential (ERP).",
];

/* ── SVG layout constants ── */
const VB_W = 820;
const VB_H = 460;
const PAD_X = 80;
const PAD_TOP = 30;
const NODE_R = 14;
const GAP_Y = 44;

const C = {
  off: "#9CA3AF",
  on: "#60A5FA",
  hover: "#6366F1",
  lineOff: "#D1D5DB",
  lineOn: "#3B82F6",
};

interface NodeDef {
  id: string;
  x: number;
  y: number;
  li: number;
  ni: number;
}

interface EdgeDef {
  key: string;
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildNodes(): NodeDef[] {
  const spacing = (VB_W - 2 * PAD_X) / (LAYERS.length - 1);
  const maxCount = Math.max(...LAYERS.map((l) => l.count));
  const regionH = (maxCount - 1) * GAP_Y;
  const nodes: NodeDef[] = [];

  LAYERS.forEach((layer, li) => {
    const x = PAD_X + li * spacing;
    const layerH = (layer.count - 1) * GAP_Y;
    const startY = PAD_TOP + (regionH - layerH) / 2;
    for (let ni = 0; ni < layer.count; ni++) {
      nodes.push({ id: `${li}-${ni}`, x, y: startY + ni * GAP_Y, li, ni });
    }
  });
  return nodes;
}

function buildEdges(nodes: NodeDef[]): EdgeDef[] {
  const edges: EdgeDef[] = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const src = nodes.filter((n) => n.li === li);
    const dst = nodes.filter((n) => n.li === li + 1);
    for (const s of src) {
      for (const d of dst) {
        edges.push({
          key: `${s.id}→${d.id}`,
          from: s.id,
          to: d.id,
          x1: s.x,
          y1: s.y,
          x2: d.x,
          y2: d.y,
        });
      }
    }
  }
  return edges;
}

export default function NeuralNetworkViz() {
  const nodes = useMemo(buildNodes, []);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const [active, setActive] = useState<Set<string>>(() => {
    const s = new Set<string>();
    nodes.filter((n) => n.li === 0).forEach((n) => s.add(n.id));
    return s;
  });
  const [hovered, setHovered] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const layerHasActive = useMemo(
    () =>
      LAYERS.map((_, li) =>
        nodes.some((n) => n.li === li && active.has(n.id)),
      ),
    [active, nodes],
  );

  return (
    <div>
      <style>{`
        @keyframes nn-flow {
          from { stroke-dashoffset: 16; }
          to   { stroke-dashoffset: 0;  }
        }
      `}</style>

      <p className="text-center text-sm text-neutral-400 mb-4 italic">
        Click on the nodes to activate the network
      </p>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full max-w-3xl mx-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="nn-glow-w" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nn-glow-b" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="nn-arr-on"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L8,3 L0,6"
              fill="none"
              stroke={C.on}
              strokeWidth="1.5"
            />
          </marker>
          <marker
            id="nn-arr-off"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L8,3 L0,6"
              fill="none"
              stroke={C.off}
              strokeWidth="1.5"
            />
          </marker>
        </defs>

        {/* ── Connection lines ── */}
        {edges.map((e) => {
          const lit = active.has(e.from) && active.has(e.to);
          return (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={lit ? C.lineOn : C.lineOff}
              strokeWidth={lit ? 1.2 : 0.5}
              strokeOpacity={lit ? 0.7 : 0.12}
              strokeDasharray={lit ? "4 2" : "none"}
              style={{
                transition:
                  "stroke 0.3s, stroke-width 0.3s, stroke-opacity 0.3s",
                animation: lit ? "nn-flow 0.8s linear infinite" : "none",
              }}
            />
          );
        })}

        {/* ── Nodes ── */}
        {nodes.map((n) => {
          const isOn = active.has(n.id);
          const isHov = hovered === n.id;
          const click = LAYERS[n.li].clickable;

          let fill = "transparent";
          let stroke = C.off;
          let filter: string | undefined;

          if (isOn) {
            fill = C.on;
            stroke = C.on;
            filter = "url(#nn-glow-b)";
          }
          if (isHov && click) {
            filter = "url(#nn-glow-w)";
            if (!isOn) stroke = C.hover;
          }

          return (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
              filter={filter}
              style={{
                cursor: click ? "pointer" : "default",
                transition: "fill 0.2s, stroke 0.2s",
              }}
              onMouseEnter={click ? () => setHovered(n.id) : undefined}
              onMouseLeave={click ? () => setHovered(null) : undefined}
              onClick={click ? () => toggle(n.id) : undefined}
            />
          );
        })}

        {/* ── Output arrows ── */}
        {nodes
          .filter((n) => n.li === LAYERS.length - 1)
          .map((n) => {
            const isOn = active.has(n.id);
            return (
              <line
                key={`arr-${n.id}`}
                x1={n.x + NODE_R + 4}
                y1={n.y}
                x2={n.x + NODE_R + 28}
                y2={n.y}
                stroke={isOn ? C.on : C.off}
                strokeWidth={1.5}
                markerEnd={isOn ? "url(#nn-arr-on)" : "url(#nn-arr-off)"}
                style={{ transition: "stroke 0.3s" }}
              />
            );
          })}
      </svg>

      {/* ── Progressive sentence reveal ── */}
      <div className="mt-8 space-y-3 text-base leading-relaxed" style={{ color: "#1a1a1a", fontFamily: "'Calibri', 'Carlito', 'Segoe UI', sans-serif" }}>
        {SENTENCES.map((s, i) => {
          const vis = layerHasActive[i + 1];
          return (
            <p
              key={i}
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              {s}
            </p>
          );
        })}
      </div>
    </div>
  );
}
