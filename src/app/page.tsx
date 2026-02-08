"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SplashScreen from "@/components/ui/SplashScreen";
import OverlayManager from "@/components/ui/OverlayManager";
import MuteToggle from "@/components/ui/MuteToggle";
import Acknowledgements from "@/components/ui/Acknowledgements";
import { useStore } from "@/store/useStore";
import { audio } from "@/lib/audio";

// Dynamically import the 3D scene with SSR disabled (Three.js requires the DOM)
const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false });

/** How long the splash stays visible before starting to fade out (ms) */
const SPLASH_DISPLAY_MS = 2800;

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDoneLocal] = useState(false);
  const setSplashDone = useStore((s) => s.setSplashDone);

  // Preload music and register the auto-unlock listener immediately.
  // The first user interaction (click, tap, keypress — anywhere) will
  // resume the AudioContext and start music without needing a specific button.
  useEffect(() => {
    audio.preloadMusic();
    audio.enableAutoUnlock();
  }, []);

  // After SPLASH_DISPLAY_MS, trigger the exit animation
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Called when the Framer Motion exit animation finishes
  const handleSplashComplete = useCallback(() => {
    setSplashDoneLocal(true);
    setSplashDone();
  }, [setSplashDone]);

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ height: "100dvh" }}>
      {/* 3D Canvas — always mounted so it pre-loads while splash is showing */}
      <Scene />

      {/* Splash overlay — sits on top of the canvas, fades out */}
      {!splashDone && (
        <SplashScreen visible={showSplash} onComplete={handleSplashComplete} />
      )}

      {/* Content overlays — appear when navigated to a section */}
      <OverlayManager />

      {/* Acknowledgements — bottom-right, above mute toggle */}
      <Acknowledgements />

      {/* Mute/unmute toggle — bottom-right corner */}
      <MuteToggle />
    </main>
  );
}
