"use client";

/**
 * TD-Snap inspired word-button interface that responds to
 * simulated EEG classifier output states.
 *
 * Will render a grid of selectable word/phrase buttons and
 * highlight them based on the active signal classification.
 */
export default function ClassifierInterface() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* TODO: Build a grid of word/phrase buttons */}
      {/* TODO: Accept classifier state (e.g. "select", "idle", "error") as props or context */}
      {/* TODO: Highlight / animate the active button based on simulated P300 detection */}
      {/* TODO: Add visual feedback (glow, scale, colour shift) on selection */}
      <p className="text-sm text-neutral-400 select-none">
        [ ClassifierInterface — TD-Snap word grid placeholder ]
      </p>
    </div>
  );
}
