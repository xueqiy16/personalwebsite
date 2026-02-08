"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { audio } from "@/lib/audio";

/**
 * Fixed floating mute/unmute button in the bottom-right corner.
 *
 * Syncs the Zustand `isMuted` flag with the audio manager so
 * all SFX and background music respond to the toggle.
 */
export default function MuteToggle() {
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);

  // Keep the audio manager in sync with the store
  useEffect(() => {
    audio.setMuted(isMuted);
  }, [isMuted]);

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm cursor-pointer select-none transition-colors"
      style={{
        background: "rgba(100, 88, 160, 0.82)",
        border: "1px solid rgba(196, 168, 216, 0.4)",
        color: "#fff",
      }}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        /* Speaker-off icon */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        /* Speaker-on icon */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
