"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PALETTE, ELECTRODE_NAMES, P300_TEMPLATE } from "./constants";

interface Progress {
  epoch: number;
  loss: number;
  accuracy: number;
  kernelSim: number;
  kernel: number[];
  spatialWeights: number[];
  done: boolean;
}

function MiniChart({
  data,
  color,
  label,
  yDomain,
  target,
}: {
  data: number[];
  color: string;
  label: string;
  yDomain: [number, number];
  target?: number;
}) {
  const W = 300;
  const H = 100;
  const pad = { top: 16, bottom: 4, left: 0, right: 0 };
  const pW = W - pad.left - pad.right;
  const pH = H - pad.top - pad.bottom;

  if (data.length === 0)
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-2" style={{ height: H + 24 }}>
        <div className="text-[10px] font-semibold" style={{ color: PALETTE.grey400 }}>{label}</div>
      </div>
    );

  const pts = data
    .map((v, i) => {
      const x = pad.left + (i / Math.max(data.length - 1, 1)) * pW;
      const y = pad.top + (1 - (v - yDomain[0]) / (yDomain[1] - yDomain[0])) * pH;
      return `${x},${Math.max(pad.top, Math.min(pad.top + pH, y))}`;
    })
    .join(" ");

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2">
      <div className="text-[10px] font-semibold mb-0.5" style={{ color: PALETTE.grey500 }}>
        {label}{" "}
        <span className="font-mono" style={{ color }}>
          {data[data.length - 1]?.toFixed(3)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {target !== undefined && (
          <line
            x1={0}
            y1={pad.top + (1 - (target - yDomain[0]) / (yDomain[1] - yDomain[0])) * pH}
            x2={W}
            y2={pad.top + (1 - (target - yDomain[0]) / (yDomain[1] - yDomain[0])) * pH}
            stroke={PALETTE.rose}
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
      </svg>
    </div>
  );
}

export default function TrainingSimulator() {
  const [epochs, setEpochs] = useState(500);
  const [batchSize, setBatchSize] = useState(32);
  const [lr, setLr] = useState(0.01);
  const [running, setRunning] = useState(false);

  const [lossHist, setLossHist] = useState<number[]>([]);
  const [accHist, setAccHist] = useState<number[]>([]);
  const [simHist, setSimHist] = useState<number[]>([]);
  const [kernel, setKernel] = useState<number[]>([]);
  const [spatW, setSpatW] = useState<number[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  const startTraining = useCallback(() => {
    workerRef.current?.terminate();
    setLossHist([]);
    setAccHist([]);
    setSimHist([]);
    setKernel([]);
    setSpatW([]);
    setCurrentEpoch(0);
    setRunning(true);

    const w = new Worker(new URL("./eegnet-worker.ts", import.meta.url));
    workerRef.current = w;

    w.onmessage = (e: MessageEvent<Progress & { type: string }>) => {
      if (e.data.type !== "progress") return;
      const d = e.data;
      setCurrentEpoch(d.epoch);
      setLossHist((p) => [...p, d.loss]);
      setAccHist((p) => [...p, d.accuracy]);
      setSimHist((p) => [...p, d.kernelSim]);
      setKernel(d.kernel);
      setSpatW(d.spatialWeights);
      if (d.done) setRunning(false);
    };

    w.postMessage({ type: "start", epochs, batchSize, lr });
  }, [epochs, batchSize, lr]);

  return (
    <div>
      {/* Hyperparameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium" style={{ color: PALETTE.grey500 }}>
            Epochs: {epochs}
          </label>
          <input
            type="range" min={100} max={3000} step={100} value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value))}
            disabled={running}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: PALETTE.grey500 }}>
            Batch size: {batchSize}
          </label>
          <input
            type="range" min={16} max={128} step={16} value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            disabled={running}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: PALETTE.grey500 }}>
            Learning rate: {lr.toFixed(3)}
          </label>
          <input
            type="range" min={0.001} max={0.05} step={0.001} value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            disabled={running}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={startTraining}
          disabled={running}
          className="px-5 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: running ? PALETTE.grey400 : PALETTE.blue }}
        >
          {running ? `Training... epoch ${currentEpoch}` : "▶ Train"}
        </button>
        {lossHist.length > 0 && !running && (
          <span className="text-xs" style={{ color: PALETTE.green }}>
            Done — {accHist[accHist.length - 1] !== undefined ? (accHist[accHist.length - 1] * 100).toFixed(1) : 0}% accuracy
          </span>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <MiniChart data={lossHist} color={PALETTE.blue} label="Loss" yDomain={[0, 1.5]} />
        <MiniChart data={accHist} color={PALETTE.green} label="Accuracy" yDomain={[0.4, 1.05]} target={0.9} />
        <MiniChart data={simHist} color="#a855f7" label="Kernel Similarity" yDomain={[-0.2, 1.05]} target={0.8} />
      </div>

      {/* Kernel evolution + Spatial weights */}
      {kernel.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kernel shape */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-3">
            <div className="text-xs font-semibold mb-2" style={{ color: PALETTE.grey500 }}>
              Learned kernel vs P300 template
            </div>
            <div className="flex items-end justify-center gap-4" style={{ height: 80 }}>
              {kernel.map((v, i) => {
                const maxK = Math.max(...kernel.map(Math.abs), ...P300_TEMPLATE, 0.1);
                const kH = (v / maxK) * 60;
                const tH = (P300_TEMPLATE[i] / maxK) * 60;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="flex items-end gap-1" style={{ height: 64 }}>
                      <div
                        className="w-3 rounded-sm"
                        style={{
                          height: Math.abs(tH),
                          background: PALETTE.rose,
                          opacity: 0.4,
                          marginBottom: tH < 0 ? 0 : undefined,
                        }}
                      />
                      <div
                        className="w-3 rounded-sm"
                        style={{
                          height: Math.abs(kH),
                          background: PALETTE.blue,
                        }}
                      />
                    </div>
                    <span className="text-[8px]" style={{ color: PALETTE.grey400 }}>k{i}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-[9px]" style={{ color: PALETTE.rose }}>■ Template</span>
              <span className="text-[9px]" style={{ color: PALETTE.blue }}>■ Learned</span>
            </div>
          </div>

          {/* Spatial weights bar chart */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-3">
            <div className="text-xs font-semibold mb-2" style={{ color: PALETTE.grey500 }}>
              Spatial weights by electrode
            </div>
            <div className="flex items-end justify-center gap-2" style={{ height: 80 }}>
              {spatW.map((v, i) => {
                const maxS = Math.max(...spatW.map(Math.abs), 0.1);
                const h = (Math.abs(v) / maxS) * 60;
                const isPeak = i === 4 || i === 7;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-5 rounded-sm"
                      style={{
                        height: Math.max(2, h),
                        background: isPeak ? PALETTE.blue : PALETTE.grey400,
                      }}
                    />
                    <span
                      className="text-[8px] mt-0.5"
                      style={{ color: isPeak ? PALETTE.blue : PALETTE.grey400, fontWeight: isPeak ? 700 : 400 }}
                    >
                      {ELECTRODE_NAMES[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
