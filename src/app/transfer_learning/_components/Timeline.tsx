"use client";

import React, { useState } from "react";

interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  fullBody: string;
}

const timelineData: TimelineEvent[] = [
  {
    id: 1,
    year: "Early Baseline",
    title: "Classical Spatial Filtering",
    fullBody: "TL in EEGs originated in the early 2000s to solve two persisting hurdles: subject-specific calibration and inter-subject variability [1]. Initial transfer learning efforts focused on regularizing and aligning classical spatial filtering techniques -- transforming multi-channel brain signals into a lower-dimensional space to maximize the signal-to-noise (SNR) of specific neural patterns [2]."
  },
  {
    id: 2,
    year: "2012",
    title: "Riemannian Geometry Frameworks",
    fullBody: "Parallely, the field witnessed Riemannian geometry frameworks that mapped EEG trial covariance matrices onto symmetric positive definite (SPD) manifolds, mitigating domain shift before the data reaches a classifier [3]."
  },
  {
    id: 3,
    year: "2018 - 2022",
    title: "Deep Domain Adaptation",
    fullBody: "As deep learning emerged, the scope of TL shifted from geometric alignment to deep domain adaptation and domain generalization. The introduction of standard convolutional architectures adapted to neuroscientific data--such as EEGNet and DeepConvNet--provided a latent feature space that could be manipulated during training. Early deep transfer methods integrated discrepancy (or loss) metrics directly into the network's objective function [4]."
  },
  {
    id: 4,
    year: "2024 - Future",
    title: "Modern Transformers & Privacy",
    fullBody: "Current state-of-the-art frameworks leverage multi-scale convolutional layers, Graph Convolutional Networks, self-attention mechanisms or Transformers to decode temporal dependencies [5]. Modern methods prioritize conservative fine-tuning policies using minimal target data while preserving data privacy [6]. We continue to work our way towards zero-calibration!"
  }
];

export default function EegTimeline() {
  // Track active node ID
  const [activeNode, setActiveNode] = useState<number>(1);

  // Find content corresponding to active node
  const selectedEvent = timelineData.find((event) => event.id === activeNode) || timelineData[0];

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100">
      {/* Grid Layout: Left Side = Vertical Timeline, Right Side = Dynamic Detail Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[400px]">
        
        {/* TIMELINE TRACK (Left Side) */}
        <div className="md:col-span-5 relative border-l-2 border-slate-200 ml-6 space-y-12 py-4">
          {timelineData.map((event) => {
            const isSelected = activeNode === event.id;

            return (
              <div key={event.id} className="relative pl-8 group">
                
                {/* GLOWING ORANGE NODE CIRCLE BUTTON */}
                <button
                  onClick={() => setActiveNode(event.id)}
                  aria-label={`Select ${event.title}`}
                  className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full transition-all duration-300 ease-out focus:outline-none z-10
                    ${isSelected
                      ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-125 ring-4 ring-orange-100"
                      : "bg-slate-300 hover:bg-slate-400 group-hover:scale-110"
                    }`}
                />

                {/* METADATA PREVIEW (Next to node) */}
                <div
                  onClick={() => setActiveNode(event.id)}
                  className="cursor-pointer select-none"
                >
                  <span className={`text-xs font-mono font-bold tracking-wider block transition-colors duration-300
                    ${isSelected ? "text-orange-600" : "text-slate-400"}`}
                  >
                    {event.year}
                  </span>
                  <h3 className={`text-base font-semibold transition-colors duration-300 mt-0.5
                    ${isSelected ? "text-slate-900 font-bold" : "text-slate-500 group-hover:text-slate-700"}`}
                  >
                    {event.title}
                  </h3>
                </div>

              </div>
            );
          })}
        </div>

        {/* DYNAMIC DETAIL PANEL (Right Side) */}
        <div className="md:col-span-7 h-full">
          <div
            key={selectedEvent.id}
            className="bg-slate-50 border border-slate-200/60 p-8 rounded-2xl min-h-[340px] flex flex-col justify-between shadow-sm transition-all duration-300 animate-fadeIn"
          >
            <div>
              {/* Top Badge */}
              <span className="text-xs font-mono text-orange-700 font-bold uppercase tracking-widest px-3 py-1 bg-orange-50 rounded-full border border-orange-200 inline-block mb-4">
                {selectedEvent.year}
              </span>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                {selectedEvent.title}
              </h3>

              <hr className="border-slate-200 my-4" />

              {/* Body Text */}
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {selectedEvent.fullBody}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}