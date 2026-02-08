"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { useStore, type Section } from "@/store/useStore";

/**
 * Camera-target positions (scene-group offsets) and zoom levels for each
 * section.  Zoom values are relative to a desktop baseline of 45; they get
 * scaled proportionally at smaller viewports via the `baseZoom` prop.
 */
const CAMERA_TARGETS: Record<Section, { pos: [number, number, number]; zoom: number }> = {
  main:         { pos: [0,     -5.5,  0],     zoom: 45 },

  arts:         { pos: [0,     -1.5, -2.1],   zoom: 80 },
  dance:        { pos: [0,     -1.5, -2.1],   zoom: 80 },
  gymnastics:   { pos: [0,     -1.5, -2.1],   zoom: 80 },
  music:        { pos: [0,     -1.5, -2.1],   zoom: 80 },

  projects:     { pos: [-2.1,  -1.5,  0],     zoom: 80 },
  articles:     { pos: [-2.1,  -1.5,  0],     zoom: 80 },
  xposts:       { pos: [-2.1,  -1.5,  0],     zoom: 80 },
  pastprojects: { pos: [-2.1,  -1.5,  0],     zoom: 80 },

  about:        { pos: [0,     -9,    0],      zoom: 70 },
};

/** Desktop-baseline zoom value used in CAMERA_TARGETS.main */
const DESKTOP_ZOOM = 45;

interface CameraControllerProps {
  groupRef: React.RefObject<THREE.Group | null>;
  /** Current responsive base-zoom from the viewport hook (matches main zoom) */
  baseZoom?: number;
}

/**
 * Watches `currentSection` and drives GSAP tweens on the scene-group
 * position (pan) and camera zoom.  Zoom values are scaled by the ratio
 * `baseZoom / DESKTOP_ZOOM` so sub-section zooms feel proportional on
 * smaller screens.
 */
export default function CameraController({
  groupRef,
  baseZoom = DESKTOP_ZOOM,
}: CameraControllerProps) {
  const camera = useThree((s) => s.camera);
  const currentSection = useStore((s) => s.currentSection);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const target = CAMERA_TARGETS[currentSection] ?? CAMERA_TARGETS.main;
    const scale = baseZoom / DESKTOP_ZOOM;
    const scaledZoom = target.zoom * scale;

    gsap.to(group.position, {
      x: target.pos[0],
      y: target.pos[1],
      z: target.pos[2],
      duration: 1.2,
      ease: "power2.inOut",
    });

    gsap.to(camera, {
      zoom: scaledZoom,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      },
    });
  }, [currentSection, camera, groupRef, baseZoom]);

  return null;
}
