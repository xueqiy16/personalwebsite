"use client";

import { useState, useMemo } from "react";
import { Html } from "@react-three/drei";
import { useStore, type Section } from "@/store/useStore";
import { audio } from "@/lib/audio";

interface PortalProps {
  /** Position in monument-space */
  position: [number, number, number];
  /** Hit-area dimensions [width, height, depth] */
  size: [number, number, number];
  /** Which section this portal navigates to */
  section: Section;
  /** Human-readable label displayed above the portal */
  label: string;
  /** Y offset for the floating label relative to the portal center */
  labelOffsetY?: number;
  /** If set, clicking opens this URL in a new tab instead of navigating internally */
  externalUrl?: string;
}

/* Unique keyframes injected once into the document head */
const CLOUD_STYLE_ID = "portal-cloud-keyframes";
function ensureCloudStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CLOUD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CLOUD_STYLE_ID;
  style.textContent = `
    @keyframes cloudFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes cloudPulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 0.9; }
    }
    @keyframes cloudHover {
      0%, 100% { transform: translateY(0px) scale(1.08); }
      50% { transform: translateY(-4px) scale(1.12); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * An invisible interactive zone placed over a door / area of the monument.
 *
 * - Hover: shows a translucent glow box + changes cursor to pointer.
 * - Click: navigates to the target section via Zustand store.
 * - Label: floating animated cloud above the portal (only visible in main view).
 */
export default function Portal({
  position,
  size,
  section,
  label,
  labelOffsetY = 1.8,
  externalUrl,
}: PortalProps) {
  const [hovered, setHovered] = useState(false);
  const navigateTo = useStore((s) => s.navigateTo);
  const currentSection = useStore((s) => s.currentSection);
  const splashDone = useStore((s) => s.splashDone);
  const setHoveredSection = useStore((s) => s.setHoveredSection);
  const isMainView = currentSection === "main" && splashDone;

  // Randomise the animation delay per portal so they don't bob in sync
  const animDelay = useMemo(() => `${Math.random() * 2}s`, []);

  // Inject keyframes once
  useMemo(() => ensureCloudStyles(), []);

  const handleOver = () => {
    setHovered(true);
    setHoveredSection(section);
    document.body.style.cursor = "pointer";
    audio.playHover();
  };

  const handleOut = () => {
    setHovered(false);
    setHoveredSection(null);
    document.body.style.cursor = "default";
  };

  const handleClick = () => {
    audio.playClick();
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    } else {
      navigateTo(section);
    }
    document.body.style.cursor = "default";
    setHovered(false);
  };

  return (
    <group position={position}>
      {/* Floating cloud label — this IS the interactive button */}
      <Html
        position={[0, labelOffsetY, 0]}
        center
        style={{
          opacity: isMainView ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: isMainView ? "auto" : "none",
          userSelect: "none",
        }}
      >
        <div
          onMouseEnter={handleOver}
          onMouseLeave={handleOut}
          onClick={isMainView ? handleClick : undefined}
          style={{
            position: "relative",
            cursor: isMainView ? "pointer" : "default",
            animation: hovered
              ? `cloudHover 2.5s ease-in-out ${animDelay} infinite`
              : `cloudFloat 3.5s ease-in-out ${animDelay} infinite`,
          }}
        >
          {/* Cloud body */}
          <div
            style={{
              position: "relative",
              background: hovered
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "50px",
              padding: "10px 24px",
              boxShadow: hovered
                ? "0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.5), 0 4px 16px rgba(255, 255, 255, 0.3)"
                : "0 4px 20px rgba(152, 136, 184, 0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
              border: hovered
                ? "1px solid rgba(255, 255, 255, 0.9)"
                : "1px solid rgba(255, 255, 255, 0.5)",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {/* Label text */}
            <span
              style={{
                position: "relative",
                zIndex: 1,
                color: hovered ? "#5040A0" : "#7868B0",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                transition: "color 0.3s ease",
                textShadow: hovered
                  ? "0 0 8px rgba(255,255,255,0.8)"
                  : "0 1px 2px rgba(255,255,255,0.6)",
              }}
            >
              {label}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
