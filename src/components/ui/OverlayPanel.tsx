"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { audio } from "@/lib/audio";

interface OverlayPanelProps {
  title: string;
  children: React.ReactNode;
  /** Max width class (default: max-w-3xl) */
  maxWidth?: string;
  /** Whether to center the title (default: false) */
  centerTitle?: boolean;
}

/**
 * Shared glass-panel wrapper used by every overlay.
 *
 * Features:
 * - Semi-transparent frosted background
 * - Title bar with close button
 * - Scrollable content area
 * - Framer Motion entrance/exit
 * - Clicking the backdrop calls goBack()
 */
export default function OverlayPanel({
  title,
  children,
  maxWidth = "max-w-3xl",
  centerTitle = false,
}: OverlayPanelProps) {
  const goBack = useStore((s) => s.goBack);

  const handleClose = () => {
    audio.playBack();
    goBack();
  };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Click / tap away backdrop */}
      <div className="absolute inset-0 bg-black/8" onClick={handleClose} />

      {/* Panel — responsive max-height and padding */}
      <motion.div
        className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh] md:max-h-[85vh] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col`}
        style={{
          background: "rgba(244, 236, 240, 0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 8px 40px rgba(88, 72, 136, 0.12)",
          border: "1px solid rgba(196, 168, 216, 0.25)",
        }}
        initial={{ y: 28, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div
          className={`flex items-center ${centerTitle ? "justify-center" : "justify-between"} px-4 sm:px-6 py-3 sm:py-4 shrink-0 relative`}
          style={{ borderBottom: "1px solid rgba(196, 168, 216, 0.2)" }}
        >
          <h2
            className={`text-lg sm:text-xl font-medium tracking-wide ${centerTitle ? "text-center flex-1" : ""}`}
            style={{ color: "#6858A0" }}
          >
            {title}
          </h2>
          <button
            onClick={handleClose}
            className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${centerTitle ? "absolute right-4 sm:right-6" : ""}`}
            style={{ color: "#9888B8" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(152,136,184,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </div>

        {/* Scrollable content — touch-scroll friendly */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex-1 overscroll-contain">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
