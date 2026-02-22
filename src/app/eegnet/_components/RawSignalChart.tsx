"use client";

/**
 * D3.js canvas for rendering raw streaming brainwave data
 * (e.g. P300, Mu-rhythms, alpha/beta bands).
 *
 * Will use a <canvas> or <svg> element driven by D3 scales and paths.
 */
export default function RawSignalChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* TODO: Add a <canvas> or <svg> ref for D3 rendering */}
      {/* TODO: Set up D3 scales (xScale: time, yScale: µV) */}
      {/* TODO: Implement streaming line/path drawing with requestAnimationFrame */}
      {/* TODO: Add channel labels (TP9, AF7, AF8, TP10) */}
      <p className="text-sm text-neutral-400 select-none">
        [ RawSignalChart — D3 brainwave visualisation placeholder ]
      </p>
    </div>
  );
}
