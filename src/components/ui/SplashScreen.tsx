"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  /** Whether the splash is still visible */
  visible: boolean;
  /** Called once the exit animation finishes */
  onComplete: () => void;
}

/**
 * Full-screen splash overlay that displays the name "Xueqi Yang"
 * with a soft fade-in entrance, then fades out when `visible` becomes false.
 *
 * The background matches the pink sky so the transition to the 3D scene
 * feels seamless.
 */
export default function SplashScreen({ visible, onComplete }: SplashScreenProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(180deg, #C8EDE8 0%, #FFF8D6 100%)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* Name — responsive sizing down to small phones */}
          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.06em] text-center select-none px-4"
            style={{ color: "#6858A0" }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
          >
            👋 Hey, I&apos;m Xueqi Yang
          </motion.h1>

          {/* Subtle tagline */}
          <motion.p
            className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg tracking-[0.15em] select-none"
            style={{ color: "#9888B8" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
          >
            Nice to meet you!
          </motion.p>

          {/* Decorative horizontal line */}
          <motion.div
            className="mt-6 sm:mt-8 h-px rounded-full"
            style={{ background: "#C4A8D8", width: 80 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 1.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
