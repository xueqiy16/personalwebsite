"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { audio } from "@/lib/audio";

/**
 * A floating "Back" button that appears whenever the user has navigated
 * away from the main monument view. Triggers goBack() on click.
 */
export default function BackButton() {
  const currentSection = useStore((s) => s.currentSection);
  const goBack = useStore((s) => s.goBack);
  const isMain = currentSection === "main";

  return (
    <AnimatePresence>
      {!isMain && (
        <motion.button
          key="back-btn"
          onClick={() => { audio.playBack(); goBack(); }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm cursor-pointer select-none"
          style={{
            background: "rgba(100, 88, 160, 0.82)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            border: "1px solid rgba(196, 168, 216, 0.4)",
          }}
        >
          <span style={{ fontSize: "16px" }}>&larr;</span>
          Back
        </motion.button>
      )}
    </AnimatePresence>
  );
}
